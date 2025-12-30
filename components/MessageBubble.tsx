
import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`flex max-w-[85%] sm:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600 dark:text-gray-300" />}
        </div>
        <div className={`px-4 py-3 rounded-2xl glass ${isUser ? 'bg-indigo-500/20 rounded-tr-none' : 'rounded-tl-none'}`}>
          <p className="text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-100">
            {message.content}
          </p>
          <span className="block text-[10px] mt-1 opacity-50 font-medium">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};
