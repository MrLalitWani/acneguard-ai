import datetime
import json
import time
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, get_db, Base
from . import models, schemas, auth
from .ml.cnn_model import analyze_skin
from .ml.diet_model import predict_diet_risk

# Create tables if not present
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None
)

# Production security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.ENVIRONMENT == "production" else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Health check endpoint for Docker / Kubernetes liveness & readiness probes
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

# Authentication Endpoints
@app.post("/auth/register", response_model=schemas.Token)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists"
        )
    
    # Create new user
    hashed_pwd = auth.get_password_hash(user_in.password)
    user = models.User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pwd
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate token
    access_token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/auth/me", response_model=schemas.UserOut)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/auth/profile", response_model=schemas.UserOut)
def update_profile(
    profile_data: schemas.ProfileUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.name is not None:
        current_user.name = profile_data.name
    if profile_data.email is not None:
        # Check if email is being changed and is already taken
        if profile_data.email != current_user.email:
            existing = db.query(models.User).filter(models.User.email == profile_data.email).first()
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="This email address is already in use."
                )
            current_user.email = profile_data.email
            
    db.commit()
    db.refresh(current_user)
    return current_user

@app.post("/auth/forgot-password")
def forgot_password(req: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user:
        # Avoid leaking user existence, return generic success
        return {"message": "If this email is registered, a password reset link has been generated."}
    
    # Mock generating a reset token
    reset_token = auth.create_access_token(data={"sub": user.email, "reset": True}, expires_delta=datetime.timedelta(minutes=15))
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    print("\n" + "="*50)
    print(f"PASSWORD RESET REQUEST FOR: {user.email}")
    print(f"RESET LINK: {reset_link}")
    print("="*50 + "\n")
    
    return {"message": "If this email is registered, a password reset link has been generated."}

@app.post("/auth/reset-password")
def reset_password(req: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = auth.decode_access_token(req.token)
    if not payload or not payload.get("reset"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid or has expired."
        )
    
    email = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    user.hashed_password = auth.get_password_hash(req.new_password)
    db.commit()
    return {"message": "Your password has been successfully reset."}

# Skin Assessment Endpoints
@app.post("/analyze", response_model=schemas.AssessmentOut)
async def analyze(
    file: UploadFile = File(...),
    user_routine: Optional[str] = Form(None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type and size limit
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload an image file (JPG, PNG, or WEBP)."
        )

    # Read file bytes
    file_bytes = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Uploaded image exceeds maximum allowable limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )
    
    # Run PyTorch skin classification pipeline
    try:
        analysis_result = analyze_skin(file_bytes)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
        
    severity = analysis_result["severity"]
    acne_type = analysis_result["acne_type"]
    location = analysis_result["location"]
    region_scores = analysis_result["region_scores"]
    skin_score = analysis_result["skin_score"]

    # Gather suggestions
    diet_sug = "Focus on a low glycemic index diet, drinking more water, and reducing refined dairy products."
    skincare_sug = "Use a gentle salicylic acid cleanser, followed by a non-comedogenic hyaluronic acid moisturizer."
    lifestyle_sug = "Aim for at least 7.5 hours of sleep, manage stress via breathing practices, and exercise 3 times a week."
    
    why_happened = f"The visual skin analysis detected {severity.lower()} active acne. This is typically driven by sebum hypersecretion and localized pore inflammation."
    if acne_type == "cystic":
        why_happened = f"We detected cystic acne elements. These are deeper, painful lesions triggered by bacterial activity and hormonal fluctuations."
    elif acne_type == "comedonal":
        why_happened = f"The scan detected comedonal acne. This is characterized by clogged skin pores (blackheads and whiteheads) caused by oil and dead skin buildup."
    
    explanation_obj = {
        "skin_score": skin_score,
        "why_it_happened": why_happened,
        "diet_suggestions": diet_sug,
        "skincare_routine_suggestions": skincare_sug,
        "lifestyle_adjustments": lifestyle_sug
    }

    # Save to database
    assessment = models.Assessment(
        user_id=current_user.id,
        severity=severity,
        acne_type=acne_type,
        location=location,
        region_scores=json.dumps(region_scores),
        explanation=json.dumps(explanation_obj)
    )
    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    # Format response matching AssessmentOut schema
    return {
        "assessment_id": assessment.id,
        "analysis": {
            "severity": severity,
            "acne_type": acne_type,
            "location": location,
            "localization": {
                "region_scores": region_scores
            }
        },
        "explanation": explanation_obj
    }

@app.get("/assessments", response_model=List[schemas.HistoryItemOut])
def get_assessments(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    assessments = db.query(models.Assessment).filter(
        models.Assessment.user_id == current_user.id
    ).order_by(models.Assessment.created_at.desc()).all()

    results = []
    for item in assessments:
        try:
            r_scores = json.loads(item.region_scores)
            expl = json.loads(item.explanation)
        except Exception:
            r_scores = {"Forehead": 0.25, "Left Cheek": 0.25, "Right Cheek": 0.25, "Chin": 0.25}
            expl = {
                "skin_score": 80,
                "why_it_happened": "Skin assessment complete.",
                "diet_suggestions": "N/A",
                "skincare_routine_suggestions": "N/A",
                "lifestyle_adjustments": "N/A"
            }

        results.append({
            "id": item.id,
            "created_at": item.created_at,
            "severity": item.severity,
            "acne_type": item.acne_type,
            "location": item.location,
            "region_scores": r_scores,
            "explanation": expl
        })
    return results

@app.delete("/assessments/{assessment_id}")
def delete_assessment(
    assessment_id: str,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(models.Assessment).filter(
        models.Assessment.id == assessment_id,
        models.Assessment.user_id == current_user.id
    ).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment record not found or unauthorized to delete."
        )
        
    db.delete(assessment)
    db.commit()
    return {"message": "Assessment deleted successfully."}

# Diet Check Endpoints
@app.post("/diet/predict", response_model=schemas.DietPredictOut)
def predict_diet(
    diet_in: schemas.DietPredictIn,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Run ML risk predictor model
    dict_input = diet_in.dict()
    prediction = predict_diet_risk(dict_input)

    # Save to database
    diet_check = models.DietCheck(
        user_id=current_user.id,
        risk_level=prediction["risk_level"],
        confidence_score=prediction["confidence_score"],
        main_causes=json.dumps(prediction["main_causes"]),
        recommendations=json.dumps(prediction["recommendations"])
    )
    db.add(diet_check)
    db.commit()

    return prediction
