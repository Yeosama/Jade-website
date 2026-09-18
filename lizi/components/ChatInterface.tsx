import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../types';
import { generateMuseumResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  currentJadeId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentJadeId, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset history when jade changes
  useEffect(() => {
    setHistory([
        { role: 'model', text: 'Greetings. I am the curator. Ask me anything about this magnificent piece.' }
    ]);
  }, [currentJadeId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    const newHistory = [...history, { role: 'user', text: userMsg } as ChatMessage];
    setHistory(newHistory);

    const response = await generateMuseumResponse(currentJadeId, userMsg, newHistory);

    setHistory([...newHistory, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="absolute right-4 bottom-24 w-80 md:w-96 bg-black/80 backdrop-blur-md border border-jade-900 rounded-lg overflow-hidden shadow-2xl flex flex-col h-96 z-50 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-jade-950/80 p-3 border-b border-jade-900 flex justify-between items-center">
        <div className="flex items-center gap-2 text-jade-300">
          <Sparkles size={16} />
          <span className="font-serif font-bold text-sm">Museum Curator AI</span>
        </div>
        <button onClick={onClose} className="text-jade-700 hover:text-jade-400 transition">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-jade-800 text-white rounded-br-none'
                  : 'bg-neutral-900 text-jade-100 border border-jade-900/50 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-neutral-900 px-3 py-2 rounded-lg border border-jade-900/50 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-jade-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-jade-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-jade-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-black/50 border-t border-jade-900 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about history, symbolism..."
          className="flex-1 bg-neutral-900/50 border border-jade-900/50 rounded px-3 py-2 text-sm text-white placeholder-jade-800/50 focus:outline-none focus:border-jade-600 focus:ring-1 focus:ring-jade-600 transition"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-jade-900 hover:bg-jade-800 disabled:opacity-50 text-jade-100 p-2 rounded transition border border-jade-800"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
