"use client";
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, User, Bot } from 'lucide-react';

export default function AiStylist() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Azhagii Personal Stylist. Tell me about the occasion, your style preferences, or body type, and I will find the perfect dress for you.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/stylist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages.filter(m => m.role !== 'system'), userMessage] })
      });
      const data = await res.json();

      if (data.choices && data.choices.length > 0) {
        const aiMessage = data.choices[0].message;
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I am sorry, I am having trouble connecting right now.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'There was an error connecting to the stylist.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      // Handle markdown bullets
      let displayLine = line;
      if (displayLine.trim().startsWith('* ')) {
        displayLine = displayLine.replace('* ', '• ');
      }

      return (
        <span key={i}>
          {displayLine.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('[') && part.endsWith(')')) {
              const textMatch = part.match(/\[(.*?)\]/);
              const urlMatch = part.match(/\((.*?)\)/);
              if (textMatch && urlMatch) {
                return (
                  <a
                    key={j}
                    href={urlMatch[1]}
                    className="text-secondary hover:underline underline-offset-2 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {textMatch[1]}
                  </a>
                );
              }
            }
            return part;
          })}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-on-surface text-surface p-4 rounded-full shadow-2xl hover:scale-105 transition-transform ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-surface border border-outline-variant/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-surface-container-low p-4 border-b border-outline-variant/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-[#7e572e]" />
                <span className="font-headline font-bold text-sm tracking-wide">VIP Stylist</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100 transition-opacity">
                <X size={18} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-bright custom-scrollbar">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary text-surface' : 'bg-surface-container-high text-on-surface'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-secondary/10 text-on-surface rounded-tr-none' : 'bg-surface-container text-on-surface rounded-tl-none'} max-w-[80%]`}>
                    {formatMessage(msg.content)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-surface-container-high text-on-surface">
                    <Bot size={14} />
                  </div>
                  <div className="p-3 rounded-xl text-sm bg-surface-container text-on-surface rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-outline rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-outline-variant/10 bg-surface flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your stylist..."
                className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-full px-4 py-2 text-sm outline-none focus:border-secondary transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-on-surface text-surface flex items-center justify-center shrink-0 hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
