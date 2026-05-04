import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Using forwardRef to allow the parent component (App.jsx) to control playback features like seeking
const VideoPlayer = forwardRef(({ videoUrl }, ref) => {
  const videoRef = useRef(null);
  
  // This reference acts as a queue. If we receive a seek command before the video is ready,
  // we store the timestamp here and apply it later once the video loads.
  const pendingSeekRef = useRef(null);

  // Expose the 'seekTo' function to the parent component
  useImperativeHandle(ref, () => ({
    seekTo: (seconds) => {
      if (videoRef.current) {
        try {
          // Always queue the seek to ensure it happens after the video is fully ready
          pendingSeekRef.current = seconds;
          
          // Check if the video metadata is already loaded
          if (videoRef.current.readyState >= 1) {
            // Video is ready, seek immediately
            videoRef.current.currentTime = seconds;
            videoRef.current.play().catch(e => console.warn("Play error:", e));
          } else {
            // Video is still loading, the queued seek will execute in handleLoadedMetadata
            console.log(`⏳ Queuing seek to ${seconds}s (video readyState: ${videoRef.current.readyState})`);
          }
        } catch (error) {
          console.error("❌ Seek error:", error);
        }
      }
    }
  }));

  // Reload the video player whenever the source URL changes
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  // This event handler triggers automatically when the browser finishes loading video metadata (duration, dimensions, etc.)
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
        // Check if there is a pending seek command in the queue
        if (pendingSeekRef.current !== null) {
            try {
              const seekTime = pendingSeekRef.current;
              console.log(`✅ Video loaded (duration: ${videoRef.current.duration}s). Executing queued seek to ${seekTime}s`);
              
              // Execute the queued jump
              videoRef.current.currentTime = seekTime;
              
              // Clear the queue so we don't jump again unexpectedly
              pendingSeekRef.current = null;
              
              // Attempt to auto-play after seeking
              videoRef.current.play().catch(e => console.warn("Autoplay after seek error:", e));
            } catch (error) {
              console.error("❌ Error executing pending seek:", error);
              pendingSeekRef.current = null;
            }
        } else {
            // No pending seek, just auto-play
            videoRef.current.play().catch(e => console.warn("Autoplay error:", e));
        }
    }
  };

  return (
    <div className="w-full h-full bg-black relative flex flex-col items-center justify-center rounded-2xl overflow-hidden shadow-2xl">
      {videoUrl ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          autoPlay
          muted // Muted is strictly required by browsers to allow auto-play without user interaction
          playsInline
          // Connect the metadata handler to execute our queued seek logic
          onLoadedMetadata={handleLoadedMetadata}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-center text-gray-500 flex flex-col items-center animate-pulse">
            <span className="text-5xl mb-4 opacity-50">🎬</span>
            <p className="text-lg font-medium">Select a video to play</p>
        </div>
      )}
    </div>
  );
});

export default VideoPlayer;