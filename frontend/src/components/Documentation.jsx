import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Cpu, Video, ArrowRight, Terminal, Sparkles, Clock } from 'lucide-react';
import Header from './Header';
import { DOCS_URL } from '../config';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delayChildren: 0.3, staggerChildren: 0.2 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } } };

const Documentation = () => {
  return (
    <div className="w-full bg-[#0f172a] text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col min-h-screen">
      
      <Header isDocsPage={true} />

      {/* Main content with proper scrolling */}
      <main className="flex-1 w-full overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto pt-16 pb-32 px-6 relative">
        
        <div className="absolute top-20 -left-20 w-96 h-96 bg-indigo-500/30 rounded-full filter blur-[120px] opacity-50 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-500/20 rounded-full filter blur-[120px] opacity-40 animate-pulse pointer-events-none" style={{animationDelay: '1s'}}></div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="w-full text-center mb-20 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-bold mb-6">
                <Sparkles size={16} /> Next-Gen Video Intelligence
            </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Understand video content <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">at superhuman speed.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-6">
            VideoRAG Pro uses advanced AI to analyze your videos, allowing you to ask questions and jump instantly to the exact answer.
          </p>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 relative z-10 text-left w-full">
            <FeatureCard icon={<Video className="text-indigo-400" />} title="Instant Ingestion" description="Upload any video format. Our backend processes, transcribes, and indexes the content in the background automatically." />
            <FeatureCard icon={<Cpu className="text-purple-400" />} title="RAG V2 AI Brain" description="Powered by OpenAI GPT-4o and FlashRank reranking for highly accurate, context-aware answers." />
            <FeatureCard icon={<Clock className="text-pink-400" />} title="Precise Timestamps" description="Don't just get answers. Get taken directly to the exact second in the video where the answer lies." />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#1e293b] border border-slate-700/60 p-10 rounded-3xl mb-20 relative overflow-hidden shadow-2xl text-left w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none"></div>
            <h2 className="text-3xl font-bold mb-10 flex items-center gap-3 relative z-10 text-slate-100"><BookOpen className="text-indigo-400"/> How It Works</h2>
            <div className="space-y-8 relative z-10">
                <Step number="1" title="Upload" desc="Select your video file from the sidebar. The system begins processing immediately." />
                <Step number="2" title="Analyze" desc="The AI extracts audio, transcribes speech, and creates a searchable vector index." />
                <Step number="3" title="Ask" desc="Type any question in the chat interface related to the video content." />
                <Step number="4" title="Discover" desc="Receive an instant answer with clickable timestamps that control the video player." />
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center p-12 rounded-3xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 relative z-10 w-full">
            <Terminal size={40} className="mx-auto text-white mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-6 text-slate-100">Developer API</h2>
            <p className="text-slate-300 mb-10 max-w-xl mx-auto text-lg">Want to integrate VideoRAG into your own applications? Explore our comprehensive Swagger API documentation.</p>
            <a href={DOCS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-indigo-500/20 group">
                View Swagger Docs <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
            </a>
        </motion.div>
        </div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div variants={itemVariants} className="w-full h-full bg-[#1e293b] p-8 rounded-2xl border border-slate-700/60 hover:border-indigo-500/30 transition-colors shadow-lg group flex flex-col">
        {/* 'inline-block' ko hata kar 'self-start' add kar diya hy */}
        <div className="p-4 bg-slate-800 rounded-xl self-start mb-6 group-hover:scale-110 transition-transform border border-slate-700 flex-shrink-0">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed flex-1">{description}</p>
    </motion.div>
);

const Step = ({number, title, desc}) => (
    <div className="flex items-start gap-5">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 text-lg">{number}</div>
        <div><h4 className="text-xl font-bold mb-2 text-slate-100">{title}</h4><p className="text-slate-400 leading-relaxed">{desc}</p></div>
    </div>
);

export default Documentation;