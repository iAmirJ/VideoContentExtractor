from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, database, schemas

router = APIRouter()

# 1. GET PROFILE API
@router.get("/{user_id}")
def get_profile(user_id: int, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Videos count ki calculation
    videos_count = db.query(models.VideoProject).filter(models.VideoProject.user_id == user_id).count()
    
    # Date formatting (e.g., Apr 2026)
    joined_date = "New User"
    if user.created_at:
        joined_date = user.created_at.strftime("%b %Y")
    
    return {
        "fullName": user.full_name or user.username or "",
        "email": user.email or "",
        "role": user.role or "",
        "joinedDate": joined_date,
        "plan": "Free" if user.plan_id == 1 else "Pro",
        "videosAnalyzed": videos_count,
        "exportsCreated": 0
    }

# 2. UPDATE PROFILE API
@router.put("/{user_id}")
def update_profile(user_id: int, profile_data: schemas.ProfileUpdate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Naye columns (jo humne database mein add kiye thay) unme data save ho raha hai
    user.full_name = profile_data.full_name
    user.role = profile_data.role
    user.email = profile_data.email
    
    db.commit()
    return {"message": "Profile updated successfully"}