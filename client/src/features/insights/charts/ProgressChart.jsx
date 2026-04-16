import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DEMO_DATA = [
  { month: 'Jan', skills: 15, progress: 20 },
  { month: 'Feb', skills: 18, progress: 28 },
  { month: 'Mar', skills: 20, progress: 35 },
  { month: 'Apr', skills: 22, progress: 42 },
  { month: 'May', skills: 24, progress: 55 },
  { month: 'Jun', skills: 26, progress: 62 },
  { month: 'Jul', skills: 28, progress: 68 },
  { month: 'Aug', skills: 30, progress: 72 },
];

export default function ProgressChart({ data = DEMO_DATA }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-white mb-4">Progress Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gradientBrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cfc" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#7c5cfc" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}
            labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="progress"
            stroke="#7c5cfc"
            strokeWidth={2}
            fill="url(#gradientBrand)"
            name="Overall Progress %"
          />
          <Area
            type="monotone"
            dataKey="skills"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#gradientAccent)"
            name="Skills Count"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-500" />
          <span className="text-xs text-slate-400">Overall Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent-500" />
          <span className="text-xs text-slate-400">Skills Count</span>
        </div>
      </div>
    </motion.div>
  );
}
