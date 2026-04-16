import { motion } from 'framer-motion';
import { Terminal, Send, MessageSquare } from 'lucide-react';

export default function ChatPreview() {
  return (
    <section className="py-20 lg:py-32 px-4 max-w-7xl mx-auto" id="chat">
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
        {/* Left Side: Mock UI */}
        <div className="flex-1 w-full relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 bg-background/80"
          >
            <div className="h-12 bg-surface/50 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="ml-4 font-mono text-xs text-gray-500 flex items-center gap-2">
                <Terminal className="w-3 h-3" /> mentor-chat.session
              </div>
            </div>
            <div className="p-6 space-y-6 font-mono text-sm">
              <div className="flex flex-col gap-4">
                <div className="self-end bg-surface border border-white/5 p-4 rounded-2xl rounded-tr-sm text-gray-300 max-w-[80%] shadow-lg">
                  I want to transition from a React Developer to a UX Engineer. What's missing?
                </div>
                <div className="self-start bg-ai-accent/10 border border-ai-accent/20 p-4 rounded-2xl rounded-tl-sm text-ai-accent max-w-[85%] shadow-lg shadow-ai-accent/5">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-bold tracking-tight uppercase text-xs">Delphi AI</span>
                  </div>
                  <p className="leading-relaxed">
                    Based on your resume, you have strong frontend implementation skills. To pivot to UX Engineer, you need to gap-fill the following:
                  </p>
                  <ul className="list-disc list-inside mt-3 ml-4 space-y-1 text-gray-300">
                    <li>Interaction Design principles</li>
                    <li>Prototyping tools (Framer, Protopie)</li>
                    <li>User Research methodologies</li>
                  </ul>
                  <p className="mt-3 leading-relaxed">
                    I recommend building an interactive prototype case study. Want me to generate a roadmap?
                  </p>
                </div>
              </div>
              <div className="relative mt-4">
                <input
                  type="text"
                  placeholder="Ask your follow-up..."
                  className="w-full bg-surface/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white font-sans outline-none focus:border-ai-accent/50 focus:ring-1 focus:ring-ai-accent/50 transition-all font-mono text-sm placeholder:text-gray-600"
                  disabled
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors" disabled>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Copy */}
        <div className="flex-1 w-full text-left">
          <div className="inline-block px-4 py-1.5 rounded-full bg-ai-accent/10 border border-ai-accent/20 text-ai-accent text-sm font-semibold mb-6">
            Always Available
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Your Personal <br /> <span className="gradient-text glow-ai">Career Mentor</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            Forget generic advice. Chat with an AI that understands your exact skill sets, work history, and industry trends to guide you exactly where you want to go.
          </p>
          <ul className="space-y-4">
            {['Contextualized to your resume', 'Actionable interview prep', 'Real-time skill assessments'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-300">
                <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
