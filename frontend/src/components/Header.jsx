import React from 'react';
import { Sparkles, Github, BookOpen, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ isDocsPage = false }) => {
  return (
    // Shrink-0 aur block layout ke sath sticky theek chalay ga
    <header className="w-full sticky top-0 z-50 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-700/60 px-8 h-20 flex items-center justify-between shrink-0 mb-0">
      
      <Link to="/video-rag" className="flex items-center gap-3 group">
        <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-colors">
          <Sparkles className="text-indigo-400 w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          VidioRAG <span className="text-indigo-400">Pro</span>
        </h1>
      </Link>
      
      <div className="flex items-center gap-4">
        {isDocsPage ? (
           <Link to="/video-rag" className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Home size={18} /> Back to App
          </Link>
        ) : (
           <Link to="/docs" className="px-5 py-2.5 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2 hover:bg-slate-800 rounded-lg font-medium border border-transparent hover:border-slate-700/60">
            <BookOpen size={18} /> Documentation
          </Link>
        )}

        <a href="#" className="px-5 py-2.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/60 rounded-full text-sm font-medium transition-all flex items-center gap-2 text-slate-300 hidden sm:flex">
          <Github size={18} /> GitHub
        </a>
      </div>
    </header>
  );
};

export default Header;