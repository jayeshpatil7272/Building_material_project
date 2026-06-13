'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

export default function Chatbot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState<'chat' | 'leadName' | 'leadPhone' | 'finished'>('chat');
  const [leadData, setLeadData] = useState({ name: '', phone: '' });
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { sender: 'bot', text: t('chat.welcome') }
      ]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const updatedMessages: ChatMessage[] = [...messages, { sender: 'user', text }];
    setMessages(updatedMessages);
    setInputValue('');

    if (step === 'leadName') {
      setLeadData(prev => ({ ...prev, name: text }));
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: language === 'hi' ? 'कृपया अपना 10 अंकों का मोबाइल नंबर प्रदान करें ताकि हम आपसे संपर्क कर सकें।' : language === 'mr' ? 'कृपया आपला १० अंकी मोबाईल नंबर द्या जेणेकरून आम्ही संपर्क करू शकू.' : 'Please provide your 10-digit mobile number so we can reach you.' }
      ]);
      setStep('leadPhone');
      return;
    }

    if (step === 'leadPhone') {
      const cleanPhone = text.replace(/[^0-9+]/g, '');
      if (cleanPhone.length < 8) {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: language === 'hi' ? 'कृपया एक वैध मोबाइल नंबर दर्ज करें।' : language === 'mr' ? 'कृपया एक वैध मोबाईल नंबर टाका.' : 'Please enter a valid mobile number.' }
        ]);
        return;
      }
      setLeadData(prev => ({ ...prev, phone: cleanPhone }));
      setStep('finished');

      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadData.name,
            phone: cleanPhone,
            email: '',
            division: 'chatbot',
            message: `Lead collected via materials Chatbot. User asked: "${messages[messages.length - 2]?.text || 'No history'}"`
          })
        });

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });

        setMessages(prev => [
          ...prev,
          {
            sender: 'bot',
            text: language === 'hi'
              ? `धन्यवाद ${leadData.name}! आपकी पूछताछ दर्ज कर ली गई है। हमारी सेल्स टीम जल्द ही आपसे संपर्क करेगी।`
              : language === 'mr'
              ? `धन्यवाद ${leadData.name}! तुमची चौकशी यशस्वीरित्या नोंदवली गेली आहे. आमची सेल्स टीम लवकरच संपर्क करेल.`
              : `Thank you ${leadData.name}! Your materials inquiry is logged. Our sales team will contact you shortly.`
          }
        ]);
      } catch (err) {
        console.error('Failed to submit chatbot lead', err);
      }
      return;
    }

    // Call backend /api/chat route
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        
        if (data.reply.toLowerCase().includes('callback') || data.reply.includes('नाम साझा करें') || data.reply.includes('नाव कळवा') || data.reply.includes('register a callback')) {
          setStep('leadName');
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: language === 'hi' ? 'क्षमा करें, सर्वर त्रुटि। कृपया सीधे कॉल करें।' : language === 'mr' ? 'क्षमस्व, सर्व्हर एरर. कृपया डायरेक्ट संपर्क करा.' : 'Sorry, connection failed. Please call our sales team directly.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickOptionClick = async (optionKey: string) => {
    let userMsg = '';
    if (optionKey === 'hotel') userMsg = t('chat.opt.hotel');
    else if (optionKey === 'sand') userMsg = t('chat.opt.sand');
    else if (optionKey === 'materials') userMsg = t('chat.opt.materials');
    else userMsg = t('chat.opt.support');

    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);

    setIsTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, language })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        
        if (data.reply.toLowerCase().includes('callback') || data.reply.includes('नाम साझा करें') || data.reply.includes('नाव कळवा') || data.reply.includes('register a callback')) {
          setStep('leadName');
        }
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, connection failed. Please try again.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[330px] sm:w-[380px] h-[480px] glassmorphism rounded-2xl shadow-2xl border border-premium-border/80 flex flex-col mb-4 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-const-gray to-const-orange p-4 flex items-center justify-between border-b border-premium-border">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-const-orange animate-bounce" />
              <div>
                <h4 className="text-sm font-semibold text-white tracking-wide">Shree Ram Assistant</h4>
                <p className="text-[10px] text-gray-300">Online | Materials Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 no-scrollbar bg-[#09090d]/80">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'user' ? 'bg-const-orange' : 'bg-const-gray'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-const-orange" />
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-const-orange/15 text-white border border-const-orange/30 rounded-tr-none'
                        : 'bg-white/5 text-gray-200 border border-premium-border/30 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-center space-x-2 animate-fadeIn">
                <div className="w-6 h-6 rounded-full bg-const-gray flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-const-orange" />
                </div>
                <div className="p-3 bg-white/5 border border-premium-border/30 rounded-2xl rounded-tl-none text-xs text-gray-400 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Options */}
          {step === 'chat' && messages.length === 1 && (
            <div className="px-4 py-2 border-t border-premium-border/40 bg-[#0a0a0f]/40 space-y-1.5">
              <button
                onClick={() => handleQuickOptionClick('hotel')}
                className="w-full text-left text-[11px] text-const-orange bg-const-orange/5 border border-const-orange/15 px-3 py-1.5 rounded-lg hover:bg-const-orange/10 transition-colors"
              >
                🏗️ {t('chat.opt.hotel')}
              </button>
              <button
                onClick={() => handleQuickOptionClick('sand')}
                className="w-full text-left text-[11px] text-const-orange bg-const-orange/5 border border-const-orange/15 px-3 py-1.5 rounded-lg hover:bg-const-orange/10 transition-colors"
              >
                🚚 {t('chat.opt.sand')}
              </button>
              <button
                onClick={() => handleQuickOptionClick('materials')}
                className="w-full text-left text-[11px] text-const-orange bg-const-orange/5 border border-const-orange/15 px-3 py-1.5 rounded-lg hover:bg-const-orange/10 transition-colors"
              >
                🧱 {t('chat.opt.materials')}
              </button>
              <button
                onClick={() => handleQuickOptionClick('support')}
                className="w-full text-left text-[11px] text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                📞 {t('chat.opt.support')}
              </button>
            </div>
          )}

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-3 border-t border-premium-border bg-[#0b0b0f] flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                step === 'leadName'
                  ? 'Enter your name...'
                  : step === 'leadPhone'
                  ? 'Enter phone number...'
                  : 'Ask about cement, steel, bricks...'
              }
              className="flex-1 bg-white/5 border border-premium-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-const-orange"
            />
            <button
              type="submit"
              className="bg-const-orange text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-const-orange text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform relative border border-white/20"
      >
        <MessageSquare className="w-6 h-6" />
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
            1
          </span>
        )}
      </button>
    </div>
  );
}
