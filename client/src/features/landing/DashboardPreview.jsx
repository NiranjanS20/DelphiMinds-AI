import { motion } from 'framer-motion';
import { Target, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPreview() {
  return (
    <section className="py-20 lg:py-32 px-4 bg-surface/30 relative" id="dashboard">
      <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-4 auto-rows-fr relative z-10"
          >
            {/* Widget 1 */}
            <div className="col-span-2 glass border border-white/5 p-6 rounded-2xl flex items-center justify-between shadow-2xl">
              <div>
                <p className="text-gray-400 text-sm font-mono mb-1">Career Velocity</p>
                <div className="flex items-end gap-2 text-white">
                  <span className="text-4xl font-bold">85</span>
                  <span className="text-accent text-sm font-bold pb-1">+12%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Activity strokeWidth={3} />
              </div>
            </div>
            {/* Widget 2 */}
            <div className="col-span-1 glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-xl">
              <div className="mb-4">
                <Target className="text-primary w-6 h-6 mb-2" />
                <h4 className="text-white font-semibold">Matched Roles</h4>
              </div>
              <p className="text-gray-400 text-xs">Top matches based on your latest resume update.</p>
              <div className="flex -space-x-2 mt-4 text-xs font-mono font-bold text-white">
                <span className="bg-surface border border-white/5 px-3 py-1 rounded-full">+ Front End</span>
                <span className="bg-surface border border-white/5 px-3 py-1 rounded-full z-10 hidden sm:inline-flex">+ UX Eng</span>
              </div>
            </div>
            {/* Widget 3 */}
            <div className="col-span-1 glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="absolute -bottom-4 right-0 w-24 h-24 bg-ai-accent/20 blur-[40px]" />
              <div className="mb-4">
                <Zap className="text-ai-accent w-6 h-6 mb-2" />
                <h4 className="text-white font-semibold relative z-10">AI Insights</h4>
              </div>
              <p className="text-gray-400 text-xs font-mono relative z-10">Your growth trajectory aligns with Senior Engineer level in 6 months.</p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 w-full">
          <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
            Data-Driven Confidence
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            See Your True <span className="gradient-text glow-primary">Potential</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Your skills are your currency. Our dashboard tracks your progression, analyzes market gaps, and visualizes exactly what it takes to get to the next level.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <div className="glass px-6 py-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-white font-medium">Skill Radar</span>
              <span className="text-gray-500 font-mono text-xs">Visualized Map</span>
            </div>
            <div className="glass px-6 py-4 rounded-xl border border-white/5 flex items-center justify-between">
              <span className="text-white font-medium">Gap Analysis</span>
              <span className="text-gray-500 font-mono text-xs">Actionable Path</span>
            </div>
          </div>
          <Link
            to="/signup"
            className="text-primary font-semibold hover:text-ai-accent transition-colors flex items-center gap-1"
          >
            View live dashboard <Target className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
