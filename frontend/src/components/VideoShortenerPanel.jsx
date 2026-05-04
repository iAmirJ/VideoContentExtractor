import React, { useState, useRef } from 'react';
import { Play, Loader2, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS, BACKEND_URL } from '../config';

const VideoShortenerPanel = ({ userId }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shortVideoData, setShortVideoData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [targetDuration, setTargetDuration] = useState(60);
  const statusCheckIntervalRef = useRef(null);

  const handleShorten = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStatusMessage('Starting video shortening...');
    setShortVideoData(null);

    try {
      const response = await fetch(`${API_ENDPOINTS.CHAT.split('/chat')[0]}/shorten-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl,
          user_id: userId,
          target_duration: targetDuration
        })
      });

      if (!response.ok) throw new Error('Failed to start shortening');

      const data = await response.json();
      const requestId = data.request_id;

      setStatusMessage('Downloading and processing video...');

      // Poll for status
      const checkStatus = async () => {
        try {
          const statusResponse = await fetch(
            `${API_ENDPOINTS.CHAT.split('/chat')[0]}/shorten-status/${requestId}`
          );
          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            setShortVideoData(statusData);
            setStatusMessage('✅ Video shortening complete!');
            setIsProcessing(false);
            clearInterval(statusCheckIntervalRef.current);
          } else if (statusData.status === 'error') {
            setError(statusData.message || 'Error processing video');
            setIsProcessing(false);
            clearInterval(statusCheckIntervalRef.current);
          } else {
            setStatusMessage(statusData.message || 'Processing...');
          }
        } catch (err) {
          console.error('Status check error:', err);
        }
      };

      // Check status every 3 seconds
      statusCheckIntervalRef.current = setInterval(checkStatus, 3000);
      checkStatus(); // Check immediately

    } catch (err) {
      setError(err.message || 'Error creating shortened video');
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const resolveUrl = (url) => {
    if (!url) return '';
    // Already absolute
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const base = (BACKEND_URL || '').replace(/\/$/, '');
    return `${base}${url}`;
  };

  return (
    <div className="w-full h-full glass-panel rounded-3xl p-6 flex flex-col shadow-2xl border border-white/10 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Play size={20} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Video Shortener</h2>
      </div>

      {/* Input Form */}
      <form onSubmit={handleShorten} className="space-y-4 mb-6">
        
        {/* YouTube URL Input */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">YouTube URL</label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            disabled={isProcessing}
            className="w-full bg-black/40 text-white placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all disabled:opacity-50"
          />
        </div>

        {/* Target Duration Selector */}
        <div>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">Target Duration</label>
          <select
            value={targetDuration}
            onChange={(e) => setTargetDuration(parseInt(e.target.value))}
            disabled={isProcessing}
            className="w-full bg-black/40 text-white rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/10 transition-all disabled:opacity-50"
          >
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={90}>1.5 minutes</option>
            <option value={120}>2 minutes</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play size={18} />
              Shorten Video
            </>
          )}
        </button>
      </form>

      {/* Status Message */}
      {statusMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm mb-4"
        >
          ⏳ {statusMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm mb-4 flex items-center gap-2"
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      {/* Results */}
      {shortVideoData && shortVideoData.status === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4 overflow-y-auto flex-1"
        >
          
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden border border-white/10">
            {(() => {
              const videoSrc = resolveUrl(shortVideoData.url);
              return (
                <video
                  src={videoSrc}
                  controls
                  className="w-full h-64 object-contain"
                  autoPlay
                  preload="metadata"
                  crossOrigin="anonymous"
                  onError={(e) => console.error('Video playback error', e, videoSrc)}
                />
              );
            })()}
          </div>

          {/* Summary Section */}
          {shortVideoData.summary && (
            <div className="space-y-3">
              
              {/* Video Duration */}
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle size={16} className="text-green-400" />
                <span>Duration: <span className="font-bold text-white">{shortVideoData.summary.duration.toFixed(1)}s</span></span>
              </div>

              {/* Transcript */}
              {shortVideoData.summary.transcript && (
                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <p className="text-xs font-semibold text-gray-400 mb-2">📝 Transcript</p>
                  <p className="text-sm text-gray-300 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                    {shortVideoData.summary.transcript}
                  </p>
                </div>
              )}

              {/* Key Points */}
              {shortVideoData.summary.key_points && shortVideoData.summary.key_points.length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                  <p className="text-xs font-semibold text-gray-400 mb-3">✨ Key Points</p>
                  <ul className="space-y-2">
                    {shortVideoData.summary.key_points.map((point, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Download/Copy Button */}
              <button
                onClick={() => copyToClipboard(resolveUrl(shortVideoData.url))}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                Copy Video URL
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!isProcessing && !shortVideoData && !statusMessage && (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
          <Play size={40} className="mb-3 text-purple-400" />
          <p className="text-gray-400 text-sm">Enter a YouTube URL to create a shortened version</p>
        </div>
      )}
    </div>
  );
};

export default VideoShortenerPanel;
