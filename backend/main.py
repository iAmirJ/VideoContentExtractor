import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import google.generativeai as genai

# --- 1. Import VidioMind Modules ---
from app import database, models
from app.api.endpoints import auth, video, export
from app.api.endpoints import profile

# --- 2. Import RAG Agent Modules ---
from app.api.endpoints import ingest, chat
from app.core.config import settings

# --- CONFIGURATION & DATABASE ---
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    print("Error: GEMINI_API_KEY not found in .env file")
else:
    genai.configure(api_key=GEMINI_KEY)

# VidioMind Database Setup
models.Base.metadata.create_all(bind=database.engine)

# --- APP INITIALIZATION ---
app = FastAPI(
    title="VidioMind & RAG Agent API",
    description="Unified backend for Video Summarizer and Video Q&A with Timestamp Retrieval.",
    version="1.0.0"
)

# --- CORS Configuration ---
# Dono ke CORS rules mila kar ek comprehensive list bana di hai
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- Static File Serving (For Videos) ---
TEMP_UPLOAD_DIR = "temp_uploads"
os.makedirs(TEMP_UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=TEMP_UPLOAD_DIR), name="static")

# --- REGISTER ALL ROUTERS ---

# 1. VidioMind Routers (use API_V1_STR for consistent versioning, e.g. /api/v1/...)
app.include_router(auth.router, prefix=settings.API_V1_STR, tags=["Auth"])
app.include_router(video.router, prefix=settings.API_V1_STR, tags=["Video Core"])
app.include_router(export.router, prefix=settings.API_V1_STR, tags=["Exports"])
app.include_router(profile.router, prefix=f"{settings.API_V1_STR}/profile", tags=["Profile"])

# 2. RAG Agent Routers (Paths based on settings.API_V1_STR, usually /api/v1/...)
app.include_router(ingest.router, prefix=settings.API_V1_STR, tags=["RAG Ingestion"])
app.include_router(chat.router, prefix=settings.API_V1_STR, tags=["RAG Chat"])

# --- ROOT ENDPOINT ---
@app.get("/", tags=["Status"])
async def root():
    return {
        "status": "active", 
        "message": "VidioMind & RAG Agent API is running perfectly."
    }

if __name__ == "__main__":
    import uvicorn
    # Ab file root directory mein hai toh 'main:app' use hoga
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)