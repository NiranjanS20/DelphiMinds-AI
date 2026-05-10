import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, Sparkles, Trash2, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import chatbotService from './chatbotService';
import chatSession from '../../services/chatSession';
import { CHAT_PLACEHOLDER_MESSAGES } from '../../utils/constants';

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
  const [sessionId, setSessionId] = useState(() => chatSession.getActiveSessionId());
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load existing chat history if session exists
  useEffect(() => {
    const existingSession = chatSession.getActiveSessionId();
    if (existingSession) {
      setSessionId(existingSession);
      chatbotService.getHistory(existingSession)
        .then((data) => {
          const history = data?.data?.messages || data?.messages || [];
          if (Array.isArray(history) && history.length > 0) {
            const mapped = history.map((msg, i) => ({
              id: Date.now() + i,
              text: msg.content || msg.text || msg.message || '',
              isBot: msg.role === 'assistant' || msg.isBot === true,
            }));
            setMessages((prev) => [...prev, ...mapped]);
          }
        })
        .catch(() => {
          // Session history load failed — continue with fresh chat
        });
    }
  }, []);

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

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { id: Date.now(), text: trimmed, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(trimmed, sessionId);
      const replyText = response?.data?.reply || response?.reply || response?.data?.message || response?.message || 'I received your message but couldn\'t generate a response. Please try again.';

      // Persist session ID for conversation continuity
      const newSessionId = response?.data?.sessionId || response?.sessionId;
      if (newSessionId) {
        setSessionId(newSessionId);
        chatSession.setActiveSessionId(newSessionId);
      }

      setIsTyping(false);
      const botMsg = { id: Date.now() + 1, text: replyText, isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setIsTyping(false);
      const errorText = err.response?.data?.message || 'AI service is temporarily unavailable. Please try again in a moment.';
      const errorMsg = {
        id: Date.now() + 1,
        text: errorText,
        isBot: true,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
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
    chatSession.clearActiveSession();
    setSessionId(null);
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
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-ai-accent flex items-center justify-center glow-ai">
              <Bot className="w-5 h-5 text-white" />
            </div>
            AI Career Mentor
          </h1>
          <p className="text-text-muted mt-1 ml-[52px]">Your personal AI-powered career advisor</p>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl text-text-subtle hover:text-text-main hover:bg-surface-50 transition-all cursor-pointer"
          title="Clear chat"
          aria-label="Clear chat history"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto glass-card p-4 lg:p-6 flex flex-col gap-4" role="log" aria-label="Chat messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.isError ? (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-error-muted border border-error/20">
                <AlertCircle className="w-4 h-4 text-error mt-0.5 shrink-0" />
                <p className="text-sm text-error">{msg.text}</p>
              </div>
            ) : (
              <MessageBubble message={msg.text} isBot={msg.isBot} />
            )}
          </div>
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
              className="shrink-0 px-3 py-2 rounded-xl text-xs font-medium text-ai-accent bg-ai-accent-muted border border-ai-accent/20 hover:bg-ai-accent/15 transition-all cursor-pointer whitespace-nowrap"
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
            className="w-full px-4 py-3 pr-4 rounded-2xl bg-surface border border-border text-text-main placeholder-text-subtle focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all resize-none font-mono text-sm"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = '48px';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            aria-label="Type your message"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-ai-accent flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-lg glow-ai shrink-0"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
