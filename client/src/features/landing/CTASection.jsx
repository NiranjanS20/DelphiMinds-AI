import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-20 lg:py-32 px-4 relative overflow-hidden" id="cta">
      <div className="absolute inset-0 bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="max-w-4xl mx-auto rounded-3xl p-8 lg:p-16 border border-white/10 glass shadow-2xl relative z-10 bg-surface/50 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 flex flex-col items-center justify-center mx-auto mb-6 ring-1 ring-primary/30">
            <span className="text-primary font-bold text-xl">🚀</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Ready to <span className="gradient-text glow-ai">Level Up?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
            Join thousands of professionals securing better roles with AI career intelligence. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white font-semibold text-lg hover:bg-primary/90 transition-all glow-primary hover:scale-[1.02] active:scale-95"
            >
              Start for Free <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
