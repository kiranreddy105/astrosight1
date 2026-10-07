import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar = Column(String(255), default="/avatars/astronaut.png")
    role = Column(String(100), default="Planetary Surface Specialist")
    favorite_planet = Column(String(50), default="Moon")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    planet = Column(String(50), default="Moon")
    validation_state = Column(String(50), nullable=False)  # INVALID, VALID_NO_CRATER, VALID_CRATER_DETECTED
    validation_message = Column(String(255), nullable=True)
    classification_label = Column(String(50), default="CRATER")
    classification_confidence = Column(Float, default=0.0)
    crater_count = Column(Integer, default=0)
    average_confidence = Column(Float, default=0.0)
    resolution_m_per_px = Column(Float, default=10.0)
    craters_json = Column(Text, default="[]")
    spatial_measurements_json = Column(Text, default="[]")
    report_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="analyses")
