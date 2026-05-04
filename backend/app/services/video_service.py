import os
import time
import json
import yt_dlp
import google.generativeai as genai
from sqlalchemy.orm import Session
from app import models

TEMP_FOLDER = "temp_audio"
os.makedirs(TEMP_FOLDER, exist_ok=True)

def update_status(pid, status, percent, db: Session):
    try:
        req = db.query(models.ProcessingRequest).filter_by(project_id=pid).first()
        if req:
            req.job_status = status
            req.progress_percent = percent
            db.commit()
    except:
        db.rollback()

# --- GEMINI AI ENGINE
def process_video_with_gemini(pid: int, url: str, db: Session):
    audio_file = None
    try:
        # Step 1: Download
        update_status(pid, "Downloading Audio...", 10, db)
        
        # YAHAN CHANGES KI HAIN: Folder ka path add kiya hai
        out_template = os.path.join(TEMP_FOLDER, f'temp_{pid}.%(ext)s')
        
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'outtmpl': out_template,  # Ab file theek folder mein jayegi
            'quiet': True,
            'nocheckcertificate': True,
            'socket_timeout': 60,
            'retries': 10,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            video_title = info.get('title', 'Unknown Video')
            thumbnail = info.get('thumbnail', '')
            ext = info.get('ext', 'm4a')
            
            # YAHAN BHI CHANGE KI HAI: audio_file ka mukammal path diya hai
            audio_file = os.path.join(TEMP_FOLDER, f"temp_{pid}.{ext}")

        # Update Meta
        proj = db.query(models.VideoProject).filter_by(project_id=pid).first()
        proj.title = video_title
        proj.thumbnail_url = thumbnail
        db.commit()

        # Step 2: Upload
        update_status(pid, "Uploading to Gemini AI...", 40, db)
        myfile = genai.upload_file(audio_file)
        
        while myfile.state.name == "PROCESSING":
            time.sleep(4)
            myfile = genai.get_file(myfile.name)
            
        if myfile.state.name == "FAILED":
            raise Exception("Gemini failed to process the audio file.")

        # Step 3: Generate
        update_status(pid, "Generating Clean Content...", 75, db)
        
        model = genai.GenerativeModel("gemini-3-flash-preview")
        
        prompt = """
        Analyze this audio. Return a strictly valid JSON object.
        1. "summary": A simple string with bullet points (use • symbol).
        2. "blog_post": A simple string containing a Title and Paragraphs separated by newlines.
        
        Important: Do NOT use nested objects for blog_post (like {"title": "..."}). Just return plain text strings for both fields.
        Return ONLY raw JSON.
        """
        
        result = model.generate_content([myfile, prompt])
        
        # --- ADVANCED CLEANER ---
        final_summary = ""
        final_blog = ""
        
        try:
            raw_text = result.text.strip()
            # Markdown cleaning
            if "```json" in raw_text:
                raw_text = raw_text.replace("```json", "").replace("```", "")
            
            # Braces extraction
            start = raw_text.find('{')
            end = raw_text.rfind('}') + 1
            if start != -1 and end != -1:
                raw_text = raw_text[start:end]

            data = json.loads(raw_text)
            
            # --- FIX: Handle Nested Structures (Summary) ---
            s_data = data.get("summary", "No summary.")
            if isinstance(s_data, list):
                final_summary = "\n".join([f"• {str(item)}" for item in s_data])
            elif isinstance(s_data, dict):
                # Agar ghalati se dict aa jaye
                final_summary = "\n".join([f"• {v}" for v in s_data.values()])
            else:
                final_summary = str(s_data)

            # --- FIX: Handle Nested Structures (Blog) ---
            # Screenshot mein {title: "", paragraphs: []} tha, usay handle karte hain
            b_data = data.get("blog_post", "No blog.")
            
            if isinstance(b_data, dict):
                # Title aur Paragraphs ko merge karo
                title = b_data.get("title", "Blog Post")
                content = b_data.get("paragraphs", [])
                if isinstance(content, list):
                    content = "\n\n".join([str(p) for p in content])
                elif isinstance(content, str):
                    # Kabhi kabhi content string hota hai lekin 'content' key mein
                    content = b_data.get("content", content)
                
                final_blog = f"{title}\n\n{content}"
            
            elif isinstance(b_data, list):
                final_blog = "\n\n".join([str(item) for item in b_data])
            else:
                final_blog = str(b_data)

            # Final Cleanup
            final_summary = final_summary.strip()
            final_blog = final_blog.strip()

        except json.JSONDecodeError:
            final_summary = result.text
            final_blog = "Format Error: Could not parse blog."

        # Step 4: Save
        summ = models.Summary(
            project_id=pid, 
            concise_summary=final_summary,
            blog_post_content=final_blog
        )
        db.add(summ)
        
        update_status(pid, "Completed", 100, db)
        proj.status = "Completed"
        db.commit()

        # Cleanup
        if audio_file and os.path.exists(audio_file): os.remove(audio_file)

    except Exception as e:
        print(f"Error details: {e}")
        db.rollback()
        
        try:
            update_status(pid, "Failed", 0, db)
            proj = db.query(models.VideoProject).filter_by(project_id=pid).first()
            if proj:
                proj.status = "Failed"
                db.commit()
        except: pass

        if audio_file and os.path.exists(audio_file): os.remove(audio_file)