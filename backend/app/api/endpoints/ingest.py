import shutil
import os
import uuid
from typing import List, Optional, Dict
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form, Query
from app.services.transcription import TranscriptionService
from app.services.vector_store import VectorDBService
from dotenv import load_dotenv
load_dotenv()
router = APIRouter()

# Initialize the services for transcription and database operations
transcription_service = TranscriptionService()
vector_db = VectorDBService()

# Create a temporary directory for file uploads if it doesn't exist
TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)

# Global dictionary to store the live status of video processing
# The frontend will poll this to get updates
processing_status: Dict[str, dict] = {}

async def process_video_background(file_path: str, video_id: str, user_id: str, original_filename: str):
    """
    Background task that handles the heavy processing.
    It updates the 'processing_status' dictionary at each step.
    """
    print(f"Starting processing for Video ID: {video_id} (User: {user_id})")
    
    try:
        # Step 1: Extract Audio
        # We update the status so the frontend shows 10%
        processing_status[video_id] = {
            "status": "processing", 
            "message": "Extracting Audio from Video...", 
            "progress": 10
        }
        
        audio_path = f"{file_path}.mp3"
        transcription_service.extract_audio(file_path, audio_path)
        
        # Step 2: Transcribe Audio
        # Update status to 30% before starting the heavy transcription model
        processing_status[video_id] = {
            "status": "processing", 
            "message": "Loading Whisper Model & Transcribing Audio...", 
            "progress": 30
        }
        
        # This is the heavy blocking call
        segments = transcription_service.transcribe(audio_path)
        print(f"Transcription complete. Found {len(segments)} segments.")

        # Inject the filename into every segment so the vector store can index it.
        # This is required for the 'search' function to return the correct source file later.
        for segment in segments:
            segment["filename"] = original_filename
        
        # Step 3: Create Embeddings (Indexing)
        # Update status to 80% as we start database insertion
        processing_status[video_id] = {
            "status": "processing", 
            "message": "Generating Vector Embeddings & Indexing...", 
            "progress": 80
        }
        
        await vector_db.upsert_transcription(segments, video_id, user_id)
        
        # Step 4: Completion
        # Update status to 100% when everything is done
        print(f"Successfully indexed Video ID: {video_id}")
        processing_status[video_id] = {
            "status": "completed", 
            "message": "Ready to Chat!", 
            "progress": 100
        }
        
    except Exception as e:
        print(f"Error processing video {video_id}: {str(e)}")
        # If an error occurs, update the status so the frontend can show the error
        processing_status[video_id] = {
            "status": "error", 
            "message": f"Error: {str(e)}", 
            "progress": 0
        }
        
    finally:
        # Cleanup temporary audio files to save disk space
        if os.path.exists(audio_path):
            os.remove(audio_path)

@router.post("/ingest-video")
async def ingest_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Form(...) # user_id is required
):
    """
    Endpoint to receive the video file.
    It starts the background task and returns the Video ID immediately.
    """
    video_id = str(uuid.uuid4())
    
    # Create a safe filename prefixed with user_id for privacy
    safe_filename = f"{user_id}___{video_id}___{file.filename.replace(' ', '_')}"
    file_path = os.path.join(TEMP_UPLOAD_DIR, safe_filename)
    
    # Save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Initialize the status entry for this video
    processing_status[video_id] = {
        "status": "queued", 
        "message": "Queued for processing...", 
        "progress": 0
    }

    # Start the heavy processing in the background.
    # We pass 'safe_filename' so it can be indexed in the vector database.
    background_tasks.add_task(process_video_background, file_path, video_id, user_id, safe_filename)
    
    return {
        "message": "Video processing started.", 
        "video_id": video_id,
        "filename": safe_filename,
        "user_id": user_id
    }

@router.get("/status/{video_id}")
async def get_process_status(video_id: str):
    """
    Frontend polls this endpoint to get the current progress and status message.
    """
    return processing_status.get(video_id, {
        "status": "not_found", 
        "message": "Initializing...", 
        "progress": 0
    })

@router.get("/videos")
async def list_videos(user_id: Optional[str] = Query(None)):
    """
    Returns the list of videos, filtered by user_id if provided.
    """
    
    base_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    files = []
    if os.path.exists(TEMP_UPLOAD_DIR):
        for f in os.listdir(TEMP_UPLOAD_DIR):
            if f.endswith(('.mp4', '.mov', '.avi', '.mkv')):
                
                # Filter logic: only show videos belonging to the user
                if user_id and not f.startswith(f"{user_id}___"):
                    continue
                
                # Parse the display name to look nice in the UI h
                try:
                    parts = f.split('___')
                    if len(parts) >= 3:
                        display_name = parts[2]
                    else:
                        display_name = f
                except:
                    display_name = f

                files.append({
                    "filename": f, 
                    "display_name": display_name, 
                    "url": f"{base_url}/static/{f}"
                })
    return {"videos": files}