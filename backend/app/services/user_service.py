import secrets
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models import User, Analysis
from ..schemas import UserRegisterRequest, UserLoginRequest, UpdateProfileRequest, ChangePasswordRequest
from .authentication import hash_password, verify_password, create_access_token

# In-memory reset tokens for password recovery (token -> email)
RESET_TOKENS = {}

def register_user(db: Session, request: UserRegisterRequest) -> User:
    existing_user = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A researcher with this email is already registered."
        )
    user = User(
        name=request.name.strip(),
        email=request.email.lower().strip(),
        hashed_password=hash_password(request.password),
        role="Planetary Surface Specialist",
        favorite_planet="Moon"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, request: UserLoginRequest) -> tuple[User, str]:
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Verify your mission email and password."
        )
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return user, token

def update_user_profile(db: Session, user: User, request: UpdateProfileRequest) -> User:
    if request.name:
        user.name = request.name.strip()
    if request.role:
        user.role = request.role.strip()
    if request.favorite_planet:
        user.favorite_planet = request.favorite_planet.strip()
    if request.avatar:
        user.avatar = request.avatar.strip()
    db.commit()
    db.refresh(user)
    return user

def change_user_password(db: Session, user: User, request: ChangePasswordRequest) -> None:
    if not verify_password(request.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed."
        )
    user.hashed_password = hash_password(request.new_password)
    db.commit()

def generate_password_reset_token(db: Session, email: str) -> str:
    user = db.query(User).filter(User.email == email.lower()).first()
    if not user:
        # Avoid user enumeration in public API
        return "RESET_TOKEN_GENERATED"
    token = secrets.token_urlsafe(32)
    RESET_TOKENS[token] = email.lower()
    return token

def reset_user_password(db: Session, token: str, new_password: str) -> None:
    email = RESET_TOKENS.get(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.hashed_password = hash_password(new_password)
    db.commit()
    del RESET_TOKENS[token]

def get_user_stats(db: Session, user: User) -> dict:
    analyses = db.query(Analysis).filter(Analysis.user_id == user.id).all()
    total_analyses = len(analyses)
    craters_detected = sum(a.crater_count for a in analyses)
    total_conf = sum(a.average_confidence for a in analyses if a.crater_count > 0)
    avg_conf = round(total_conf / max(1, len([a for a in analyses if a.crater_count > 0])), 1) if analyses else 0.0
    
    # Calculate total spatial measurements count
    import json
    spatial_count = 0
    for a in analyses:
        try:
            measurements = json.loads(a.spatial_measurements_json or "[]")
            spatial_count += len(measurements)
        except Exception:
            pass

    return {
        "total_analyses": total_analyses,
        "craters_detected": craters_detected,
        "average_confidence": avg_conf,
        "spatial_measurements": spatial_count
    }
