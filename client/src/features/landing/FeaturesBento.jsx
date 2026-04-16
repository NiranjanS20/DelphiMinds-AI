import { motion } from 'framer-motion';
import { FileSearch, Navigation, MessageSquare, Target, Activity } from 'lucide-react';

const features = [
  {
    title: 'Resume Analysis',
    description: 'AI parses your exact skills, formatting, and impact metrics instantly.',
    icon: <FileSearch className="w-6 h-6 text-primary" />,
    className: 'md:col-span-2 md:row-span-2'
  },
  {
    title: 'Skill Gap Detection',
    description: 'Identify exact missing qualifications for your dream role.',
    icon: <Target className="w-6 h-6 text-accent" />,
    className: 'md:col-span-1 md:row-span-1'
  },
  {
    title: 'Career Roadmaps',
    description: 'Step-by-step personalized guide from Junior to Lead.',
    icon: <Navigation className="w-6 h-6 text-ai-accent" />,
    className: 'md:col-span-1 md:row-span-1'
  },
  {
    title: 'AI Mentor Chatbot',
    description: '24/7 expert advice tailored to your data.',
    icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
    className: 'md:col-span-1 md:row-span-1'
  },
  {
    title: 'Progress Dashboard',
    description: 'Track your growth over time with visual analytics.',
    icon: <Activity className="w-6 h-6 text-purple-400" />,
    className: 'md:col-span-2 md:row-span-1'
  }
];

export default function FeaturesBento() {
  return (
    <section className="py-20 lg:py-32 px-4 max-w-7xl mx-auto" id="features">
      <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
          Everything You Need to <span className="gradient-text glow-ai">Scale</span>
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          DelphiMinds bundles every critical step of career building into a seamless, intelligent platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 auto-rows-[minmax(180px,auto)]">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`glass p-8 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-white/10 transition-colors ${feature.className}`}
          >
            <div className="mb-6 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
