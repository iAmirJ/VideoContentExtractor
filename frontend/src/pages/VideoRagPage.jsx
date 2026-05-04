import React, { useRef, useState } from 'react';
import Header from '../components/Header'; 
import VideoPlayer from '../components/VideoPlayer';
import ChatInterface from '../components/ChatInterface';
import VideoSidebar from '../components/VideoSidebar';
import { BACKEND_URL } from '../config';

// Helper: Normalize video URLs
const normalizeUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}/static/${url.split('/').pop()}`;
};

const getPersistentUserId = () => {
  const storedId = localStorage.getItem('rag_user_id');
  if (storedId) return storedId;
  const newId = 'user_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('rag_user_id', newId);
  return newId;
};

const VideoRagPage = () => {
  const playerRef = useRef(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [userId] = useState(getPersistentUserId); 

  const handleSelectVideo = (url) => setCurrentVideoUrl(url);

  const handleSeek = (seconds, targetVideoUrl = null) => {
    // Normalize both URLs for proper comparison
    const normalizedTarget = normalizeUrl(targetVideoUrl || currentVideoUrl);
    const normalizedCurrent = normalizeUrl(currentVideoUrl);
    
    console.log(`🎯 Seek requested: ${seconds}s`);
    console.log(`   Target (normalized): ${normalizedTarget}`);
    console.log(`   Current (normalized): ${normalizedCurrent}`);
    
    if (!normalizedTarget) {
      console.warn("⚠️ No valid target video URL");
      return;
    }

    // Check if we need to switch videos (compare normalized URLs)
    if (normalizedTarget !== normalizedCurrent) {
        console.log(`🔀 Video switch needed: switching to ${normalizedTarget}`);
        setCurrentVideoUrl(normalizedTarget);
        
        // Give video time to load, then seek
        setTimeout(() => { 
          if (playerRef.current) {
            console.log(`⏱️ Executing seek to ${seconds}s after video switch`);
            playerRef.current.seekTo(seconds);
          }
        }, 1200); 
    } else {
        // Same video, seek immediately
        console.log(`⚡ Seeking in current video to ${seconds}s`);
        if (playerRef.current) {
          playerRef.current.seekTo(seconds);
        }
    }
  };

  return (
    // ✅ Root div se overflow-hidden hata diya taake docs/mobile par normal scroll kaam kare
    <div className="w-full bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30 flex flex-col min-h-screen">
      
      <Header />

      {/* ✅ Main tag se extra scroll (overflow-y-auto) hata diya aur padding set kar di */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        
        {/* ✅ items-start lagaya hai taake sticky theek se kaam kare grid mein */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Video Sidebar - Column 3 */}
          <div className="lg:col-span-3 w-full h-[600px] lg:h-[80vh] lg:sticky lg:top-24">
            <VideoSidebar onSelectVideo={handleSelectVideo} currentVideo={currentVideoUrl} userId={userId} />
          </div>

          {/* Video Player - Column 5 (Isme tumhara glass-panel design add rakha hai) */}
          <div className="lg:col-span-5 w-full h-[600px] lg:h-[80vh] lg:sticky lg:top-24 glass-panel rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10">
             <VideoPlayer key={currentVideoUrl} ref={playerRef} videoUrl={currentVideoUrl} />
          </div>

          {/* Chat Interface - Column 4 */}
          <div className="lg:col-span-4 w-full h-[600px] lg:h-[80vh] lg:sticky lg:top-24">
            <ChatInterface onSeek={handleSeek} userId={userId} currentVideoUrl={currentVideoUrl} />
          </div>

        </div>
      </main>

      <div className="fixed bottom-2 right-2 bg-black/80 text-gray-500 text-[10px] px-2 py-1 rounded border border-white/10 z-50">
        User: {userId}
      </div>
    </div>
  );
};

export default VideoRagPage;