import React, { useEffect, useState, useRef } from 'react';
import { Film, Play, RefreshCw, Loader2, CloudUpload, FileVideo, Activity, Clock } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VideoSidebar = ({ onSelectVideo, currentVideo, userId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(''); 
  const [currentPhase, setCurrentPhase] = useState('idle'); 
  const [elapsedTime, setElapsedTime] = useState(0); 
  
  const fileInputRef = useRef(null);
  const timerRef = useRef(null); 

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.GET_VIDEOS, { params: { user_id: userId } });
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const pollProcessingStatus = (videoId) => {
    setElapsedTime(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/status/${videoId}`);
        const { status, message, progress: backendProgress } = response.data;
        setStatusMessage(message);
        setProgress(backendProgress);

        if (status === 'completed') {
          clearInterval(intervalId);
          clearInterval(timerRef.current);
          setCurrentPhase('success');
          setTimeout(() => { fetchVideos(); resetUploadState(); }, 2000);
        } else if (status === 'error') {
          clearInterval(intervalId);
          clearInterval(timerRef.current);
          setCurrentPhase('error');
          setStatusMessage(message);
        }
      } catch (error) {}
    }, 1000);
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true); setProgress(0); setCurrentPhase('uploading'); setStatusMessage('Uploading to Server...');
    const formData = new FormData();
    formData.append('file', file); formData.append('user_id', userId); 

    try {
      const response = await axios.post(API_ENDPOINTS.INGEST_VIDEO, formData, {
        onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if(percent < 100) setProgress(percent);
            setStatusMessage(`Uploading File... ${percent}%`);
        }
      });
      setCurrentPhase('processing'); setStatusMessage('Initializing AI Models...');
      pollProcessingStatus(response.data.video_id);
    } catch (error) {
      setCurrentPhase('error'); setStatusMessage("Upload Failed.");
      setTimeout(resetUploadState, 4000);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const resetUploadState = () => {
      setIsUploading(false); setProgress(0); setCurrentPhase('idle'); setStatusMessage(''); setElapsedTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    fetchVideos();
    return () => { if (timerRef.current) clearInterval(timerRef.current); }
  }, []);

  return (
    <div className="h-full w-full glass-panel rounded-3xl p-6 flex flex-col shadow-2xl border border-white/10 relative">
      
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white tracking-wide">
          <Film className="w-6 h-6 text-blue-500" />
          Library
        </h2>
        <button onClick={fetchVideos} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white group">
          <RefreshCw size={20} className={`group-hover:rotate-180 transition-transform duration-700 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleUpload} accept="video/*" className="hidden" />

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 w-full">
        <div className="relative overflow-hidden rounded-2xl w-full">
            <button
            onClick={() => !isUploading && fileInputRef.current.click()}
            disabled={isUploading}
            className={`w-full p-6 rounded-2xl border-2 border-dashed transition-all duration-300 group relative flex flex-col items-center justify-center gap-3 ${
                isUploading 
                ? currentPhase === 'error' ? 'border-red-500/50 bg-red-500/10' : 'border-blue-500/50 bg-blue-500/10' 
                : 'border-white/20 hover:border-blue-500 hover:bg-blue-500/5'
            }`}
            >
            {!isUploading ? (
                <>
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-blue-500/20 shadow-lg">
                        <CloudUpload size={28} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-base font-semibold text-gray-200 group-hover:text-white">Upload New Video</p>
                        <p className="text-xs text-gray-500 mt-1">MP4, MOV, AVI supported</p>
                    </div>
                </>
            ) : (
                <div className="w-full">
                    <div className="flex justify-between text-xs font-bold mb-2 tracking-wider">
                        <span className={`flex items-center gap-2 ${currentPhase === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
                           {currentPhase === 'processing' && <Activity size={12} className="animate-pulse"/>}
                           {statusMessage}
                        </span>
                        <span className="text-white">{progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>
            )}
            </button>
        </div>

        {videos.length > 0 && (
            <div className="flex items-center gap-3 py-2 opacity-60">
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Videos</span>
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1"></div>
            </div>
        )}

        <AnimatePresence>
            {videos.map((video, idx) => {
                const isActive = currentVideo === video.url;
                const displayName = video.display_name || video.filename.replace(/^[\w-]+_/, '').replace(/_/g, ' ');
                return (
                <motion.button
                    key={idx} onClick={() => onSelectVideo(video.url)}
                    className={`w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border relative overflow-hidden ${
                    isActive ? 'bg-blue-500/10 border-blue-500/50 shadow-md' : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                    }`}
                >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-black/30 text-gray-400'}`}>
                        {isActive ? <Play size={20} fill="currentColor" /> : <FileVideo size={20} />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{displayName}</p>
                        <span className={`text-[10px] uppercase font-bold flex items-center gap-1 mt-1 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>
                            {isActive ? <><Activity size={12} className="animate-pulse" /> Now Playing</> : 'Watch'}
                        </span>
                    </div>
                </motion.button>
                );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VideoSidebar;