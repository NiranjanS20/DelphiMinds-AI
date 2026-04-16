import { motion } from 'framer-motion';

const steps = [
  { no: '01', title: 'Upload Resume', desc: 'Securely upload your PDF or DOCX file to the platform.' },
  { no: '02', title: 'AI Extraction', desc: 'Our engine identifies skills, impact mapping, and layout.' },
  { no: '03', title: 'Get Recommendations', desc: 'View personalized skill gaps and role-fit scores.' },
  { no: '04', title: 'Track Growth', desc: 'Follow structured roadmaps and monitor your career trajectory.' },
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-surface/30 relative border-y border-white/5" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            How <span className="text-ai-accent font-mono font-normal">DelphiMinds</span> Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A frictionless pipeline from a standard resume to an actionable master plan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 glass rounded-2xl border border-white/5 hover:border-primary/30 transition-all flex flex-col h-full"
            >
              <div className="text-5xl font-mono font-bold text-white/5 absolute top-4 right-4">{step.no}</div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mb-6 ring-1 ring-primary/30">
                {i + 1}
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-3">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
