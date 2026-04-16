import { motion } from 'framer-motion';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip,
} from 'recharts';

const DEMO_DATA = [
  { skill: 'React', level: 90, fullMark: 100 },
  { skill: 'Python', level: 75, fullMark: 100 },
  { skill: 'Node.js', level: 82, fullMark: 100 },
  { skill: 'SQL', level: 70, fullMark: 100 },
  { skill: 'System Design', level: 45, fullMark: 100 },
  { skill: 'AWS', level: 60, fullMark: 100 },
  { skill: 'Docker', level: 55, fullMark: 100 },
  { skill: 'TypeScript', level: 85, fullMark: 100 },
];

export default function SkillRadar({ data = DEMO_DATA }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-white mb-4">Skills Radar</h3>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(148, 163, 184, 0.1)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            name="Skill Level"
            dataKey="level"
            stroke="#7c5cfc"
            fill="#7c5cfc"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
            itemStyle={{ color: '#7c5cfc' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
