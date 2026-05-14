import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Bot, Loader2, Camera, Paperclip } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function ChatBot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([
    { role: 'bot', content: t('chatbot.greeting') }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: t('chatbot.error'),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: `[Image Upload: ${file.name}]` }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/chat/vision`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Vision analysis failed');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Vision error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I couldn't analyze that image. Please try again or explain the issue." }]);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1001]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] glass-dark rounded-[30px] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-brand-blue/50 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center p-2">
                  <Bot className="text-white w-full h-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-none">{t('chatbot.title')}</h3>
                  <span className="text-[10px] text-green-400 flex items-center gap-1 mt-1 font-medium">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    {t('chatbot.status')}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-[20px]",
                    msg.role === 'user' 
                      ? "bg-brand-red text-white rounded-tr-none" 
                      : "glass text-white/90 rounded-tl-none shadow-lg border border-white/5"
                  )}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-white/30 mt-1 px-2 font-medium">
                    {msg.role === 'user' ? 'You' : 'KeyPro AI Assistant'}
                  </span>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex gap-2 items-center text-white/40 ml-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-[10px] font-medium tracking-wider">AI IS ANALYZING...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 glass border-t border-white/10">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full py-1 px-2 pr-1 focus-within:border-brand-red focus-within:bg-white/10 transition-all group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                  title="Upload dashboard photo for AI diagnostic"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('chatbot.placeholder')}
                  className="flex-1 bg-transparent border-none py-2 px-2 focus:outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className="w-10 h-10 bg-brand-red rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-white/30 mt-2 px-4 text-center">
                Tip: Upload a photo of your dashboard for an instant AI diagnostic.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-red rounded-full flex items-center justify-center shadow-2xl bg-glow-red relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <MessageSquare className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Pulsing notification bit */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-white rounded-full flex items-center justify-center text-[10px] text-brand-red font-bold animate-bounce border-2 border-brand-red">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
