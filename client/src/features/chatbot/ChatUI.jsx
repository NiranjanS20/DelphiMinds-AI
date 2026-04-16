import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, Trash2 } from 'lucide-react';
import MessageBubble from './MessageBubble';
import chatbotService from './chatbotService';
import { CHAT_PLACEHOLDER_MESSAGES } from '../../utils/constants';

const DEMO_RESPONSES = [
  "Based on your skill profile, I'd recommend focusing on system design and cloud architecture. These are the most in-demand skills for senior engineering roles right now.\n\nHere's a suggested learning path:\n1. Start with distributed systems fundamentals\n2. Practice with real-world architecture problems\n3. Get hands-on with AWS/GCP services\n4. Build a portfolio project showcasing these skills",
  "Great question! For transitioning into a Machine Learning role, you'll want to:\n\n• Strengthen your Python skills (you're at 75% — aim for 85%+)\n• Learn scikit-learn, TensorFlow, or PyTorch\n• Study linear algebra and statistics\n• Build 2-3 ML projects for your portfolio\n• Consider Andrew Ng's ML Specialization on Coursera\n\nYour existing programming foundation is solid — the transition is very achievable!",
  "Looking at your resume analysis, your strongest areas are frontend development and API design. Here are some interview tips:\n\n🎯 **Technical Preparation:**\n- Practice React optimization patterns\n- Review common system design questions\n- Prepare examples of scalable architectures you've built\n\n💡 **Behavioral Tips:**\n- Use the STAR method for storytelling\n- Quantify your impact (e.g., 'improved load time by 40%')\n- Prepare questions about team culture and tech stack",
  "I'd suggest exploring these career paths based on your profile:\n\n1. **Senior Full-Stack Engineer** — High demand, great salary growth\n2. **Technical Lead** — Leverage your broad skill set\n3. **Solutions Architect** — Growing field, combines coding + design\n4. **ML Engineer** — Emerging opportunity with your Python skills\n\nWould you like me to dive deeper into any of these paths?",
];

export default function ChatUI() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI Career Mentor. 🧠\n\nI can help you with:\n• Career path recommendations\n• Interview preparation\n• Skill development strategies\n• Resume improvement tips\n\nWhat would you like to explore today?",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  let responseIndex = useRef(0);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % CHAT_PLACEHOLDER_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const simulateTyping = (text) => {
    return new Promise((resolve) => {
      setIsTyping(true);
      const delay = Math.min(1000 + text.length * 10, 3000);
      setTimeout(() => {
        setIsTyping(false);
        resolve();
      }, delay);
    });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: Date.now(), text: trimmed, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      // Try backend first
      const response = await chatbotService.sendMessage(trimmed, messages);
      await simulateTyping(response.message || response.reply);
      const botMsg = {
        id: Date.now() + 1,
        text: response.message || response.reply,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Fall back to demo responses
      const demoText = DEMO_RESPONSES[responseIndex.current % DEMO_RESPONSES.length];
      responseIndex.current += 1;
      await simulateTyping(demoText);
      const botMsg = { id: Date.now() + 1, text: demoText, isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    }

    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
    responseIndex.current = 0;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-2rem)] font-mono">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 font-sans"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ai-accent flex items-center justify-center glow-ai">
              <Bot className="w-5 h-5 text-white" />
            </div>
            AI Career Mentor
          </h1>
          <p className="text-gray-400 mt-1 ml-[52px]">Your personal AI-powered career advisor</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-surface transition-all cursor-pointer"
          title="Clear chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass-card p-4 lg:p-6 flex flex-col gap-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
        ))}
        {isTyping && <MessageBubble isBot isTyping />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 font-sans">
          {[
            'What career paths suit me?',
            'Help me prepare for interviews',
            'How do I learn system design?',
            'Review my skill gaps',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => { setInput(suggestion); }}
              className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium text-ai-accent bg-ai-accent/10 border border-ai-accent/20 hover:bg-ai-accent/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 inline mr-1.5" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="mt-3 flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={CHAT_PLACEHOLDER_MESSAGES[placeholderIndex]}
            rows={1}
            className="w-full px-4 py-3 pr-4 rounded-2xl bg-surface border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-ai-accent/50 focus:ring-2 focus:ring-ai-accent/20 transition-all resize-none font-mono text-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = '48px';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-ai-accent flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg glow-ai shrink-0"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
