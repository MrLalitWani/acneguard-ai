import datetime
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

try:
    import email_validator
    from pydantic import EmailStr
except Exception:
    EmailStr = str

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

# Profile Update Schema
class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

# Assessment Schemas
class RegionScores(BaseModel):
    Forehead: float
    Left_Cheek: float = Field(..., alias="Left Cheek")
    Right_Cheek: float = Field(..., alias="Right Cheek")
    Chin: float

    class Config:
        populate_by_name = True

class LocalizationOut(BaseModel):
    region_scores: Dict[str, float]

class AnalysisOut(BaseModel):
    severity: str
    acne_type: Optional[str] = None
    location: Optional[str] = None
    localization: LocalizationOut

class ExplanationOut(BaseModel):
    skin_score: int
    why_it_happened: str
    diet_suggestions: str
    skincare_routine_suggestions: str
    lifestyle_adjustments: str

class AssessmentOut(BaseModel):
    assessment_id: str
    analysis: AnalysisOut
    explanation: ExplanationOut

class HistoryItemOut(BaseModel):
    id: str
    created_at: datetime.datetime
    severity: str
    acne_type: Optional[str] = None
    location: Optional[str] = None
    region_scores: Dict[str, float]
    explanation: ExplanationOut

    class Config:
        from_attributes = True

# Diet Predict Schemas
class DietPredictIn(BaseModel):
    diet_type: str
    specific_food_item: str
    sugar_intake: str
    dairy_intake: str
    processed_food_freq: str
    spicy_food_freq: str
    oily_food_level: str
    water_intake_liters: float
    sleep_hours: int
    stress_level: int
    exercise: str
    skin_type: str

class DietPredictOut(BaseModel):
    risk_level: str
    confidence_score: float
    main_causes: List[str]
    recommendations: List[str]
