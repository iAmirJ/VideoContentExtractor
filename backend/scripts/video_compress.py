import os
import json
import subprocess
import argparse
import shutil

def compress_video(input_file, output_file, target_size_mb):
    # 1. Check karna ke file us path par mojood hai ya nahi
    if not os.path.exists(input_file):
        print(f"❌ ERROR: Video file '{input_file}' nahi mili!")
        print("👉 Tip: Ya toh file ko is folder mein copy karein, ya phir video ka pura path (C:\\...) theek se dalein.")
        return

    # 2. Check karna ke FFmpeg system mein install hai ya nahi
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        print("❌ ERROR: FFmpeg aapke system mein install nahi hai ya Environment Variables (PATH) mein nahi hai.")
        return

    # 3. Video ki duration nikalna (seconds mein)
    print("Video ki details check ki ja rahi hain...")
    probe_cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', input_file]
    
    try:
        # text=True string mein output return karega
        result = subprocess.run(probe_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        info = json.loads(result.stdout)
        duration = float(info['format']['duration'])
    except Exception as e:
        print(f"❌ ERROR: Video analyze karne mein masla aya: {e}")
        print(f"🔍 Debug details: {result.stdout if 'result' in locals() else 'No output'}")
        return

    # 4. Bitrate calculate karna
    target_size_kb = target_size_mb * 8192 * 0.95 
    total_bitrate = target_size_kb / duration
    audio_bitrate = 128 
    video_bitrate = int(total_bitrate - audio_bitrate)

    if video_bitrate < 100:
        print("⚠️ Warning: Video ki duration bohat lambi hai! 50MB limit ki wajah se quality kafi blur ho sakti hai.")
    
    print(f"✅ Video ki duration: {duration:.2f} seconds")
    print(f"✅ Target Video Bitrate: {video_bitrate}k")

    # 5. 2-Pass Encoding
    pass1_cmd = [
        'ffmpeg', '-y', '-i', input_file,
        '-c:v', 'libx264', '-b:v', f'{video_bitrate}k',
        '-pass', '1', '-an', '-f', 'mp4', os.devnull
    ]
    
    pass2_cmd = [
        'ffmpeg', '-y', '-i', input_file,
        '-c:v', 'libx264', '-b:v', f'{video_bitrate}k',
        '-pass', '2', '-c:a', 'aac', '-b:a', f'{audio_bitrate}k',
        output_file
    ]

    print("⏳ Pass 1 start ho raha hai... (Video analyze ho rahi hai, isme time lag sakta hai)")
    subprocess.run(pass1_cmd)
    
    print("⏳ Pass 2 start ho raha hai... (Compression process)")
    subprocess.run(pass2_cmd)
    
    # Cleanup log files
    for file in os.listdir('.'):
        if file.startswith('ffmpeg2pass'):
            os.remove(file)
            
    print(f"🎉 Compression mukammal ho gayi! Video saved as: {output_file}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Video ko specific size (MB) mein compress karein.")
    parser.add_argument("-i", "--input", required=True, help="Asal video ka path")
    parser.add_argument("-o", "--output", required=True, help="Output video ka path")
    parser.add_argument("-s", "--size", type=int, default=50, help="Target size MB mein (Default: 50)")
    
    args = parser.parse_args()
    compress_video(args.input, args.output, args.size)