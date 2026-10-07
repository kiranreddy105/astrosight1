from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    favorite_planet: Optional[str] = None
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar: str
    role: str
    favorite_planet: str
    created_at: str
    analyses_count: int = 0

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Validation & Analysis Schemas
class CraterItem(BaseModel):
    id: str
    name: str
    x: float
    y: float
    radius: float
    diameter_px: float
    diameter_km: float
    confidence: float
    bbox: List[float] # [x_min, y_min, x_max, y_max]

class ValidationResult(BaseModel):
    is_valid: bool
    state: str # "INVALID", "VALID_NO_CRATER", "VALID_CRATER_DETECTED"
    title: str
    message: str
    detected_planet: str
    planet_confidence: float
    details: Dict[str, Any]

class CraterClassificationResult(BaseModel):
    label: str # "CRATER" or "NON-CRATER"
    confidence: float
    model_version: str

class SpatialDistanceRequest(BaseModel):
    crater_a: CraterItem
    crater_b: CraterItem
    resolution_m_per_px: float = 10.0

class SpatialDistanceResult(BaseModel):
    pixel_distance: float
    real_distance_m: float
    real_distance_km: float
    crater_a_name: str
    crater_b_name: str
    resolution_m_per_px: float

class AnalysisSummaryResponse(BaseModel):
    id: str
    filename: str
    image_url: str
    planet: str
    validation_state: str
    validation_message: Optional[str]
    classification_label: str
    classification_confidence: float
    crater_count: int
    average_confidence: float
    resolution_m_per_px: float
    craters: List[CraterItem]
    spatial_measurements: List[Dict[str, Any]]
    report_url: Optional[str]
    created_at: str

class PortalStatsResponse(BaseModel):
    total_analyses: int
    craters_detected: int
    average_confidence: float
    spatial_measurements: int
    recent_analyses: List[AnalysisSummaryResponse]

class ModelPerformanceMetrics(BaseModel):
    architecture: str
    classification_classes: List[str]
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    validation_accuracy: float
    validation_loss: float
    confusion_matrix: Dict[str, Dict[str, int]]
    dataset_name: str
    total_samples_evaluated: int
    training_epochs: int
    status: str
