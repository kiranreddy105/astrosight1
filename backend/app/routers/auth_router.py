from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Analysis
from ..schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
    UpdateProfileRequest,
    UserResponse,
    AuthTokenResponse
)
from ..services.authentication import get_current_user
from ..services.user_service import (
    register_user,
    authenticate_user,
    update_user_profile,
    change_user_password,
    generate_password_reset_token,
    reset_user_password
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

def serialize_user(user: User, db: Session) -> UserResponse:
    analyses_count = db.query(Analysis).filter(Analysis.user_id == user.id).count()
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        avatar=user.avatar,
        role=user.role,
        favorite_planet=user.favorite_planet,
        created_at=user.created_at.isoformat(),
        analyses_count=analyses_count
    )

@router.post("/register", response_model=AuthTokenResponse)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, request)
    _, token = authenticate_user(db, UserLoginRequest(email=request.email, password=request.password))
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=serialize_user(user, db)
    )

@router.post("/login", response_model=AuthTokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    user, token = authenticate_user(db, request)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=serialize_user(user, db)
    )

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": "Mission session ended successfully."}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return serialize_user(current_user, db)

@router.put("/profile", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = update_user_profile(db, current_user, request)
    return serialize_user(user, db)

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    change_user_password(db, current_user, request)
    return {"message": "Security passcode updated successfully."}

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    token = generate_password_reset_token(db, request.email)
    return {
        "message": "Password reset instructions dispatched.",
        "reset_token": token
    }

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    reset_user_password(db, request.token, request.new_password)
    return {"message": "Passcode reset completed. You may now authenticate."}
