import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '../../utils/helpers';

/**
 * Chat message bubble component.
 */
export default function MessageBubble({ message, isBot = false, isTyping = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex gap-3 max-w-[85%]',
        isBot ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-xl flex items-center justify-center shrink-0',
        isBot
          ? 'bg-surface border border-ai-accent/30 glow-ai'
          : 'bg-primary'
      )}>
        {isBot ? (
          <Bot className="w-4 h-4 text-ai-accent" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message */}
      <div className={cn(
        'px-4 py-3 rounded-2xl text-sm leading-relaxed font-mono',
        isBot
          ? 'bg-surface border border-ai-accent/20 text-gray-200 rounded-tl-md glow-ai'
          : 'bg-primary text-white rounded-tr-md shadow-md'
      )}>
        {isTyping ? (
          <div className="flex items-center gap-1.5 py-1 px-1">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-gray-400"
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{message}</p>
        )}
      </div>
    </motion.div>
  );
}
