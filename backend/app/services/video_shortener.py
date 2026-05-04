"""
Video Shortening Service
Downloads YouTube videos and creates shortened versions with key highlights.
"""
import os
import subprocess
import shutil
import math
from pathlib import Path
from app.services.transcription import TranscriptionService
from moviepy.video.io.VideoFileClip import VideoFileClip
import json

class VideoShortenerService:
    """Service to download YouTube videos and create shortened, key-moment focused versions."""
    
    def __init__(self):
        self.transcription_service = TranscriptionService()
        self.temp_dir = Path("temp_shorts")
        self.temp_dir.mkdir(exist_ok=True)
    
    def download_youtube_video(self, url: str, output_path: str) -> bool:
        """
        Download a YouTube video using yt-dlp.
        Returns: True if successful, False otherwise
        """
        try:
            print(f"📥 Downloading video from: {url}")
            cmd = [
                "yt-dlp",
                "-f", "best[ext=mp4]",
                "-o", output_path,
                url
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            
            if result.returncode == 0 and os.path.exists(output_path):
                file_size = os.path.getsize(output_path) / (1024 * 1024)
                print(f"✅ Downloaded successfully: {file_size:.2f} MB")
                return True
            else:
                print(f"❌ Download failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Download error: {str(e)}")
            return False
    
    def get_video_duration(self, video_path: str) -> float:
        """Get video duration in seconds."""
        try:
            clip = VideoFileClip(video_path)
            duration = clip.duration
            clip.close()
            return duration
        except Exception as e:
            print(f"Error getting duration: {e}")
            return 0
    
    def create_short_version(self, input_video: str, output_video: str, max_duration: int = 60) -> bool:
        """
        Create a shortened version of the video.
        Extracts key moments using transcription analysis.
        
        Args:
            input_video: Path to full video
            output_video: Path to save shortened video
            max_duration: Target duration in seconds (default: 60 = 1 minute)
        
        Returns: True if successful
        """
        try:
            print(f"⏱️ Creating short version (target: {max_duration}s)...")
            
            # Get video properties
            total_duration = self.get_video_duration(input_video)
            if total_duration == 0:
                raise Exception("Could not determine video duration")
            
            print(f"📊 Original duration: {total_duration:.1f}s")
            
            # If video is already short, just copy it
            if total_duration <= max_duration:
                print("✅ Video already short enough, using as-is")
                cmd = ["ffmpeg", "-i", input_video, "-c", "copy", output_video, "-y"]
                subprocess.run(cmd, capture_output=True)
                return True
            
            # Strategy: Extract key moments by analyzing transcript and sample across timeline
            segments = self._extract_key_segments(input_video, max_duration)

            if segments:
                success = self._concatenate_segments(input_video, segments, output_video)
                if success:
                    print(f"✅ Short version created: {output_video}")
                    return True
            
            # Fallback: Just trim to max_duration from the start of important content
            return self._trim_video(input_video, output_video, max_duration)
            
        except Exception as e:
            print(f"❌ Error creating short: {str(e)}")
            return False
    
    def _extract_key_segments(self, video_path: str, target_duration: int) -> list:
        """
        Extract key moments from video using transcription.
        Returns list of (start_time, end_time) tuples.
        """
        try:
            print(f"🔍 Analyzing video content for key moments...")
            
            # Extract audio and transcribe
            audio_path = f"{video_path}.tmp.mp3"
            self.transcription_service.extract_audio(video_path, audio_path)
            segments = self.transcription_service.transcribe(audio_path)
            
            # Clean up temp audio
            if os.path.exists(audio_path):
                os.remove(audio_path)
            
            if not segments:
                return []
            
            # Heuristic: pick segments spread across the whole video to ensure coverage.
            total_duration = self.get_video_duration(video_path)
            if total_duration == 0:
                return []

            # Determine number of buckets (try to balance granularity and coverage)
            buckets = min(6, max(1, int(target_duration / 10)))
            bucket_size = total_duration / buckets

            # Normalize incoming segments structure
            formatted_segments = []
            for seg in segments:
                s = float(seg.get('start', 0))
                e = float(seg.get('end', s + 5))
                text = seg.get('text', '')
                score = len(text) * 0.7 + (1 - s / max(1.0, total_duration)) * 100
                formatted_segments.append({'start': s, 'end': e, 'text': text, 'score': score})

            # For each bucket, pick the best segment that lies in the bucket (or overlaps it)
            selected = []
            for i in range(buckets):
                wstart = i * bucket_size
                wend = min(total_duration, (i + 1) * bucket_size)

                # Candidates that start inside the window
                candidates = [s for s in formatted_segments if s['start'] >= wstart and s['start'] < wend]
                # If none, allow overlapping segments
                if not candidates:
                    candidates = [s for s in formatted_segments if s['end'] > wstart and s['start'] < wend]

                if candidates:
                    best = max(candidates, key=lambda x: x['score'])
                    start = max(0, best['start'])
                    end = min(total_duration, best['end'])
                    selected.append((start, end))
                else:
                    # No candidate: create a small synthetic clip in the center of the bucket
                    avg_len = max(3, int(target_duration / max(1, buckets)))
                    mid = (wstart + wend) / 2
                    s = max(0, mid - avg_len / 2)
                    e = min(total_duration, s + avg_len)
                    selected.append((s, e))

            # Merge and trim to meet target_duration
            # Sort and merge overlapping intervals
            selected.sort()
            merged = []
            for s, e in selected:
                if not merged:
                    merged.append([s, e])
                else:
                    if s <= merged[-1][1]:
                        merged[-1][1] = max(merged[-1][1], e)
                    else:
                        merged.append([s, e])

            # Now we may have fewer, larger segments; if total length > target, shrink proportionally
            total_time = sum(e - s for s, e in merged)
            if total_time <= target_duration:
                final = [(s, e) for s, e in merged]
            else:
                scale = target_duration / total_time if total_time > 0 else 1.0
                final = []
                for s, e in merged:
                    dur = (e - s) * scale
                    final.append((s, s + dur))

            # If the selected segments are shorter than target, fill the remaining time
            total_selected_seconds = sum(e - s for s, e in final)
            if total_selected_seconds < target_duration:
                remaining = target_duration - total_selected_seconds
                # compute gaps (areas not covered by merged intervals)
                gaps = []
                prev_end = 0.0
                for s, e in merged:
                    if s > prev_end:
                        gaps.append((prev_end, s))
                    prev_end = e
                if prev_end < total_duration:
                    gaps.append((prev_end, total_duration))

                # fill largest gaps first
                gaps.sort(key=lambda x: x[1] - x[0], reverse=True)
                appended = []
                for gstart, gend in gaps:
                    if remaining <= 0:
                        break
                    gap_len = gend - gstart
                    if gap_len <= 0:
                        continue
                    take = min(remaining, gap_len)
                    start = gstart + max(0.0, (gap_len - take) / 2.0)
                    end = start + take
                    appended.append((start, end))
                    remaining -= take

                # if still remaining, try to expand existing merged segments to the right where possible
                if remaining > 0:
                    for i in range(len(merged)):
                        if remaining <= 0:
                            break
                        s, e = merged[i]
                        next_start = merged[i + 1][0] if i + 1 < len(merged) else total_duration
                        max_ext = max(0.0, next_start - e)
                        if max_ext <= 0:
                            continue
                        take = min(remaining, max_ext)
                        # expand this merged segment's end
                        merged[i][1] = e + take
                        appended.append((e, e + take))
                        remaining -= take

                # final fallback: take a centered clip if still remaining
                if remaining > 0:
                    start = max(0.0, (total_duration - remaining) / 2.0)
                    appended.append((start, start + remaining))
                    remaining = 0.0

                final = final + appended

            # Final cleanup: ensure at least 0.5s long and within bounds, then merge overlaps
            cleaned = []
            for s, e in final:
                if e - s >= 0.5:
                    cleaned.append((max(0.0, s), min(total_duration, e)))

            # Merge overlaps
            cleaned.sort()
            merged2 = []
            for s, e in cleaned:
                if not merged2:
                    merged2.append([s, e])
                else:
                    if s <= merged2[-1][1]:
                        merged2[-1][1] = max(merged2[-1][1], e)
                    else:
                        merged2.append([s, e])

            final_cleaned = [(s, e) for s, e in merged2]
            total_selected_seconds = sum(e - s for s, e in final_cleaned)
            print(f"📍 Final segments: {len(final_cleaned)} (~{total_selected_seconds:.1f}s)")
            return final_cleaned
        except Exception as e:
            print(f"⚠️ Could not extract key segments: {e}")
            return []
    
    def _concatenate_segments(self, video_path: str, segments: list, output_path: str) -> bool:
        """Concatenate multiple video segments into one."""
        try:
            if not segments:
                return False
            
            print(f"🎬 Concatenating {len(segments)} segments...")
            # Create re-encoded segment files to guarantee consistent codecs (v: h264, a: aac)
            seg_files = []
            try:
                for idx, (start, end) in enumerate(segments):
                    dur = max(0.5, end - start)
                    seg_path = str(self.temp_dir / f"seg_{idx}.mp4")
                    # Extract the segment with re-encoding to ensure audio present and browser-friendly codecs
                    cmd = [
                        "ffmpeg",
                        "-ss", str(start),
                        "-i", video_path,
                        "-t", str(dur),
                        "-c:v", "libx264",
                        "-preset", "fast",
                        "-crf", "23",
                        "-c:a", "aac",
                        "-b:a", "128k",
                        "-ac", "2",
                        "-ar", "44100",
                        "-movflags", "+faststart",
                        seg_path,
                        "-y"
                    ]
                    res = subprocess.run(cmd, capture_output=True, text=True)
                    if res.returncode != 0:
                        print(f"Segment extraction failed (idx={idx}): {res.stderr}")
                        raise RuntimeError("Segment extraction failed")
                    seg_files.append(seg_path)

                # Write concat list
                concat_file = str(self.temp_dir / f"{Path(output_path).stem}.concat.txt")
                with open(concat_file, 'w', encoding='utf-8') as f:
                    for sf in seg_files:
                        f.write(f"file '{os.path.abspath(sf)}'\n")

                # Concatenate
                cmd_concat = [
                    "ffmpeg",
                    "-f", "concat",
                    "-safe", "0",
                    "-i", concat_file,
                    "-c", "copy",
                    "-movflags", "+faststart",
                    output_path,
                    "-y"
                ]
                res2 = subprocess.run(cmd_concat, capture_output=True, text=True)
                if res2.returncode == 0 and os.path.exists(output_path):
                    return True

                # Fallback: use filter_complex concat (re-encode)
                print("Concat copy failed, falling back to filter_complex (re-encode)...")
                inputs = []
                filter_parts = []
                map_parts = []
                for i, sf in enumerate(seg_files):
                    inputs += ["-i", sf]
                    filter_parts.append(f"[{i}:v:0][{i}:a:0]")
                concat_filter = ''.join(filter_parts) + f"concat=n={len(seg_files)}:v=1:a=1[outv][outa]"
                cmd_fc = ["ffmpeg"] + inputs + ["-filter_complex", concat_filter, "-map", "[outv]", "-map", "[outa]", "-c:v", "libx264", "-c:a", "aac", "-b:a", "128k", "-ac", "2", "-ar", "44100", "-movflags", "+faststart", output_path, "-y"]
                res3 = subprocess.run(cmd_fc, capture_output=True, text=True)
                if res3.returncode == 0 and os.path.exists(output_path):
                    return True

                print(f"Final concat failed: {res2.stderr}\n{res3.stderr}")
                return False
            finally:
                # Cleanup temp segment and concat files
                for sf in seg_files:
                    try:
                        if os.path.exists(sf):
                            os.remove(sf)
                    except:
                        pass
                try:
                    if 'concat_file' in locals() and os.path.exists(concat_file):
                        os.remove(concat_file)
                except:
                    pass
        except Exception as e:
            print(f"Concatenation error: {e}")
            return False
    
    def _trim_video(self, input_path: str, output_path: str, duration: int) -> bool:
        """Simple trim: take first N seconds or middle portion."""
        try:
            print(f"✂️ Trimming video to {duration}s...")
            
            total_duration = self.get_video_duration(input_path)
            
            # Strategy: skip intro (10% of video) and take next 60 seconds
            skip_start = max(0, int(total_duration * 0.1))
            
            cmd = [
                "ffmpeg",
                "-i", input_path,
                "-ss", str(skip_start),
                "-t", str(duration),
                "-c:v", "libx264",
                "-preset", "fast",
                "-c:a", "aac",
                "-b:a", "128k",
                "-ac", "2",
                "-ar", "44100",
                output_path,
                "-y"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return result.returncode == 0
        except Exception as e:
            print(f"Trim error: {e}")
            return False
    
    def get_video_summary(self, video_path: str) -> dict:
        """
        Transcribe video and generate a summary.
        Returns: {'transcript': str, 'key_points': [str], 'duration': float}
        """
        try:
            print(f"📝 Generating summary for short video...")
            
            audio_path = f"{video_path}.tmp.mp3"
            self.transcription_service.extract_audio(video_path, audio_path)
            segments = self.transcription_service.transcribe(audio_path)
            
            # Clean up
            if os.path.exists(audio_path):
                os.remove(audio_path)
            
            if not segments:
                return {'transcript': '', 'key_points': [], 'duration': 0}
            
            # Combine transcript
            full_transcript = " ".join([seg.get('text', '') for seg in segments])
            
            # Extract key points (longest/most info-dense sentences)
            sentences = [s.strip() for s in full_transcript.split('.') if len(s.strip()) > 20]
            key_points = sentences[:5]  # Top 5 sentences
            
            duration = self.get_video_duration(video_path)
            
            return {
                'transcript': full_transcript,
                'key_points': key_points,
                'duration': duration
            }
        except Exception as e:
            print(f"Summary error: {e}")
            return {'transcript': '', 'key_points': [], 'duration': 0}
    
    def cleanup(self, video_path: str):
        """Remove temporary video files."""
        try:
            if os.path.exists(video_path):
                os.remove(video_path)
                print(f"🗑️ Cleaned up: {video_path}")
        except Exception as e:
            print(f"Cleanup error: {e}")
