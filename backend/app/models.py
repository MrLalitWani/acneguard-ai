import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    assessments = relationship("Assessment", back_populates="user", cascade="all, delete-orphan")
    diet_checks = relationship("DietCheck", back_populates="user", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    severity = Column(String, nullable=False)
    acne_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    region_scores = Column(Text, nullable=True)  # JSON string
    explanation = Column(Text, nullable=True)    # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="assessments")

class DietCheck(Base):
    __tablename__ = "diet_checks"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    risk_level = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    main_causes = Column(Text, nullable=True)       # JSON string
    recommendations = Column(Text, nullable=True)   # JSON string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="diet_checks")
