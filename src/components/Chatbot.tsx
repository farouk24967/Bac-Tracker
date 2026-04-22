import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Copy, ExternalLink } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { AI_TOOLS } from '../constants';

import { UserProfile, Language } from '../types';
import { translations } from '../translations';

interface ChatbotProps {
  userProfile: UserProfile;
}

export const Chatbot: React.FC<ChatbotProps> = ({ userProfile }) => {
  const lang: Language = userProfile.language || 'fr';
  const t = translations[lang];
  const [messages, setMessages] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([
    { 
      role: 'model', 
      parts: [{ text: lang === 'ar' ? `مرحباً ${userProfile.displayName}! أنا مساعدك DzBac. كيف يمكنني مساعدتك اليوم؟` : 
                       lang === 'en' ? `Hello ${userProfile.displayName}! I am your DzBac assistant. How can I help you today?` :
                       lang === 'es' ? `¡Hola ${userProfile.displayName}! Soy tu asistente DzBac. ¿Cómo puedo ayudarte hoy?` :
                       `Salut ${userProfile.displayName} ! Je suis ton assistant DzBac. Comment puis-je t'aider aujourd'hui ?` }] 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setLoading(true);

    const response = await chatWithAI(userMessage, userProfile, messages);
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: response }] }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-primary-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">{t.chatbot}</h2>
            <p className="text-xs text-primary-100">
              {lang === 'ar' ? "متصل لمساعدتك" : "En ligne pour t'aider"}
            </p>
          </div>
        </div>
        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === 'user' ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none shadow-md shadow-primary-100' 
                    : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {m.parts[0].text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/50">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {AI_TOOLS.map(tool => (
            <button
              key={tool.name}
              onClick={() => setInput(`Comment utiliser ${tool.name} pour réviser ?`)}
              className="whitespace-nowrap px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm"
            >
              {tool.name}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'ar' ? "اطرح سؤالك هنا..." : 
                         lang === 'en' ? "Ask your question here..." :
                         lang === 'es' ? "Haz tu pregunta aquí..." :
                         "Pose ta question ici..."}
            className="w-full p-4 pr-12 rounded-2xl bg-white border-2 border-slate-100 focus:border-primary-600 focus:bg-white transition-all outline-none shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
