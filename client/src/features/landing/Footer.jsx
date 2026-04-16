import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4 bg-background relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <span className="w-6 h-6 rounded bg-gradient-to-br from-primary to-ai-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="w-2.5 h-2.5 bg-white rounded-sm" />
          </span>
          DelphiMinds
        </div>
        <div className="flex gap-8 text-sm text-gray-500 font-mono">
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} DelphiMinds. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
