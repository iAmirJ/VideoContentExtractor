import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """
    Centralized configuration for the application.
    Manages API keys and environment settings.
    """
    PROJECT_NAME: str = "Video RAG AI Agent"
    API_V1_STR: str = "/api/v1"
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")  # For Gemini API access
    # Pinecone Configuration
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "video-rag-index")
    
    # Transcription Settings
    # Options: "cloud" (OpenAI API) or "local" (Local Whisper Model)
    WHISPER_MODE: str = os.getenv("WHISPER_MODE", "local") 
    
    # File Storage
    UPLOAD_DIR: str = "temp_uploads"

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)