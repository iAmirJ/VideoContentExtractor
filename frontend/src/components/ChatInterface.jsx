import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clock, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS, BACKEND_URL } from '../config';

// Helper: Extract just the filename from a full video URL (remove protocol + domain + /static/)
const extractFilename = (videoUrl) => {
  if (!videoUrl) return null;
  if (videoUrl.includes('/static/')) {
    return videoUrl.split('/static/')[1];
  }
  return videoUrl;
};

// Helper: Normalize video URL to full path format
const normalizeVideoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}/static/${extractFilename(url)}`;
};

// Helper function to convert timestamp strings like "[02:30]" into total seconds (150).
// This is required because the video player accepts time in seconds.
const parseTimestampToSeconds = (timestamp) => {
  try {
    const cleanTime = timestamp.replace('[', '').replace(']', '');
    const [minutes, seconds] = cleanTime.split(':').map(Number);
    return minutes * 60 + seconds;
  } catch {
    return 0;
  }
};

const ChatInterface = ({ onSeek, userId, currentVideoUrl }) => {
  // Initialize chat state with a welcome message (no localStorage persistence)
  const [messages, setMessages] = useState([
    { 
        role: 'assistant', 
        content: "👋 Hello! I've analyzed your video. Ask me anything about specific moments, details, or summaries! 🎥✨",
        videoUrl: null 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    if (e) e.preventDefault(); 
    if (!input.trim() || isLoading) return;

    // Default to the currently playing video if no specific source is found later.
    let activeVideoContext = currentVideoUrl;

    const userMessage = { role: 'user', content: input, videoUrl: activeVideoContext };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add a placeholder message for the AI response.
      // We start with the current video context, but this might update if the backend sends a <<SOURCE>> tag.
      setMessages(prev => [...prev, { role: 'assistant', content: '', videoUrl: activeVideoContext }]);

      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
         },
        body: JSON.stringify({ 
          query: userMessage.content, 
          thread_id: userId,
          video_id: currentVideoUrl ? currentVideoUrl.split('/').pop() : null
        }),
      });

      if (!response.ok) throw new Error("Backend connection failed");

      // Set up the stream reader to handle the backend response chunk by chunk.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = ""; 

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        // --- SOURCE DETECTION LOGIC ---
        // Check if the text chunk contains our special source tag <<SOURCE:filename>>.
        // This tag is sent by the backend to tell us exactly which video provided the answer.
        const sourceMatch = accumulatedText.match(/<<SOURCE:(.*?)>>/);
        
        if (sourceMatch && sourceMatch[1]) {
            // We found the source! Extract the filename and normalize it
            const sourceFilename = sourceMatch[1].trim();
            const normalizedUrl = normalizeVideoUrl(sourceFilename);
            
            console.log(`📹 Chat source detected: ${sourceFilename} -> ${normalizedUrl}`);
            activeVideoContext = normalizedUrl;
            
            // Remove the tag from the visible text so the user doesn't see the ugly raw URL.
            accumulatedText = accumulatedText.replace(/<<SOURCE:.*?>>/, '');
        }

        // Update the last message in the state with the newly received text chunk.
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          
          newMessages[lastIndex] = { 
              ...newMessages[lastIndex], 
              content: accumulatedText,
              // CRITICAL UPDATE - We attach the detected 'activeVideoContext' to this message.
              // This ensures that when a user clicks a timestamp, we know which video to switch to.
              videoUrl: activeVideoContext 
          };
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      // Handle errors gracefully by updating the placeholder message with an error text.
      setMessages(prev => {
         const newMsgs = [...prev];
         if (newMsgs[newMsgs.length - 1].role === 'assistant' && newMsgs[newMsgs.length - 1].content === '') {
            newMsgs.pop();
         }
         return [...newMsgs, { role: 'assistant', content: "⚠️ Connection Error. Ensure Backend is running on port 8000.", videoUrl: null }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse message text and render clickable timestamp buttons.
  const renderMessageContent = (msg) => {
    const text = msg.content;
    
    // Normalize the video URL attached to this message
    const targetVideo = normalizeVideoUrl(msg.videoUrl || currentVideoUrl);
    
    console.log(`🎯 Rendering message content. Target video: ${targetVideo}`);

    // Split text by timestamp pattern (e.g., [02:30]).
    const parts = text.split(/(\[\d{2}:\d{2}\])/g);
    
    return parts.map((part, index) => {
      // If the part matches the timestamp format, render it as a clickable button.
      if (part.match(/\[\d{2}:\d{2}\]/)) {
        const seconds = parseTimestampToSeconds(part);
        return (
          <button
            key={index}
            // When clicked, call the 'onSeek' function passed from App.jsx.
            // We pass both the time (seconds) AND the target video URL.
            // This allows the App controller to switch videos automatically if needed.
            onClick={() => {
              console.log(`⏱️ Timestamp clicked: ${part} (${seconds}s) for video: ${targetVideo}`);
              onSeek(seconds, targetVideo);
            }}
            className="inline-flex items-center gap-1.5 mx-1 px-2.5 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border border-accent/20 hover:scale-105 hover:shadow-[0_0_10px_rgba(99,102,241,0.4)]"
            title="Jump to timestamp"
          >
            <Clock size={12} />
            {part}
          </button>
        );
      }
      // Render regular text as Markdown.
      return <ReactMarkdown key={index} components={{ p: 'span' }}>{part}</ReactMarkdown>;
    });
  };

  return (
    <div className="flex flex-col h-full w-full glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-darkBase/50 backdrop-blur-xl">
      
      {/* Header Section containing the title and status indicators */}
      <div className="flex-shrink-0 p-5 border-b border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide text-sm">AI Research Assistant</h2>
            <p className="text-[10px] text-gray-400 font-medium">GPT-4o • RAG V2.0 • Online</p>
          </div>
        </div>
        <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex-shrink-0">
            <Sparkles size={16} className="text-yellow-400" />
        </div>
      </div>

      {/* Messages List Area - Displays the conversation history */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth w-full">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, type: "spring" }}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar for User or Bot */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
                msg.role === 'user' 
                ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white' 
                : 'bg-gradient-to-br from-gray-800 to-black border border-white/10 text-accent'
              }`}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-7 shadow-xl overflow-hidden ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm bg-gradient-to-br from-blue-600 to-blue-700' 
                  : 'bg-gray-900/80 text-gray-100 border border-white/10 rounded-tl-sm backdrop-blur-md'
              }`}>
                <div className="prose prose-invert max-w-none text-sm font-light tracking-wide break-words overflow-x-hidden">
                  {/* We pass the entire message object to 'renderMessageContent' 
                      because it contains the 'videoUrl' property needed for smart seeking. */}
                  {msg.role === 'user' ? msg.content : renderMessageContent(msg)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator shown while waiting for AI response */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-3 text-gray-500 text-xs font-medium ml-14 bg-white/5 px-4 py-2 rounded-full w-fit border border-white/5"
          >
            <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
            <span>Analyzing content...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Area */}
      <div className="flex-shrink-0 p-5 bg-darkBase/80 border-t border-white/10 backdrop-blur-xl w-full">
        <form 
            onSubmit={handleSend}
            className="flex items-center gap-3 group w-full"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question regarding the video..."
            className="flex-1 bg-black/40 text-white placeholder-gray-500 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-accent/50 border border-white/10 transition-all shadow-inner group-hover:border-white/20"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 p-2.5 bg-accent hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-accent/20"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-600">AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;