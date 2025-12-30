
import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Trash2, AlertCircle, Bot, Mic, Send } from 'lucide-react';
import { AssistantButton } from './components/AssistantButton';
import { MessageBubble } from './components/MessageBubble';
import { AssistantStatus, Message } from './types';
import { getAssistantResponse } from './services/gemini';

const App: React.FC = () => {
  const [status, setStatus] = useState<AssistantStatus>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
        setError(null);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        processUserQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone permission denied.");
        } else {
          setError(`Error: ${event.error}`);
        }
        setStatus('idle');
      };

      recognition.onend = () => {
        if (status === 'listening') {
          setStatus('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Your browser does not support Speech Recognition.");
    }
  }, [status]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Theme Toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setStatus('speaking');
      utterance.onend = () => setStatus('idle');
      utterance.onerror = () => setStatus('idle');
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
      if (preferredVoice) utterance.voice = preferredVoice;

      window.speechSynthesis.speak(utterance);
    }
  };

  const processUserQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setStatus('processing');
    setInputValue('');

    try {
      const aiResponse = await getAssistantResponse(messages, query);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      speak(aiResponse);
    } catch (err) {
      setError("Failed to get response from AI.");
      setStatus('idle');
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processUserQuery(inputValue);
  };

  const toggleListening = () => {
    if (status === 'listening') {
      recognitionRef.current?.stop();
    } else {
      if (status === 'speaking') {
        window.speechSynthesis.cancel();
      }
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Start error", e);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
    window.speechSynthesis.cancel();
    setStatus('idle');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'}`}></div>
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${theme === 'dark' ? 'bg-pink-500' : 'bg-pink-300'}`}></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-6 glass rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Nova</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status !== 'idle' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">System Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={clearChat}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors"
              title="Clear History"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </header>

        {/* Message Area */}
        <main className="flex-1 overflow-y-auto mb-6 pr-2 custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-8">
              <div className="w-20 h-20 mb-6 bg-indigo-500/10 rounded-full flex items-center justify-center">
                <Mic size={40} className="text-indigo-500" />
              </div>
              <h2 className="text-2xl font-light mb-2 italic">"How can I help you today?"</h2>
              <p className="text-sm max-w-xs">Type a message or tap the microphone below to start a conversation.</p>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="glass bg-red-500/10 border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3 text-red-400">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-xs font-bold uppercase hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        {/* Interaction Area */}
        <div className="flex flex-col items-center gap-6 pb-6">
          {/* Text Input */}
          <form 
            onSubmit={handleTextSubmit}
            className="w-full max-w-xl relative group"
          >
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="w-full glass bg-white/5 dark:bg-black/20 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm sm:text-base"
              disabled={status === 'processing'}
            />
            <button 
              type="submit"
              disabled={!inputValue.trim() || status === 'processing'}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white disabled:opacity-30 disabled:grayscale transition-all hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Microphone Button */}
          <AssistantButton 
            status={status} 
            onClick={toggleListening} 
          />
        </div>

        {/* Footer */}
        <footer className="mt-auto py-2 text-center opacity-30 text-[10px] uppercase tracking-[0.2em] font-bold">
          Powered by Gemini Intelligence • Nova Voice AI v1.1
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default App;
