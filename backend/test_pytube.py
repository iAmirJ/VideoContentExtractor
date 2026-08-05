from pytubefix import YouTube

url = "https://www.youtube.com/shorts/OgrjwkUK8-c"
yt = YouTube(url, use_po_token=True)
print("Title:", yt.title)
ys = yt.streams.get_audio_only()
print("Audio stream found:", ys)
ys.download(mp3=True, filename="test_audio.mp3")
print("Downloaded successfully via pytubefix!")
