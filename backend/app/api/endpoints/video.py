from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app import models, database
from app.services.video_service import process_video_with_gemini
from app.services.video_shortener import VideoShortenerService
from app.core.config import settings
from pydantic import BaseModel
import os
import shutil
from pathlib import Path

router = APIRouter()

# --- REQUEST MODELS ---
class ShortenVideoRequest(BaseModel):
    url: str
    user_id: int
    target_duration: int = 60  # default 1 minute

# --- HELPER: Create shortening tracker in DB if needed ---
async def process_video_shortening_background(url: str, user_id: int, target_duration: int, request_id: str):
    """Background task to download and shorten video."""
    try:
        shortener = VideoShortenerService()

        # Prepare directories
        processing_dir = Path("temp_shorts")
        processing_dir.mkdir(exist_ok=True)

        # Download video into processing folder
        temp_file = str(processing_dir / f"video_{request_id}.mp4")
        if not shortener.download_youtube_video(url, temp_file):
            print(f"❌ Failed to download video for request {request_id}")
            return

        # Create shortened version (first into processing folder)
        short_processing_path = str(processing_dir / f"short_{request_id}.mp4")
        if not shortener.create_short_version(temp_file, short_processing_path, max_duration=target_duration):
            print(f"❌ Failed to shorten video for request {request_id}")
            shortener.cleanup(temp_file)
            return

        # Move final short video into uploads/static folder so it is served at /static/
        final_name = f"short_{request_id}.mp4"
        final_path = os.path.join(settings.UPLOAD_DIR, final_name)
        try:
            shutil.move(short_processing_path, final_path)
        except Exception:
            # As a fallback, try copy
            shutil.copy(short_processing_path, final_path)

        # Get summary from the final file
        summary_data = shortener.get_video_summary(final_path)

        print(f"✅ Video shortening complete for request {request_id}")
        print(f"   Duration: {summary_data['duration']:.1f}s")
        print(f"   Key points: {len(summary_data['key_points'])}")

        # Store result (simplified - store in temp with request_id as key)
        result_file = str(processing_dir / f"result_{request_id}.json")
        import json
        with open(result_file, 'w') as f:
            json.dump({
                'short_video_file': final_path,
                'summary': summary_data,
                'url': f"/static/{final_name}",
                'status': 'completed'
            }, f)

        # Cleanup original
        shortener.cleanup(temp_file)
        
    except Exception as e:
        print(f"❌ Error in video shortening: {str(e)}")

# --- CORE FEATURES ---

# 1. SUMMARIZE VIDEO
@router.post("/summarize")
def submit_video(url: str, user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    # Thumbnail Extraction
    vid_id = "default"
    if "v=" in url:
        try: vid_id = url.split("v=")[1].split("&")[0]
        except: pass
    elif "youtu.be" in url:
        try: vid_id = url.split("/")[-1]
        except: pass
    
    thumbnail = f"https://img.youtube.com/vi/{vid_id}/mqdefault.jpg"

    # Create Project
    project = models.VideoProject(
        user_id=user_id, source_url=url, title="Processing Video...",
        thumbnail_url=thumbnail, status="Queued"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    # Tracker
    tracker = models.ProcessingRequest(project_id=project.project_id, job_status="Queued", progress_percent=0)
    db.add(tracker)
    db.commit()

    # Start Processing
    background_tasks.add_task(process_video_with_gemini, project.project_id, url, db)
    
    return {"project_id": project.project_id}

# 2. VIEW HISTORY
@router.get("/history/{user_id}")
def get_history(user_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.VideoProject).filter(models.VideoProject.user_id == user_id).order_by(models.VideoProject.created_at.desc()).all()

# 3. GET RESULT
@router.get("/status/{project_id}")
def get_status(project_id: int, db: Session = Depends(database.get_db)):
    tracker = db.query(models.ProcessingRequest).filter_by(project_id=project_id).first()
    if not tracker: raise HTTPException(status_code=404)
    
    res = {
        "status": tracker.job_status, 
        "progress": tracker.progress_percent, 
        "summary": None,
        "blog": None
    }
    
    if tracker.job_status == "Completed":
        summ = db.query(models.Summary).filter_by(project_id=project_id).first()
        if summ: 
            res["summary"] = summ.concise_summary
            res["blog"] = summ.blog_post_content
            
    return res

# --- NEW: VIDEO SHORTENING FEATURE ---

# 4. SHORTEN VIDEO
@router.post("/shorten-video")
async def shorten_video(request: ShortenVideoRequest, background_tasks: BackgroundTasks):
    """
    Takes a YouTube URL and creates a shortened version (1 minute by default).
    Returns: {request_id, status: 'processing'}
    """
    import uuid
    
    request_id = str(uuid.uuid4())[:8]
    
    print(f"🚀 Starting video shortening for request: {request_id}")
    print(f"   URL: {request.url}")
    print(f"   Target duration: {request.target_duration}s")
    
    # Start background task
    background_tasks.add_task(
        process_video_shortening_background,
        request.url,
        request.user_id,
        request.target_duration,
        request_id
    )
    
    return {
        "request_id": request_id,
        "status": "processing",
        "message": "Video shortening started. Check status periodically."
    }

# 5. GET SHORTENING STATUS
@router.get("/shorten-status/{request_id}")
def get_shorten_status(request_id: str):
    """Check the status of a video shortening request."""
    import json
    
    result_file = f"temp_shorts/result_{request_id}.json"
    
    if os.path.exists(result_file):
        try:
            with open(result_file, 'r') as f:
                return json.load(f)
        except:
            pass
    
    return {
        "request_id": request_id,
        "status": "processing",
        "message": "Still processing. Please wait..."
    }