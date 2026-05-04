import os
import torch
import json
import google.generativeai as genai
from app.core.config import settings

# --- FIX: Robust Import for MoviePy ---
try:
    # MoviePy 2.0+
    from moviepy import VideoFileClip
except ImportError:
    try:
        # Older versions fallback
        from moviepy.editor import VideoFileClip
    except:
        VideoFileClip = None
        print("⚠️ MoviePy library not found.")

# --- Safe Import for Whisper ---
try:
    import whisper
    LOCAL_WHISPER_AVAILABLE = True
except Exception as e:
    print(f"⚠️ Warning: Local Whisper issue. Falling back to API.")
    LOCAL_WHISPER_AVAILABLE = False
    whisper = None

class TranscriptionService:
    """
    Service responsible for extracting audio from video and transcribing it
    using either Google Gemini 1.5 API or a Local Whisper Model.
    """

    def __init__(self):
        self.mode = settings.WHISPER_MODE
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Configure Gemini API
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        
        if self.mode == "local" and not LOCAL_WHISPER_AVAILABLE:
            print("⚠️ Switching to CLOUD mode automatically.")
            self.mode = "cloud"

        if self.mode == "local" and LOCAL_WHISPER_AVAILABLE:
            print(f"Loading Local Whisper Model on {self.device}...")
            self.local_model = whisper.load_model("base", device=self.device)

    def extract_audio(self, video_path: str, output_audio_path: str):
        """
        Extracts audio track from the video file using MoviePy.
        """
        try:
            # FIX 1: Use 'with' context manager. 
            # Yeh ensure karega ke file FORAN close ho jaye taake PermissionError na aye.
            with VideoFileClip(video_path) as video:
                # FIX 2: Remove 'verbose' and 'logger' parameters.
                # MoviePy 2.0 mein ye hata diye gaye hain.
                video.audio.write_audiofile(output_audio_path)
            
            return output_audio_path
        except Exception as e:
            raise RuntimeError(f"Failed to extract audio: {str(e)}")

    def transcribe(self, audio_path: str):
        if self.mode == "cloud":
            return self._transcribe_cloud(audio_path)
        else:
            return self._transcribe_local(audio_path)

    def _transcribe_cloud(self, audio_path: str):
        print("Using Gemini Cloud API for transcription...")
        try:
            # 1. Upload audio file to Google's File API
            print(f"Uploading {audio_path} to Gemini...")
            audio_file = genai.upload_file(path=audio_path)
            
            # 2. Use Gemini 1.5 Flash (Optimized for fast multimodal tasks like audio)
            model = genai.GenerativeModel('gemini-2.5-flash')
            
            # 3. Strict prompt to enforce Whisper-style JSON segment output
            prompt = """
            Listen to this audio carefully and transcribe it completely. 
            You MUST return the result strictly as a JSON array of objects. 
            Each object in the array must have exactly these keys:
            - "start": the start time of the segment in seconds (as a float)
            - "end": the end time of the segment in seconds (as a float)
            - "text": the transcribed text for that segment
            
            Do not include any extra text, explanations, or markdown blocks. Just output the raw JSON array.
            """
            
            # 4. Generate content
            response = model.generate_content([prompt, audio_file])
            
            # 5. Clean up the uploaded file from Google's servers to save space
            audio_file.delete()
            
            # 6. Parse the JSON response safely
            response_text = response.text.strip()
            
            # Handle cases where the model might still add markdown backticks
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            elif response_text.startswith("```"):
                response_text = response_text[3:]
                
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            segments = json.loads(response_text.strip())
            
            # Ensure the output matches the exact structure we need
            formatted_segments = [
                {
                    "start": float(seg.get("start", 0.0)),
                    "end": float(seg.get("end", 0.0)),
                    "text": str(seg.get("text", "")).strip()
                }
                for seg in segments
            ]
            
            return formatted_segments
            
        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse Gemini JSON output: {e}")
            print(f"Raw Output was: {response_text}")
            raise RuntimeError("Gemini did not return valid JSON for transcription.")
        except Exception as e:
            print(f"⚠️ Gemini Cloud Transcription failed: {e}")
            raise RuntimeError(f"Cloud transcription error: {str(e)}")

    def _transcribe_local(self, audio_path: str):
        if not LOCAL_WHISPER_AVAILABLE:
            raise RuntimeError("Local Whisper is not available.")
            
        print("Using Local Whisper Model...")
        result = self.local_model.transcribe(audio_path)
        return result["segments"]