import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center text-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-ai-accent/15 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl px-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-white/5 shadow-sm mb-8 font-mono text-sm">
          <span className="w-2 h-2 rounded-full bg-ai-accent animate-pulse" />
          <span className="text-gray-300">DelphiMinds 2.0 is live</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
          Your AI-Powered <br className="hidden lg:block" />
          <span className="gradient-text glow-ai">Career Intelligence Engine</span>
        </h1>

        <p className="text-lg lg:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Automatically analyze your resume, detect skill gaps, unlock personalized growth roadmaps, and chat with an expert AI career mentor. Secure your next role faster.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-ai-accent text-white font-semibold text-lg transition-all glow-primary hover:scale-[1.02] active:scale-95"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-surface text-gray-200 font-semibold text-lg border border-white/10 hover:bg-surface/80 hover:border-primary/50 transition-all active:scale-95"
          >
            <PlayCircle className="w-5 h-5" /> Try Demo
          </Link>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-2 text-sm text-gray-500 font-mono">
          <p>Built for students & professionals</p>
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i}`} alt="user" className="w-full h-full object-cover opacity-80" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-background bg-surface flex items-center justify-center z-10 text-xs font-bold text-white">
              +1k
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
