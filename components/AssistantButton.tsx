
import React from 'react';
import { Mic, MicOff, Loader2, Volume2 } from 'lucide-react';
import { AssistantStatus } from '../types';

interface AssistantButtonProps {
  status: AssistantStatus;
  onClick: () => void;
  disabled?: boolean;
}

export const AssistantButton: React.FC<AssistantButtonProps> = ({ status, onClick, disabled }) => {
  const getIcon = () => {
    switch (status) {
      case 'listening':
        return <Mic className="w-10 h-10 text-white animate-pulse" />;
      case 'processing':
        return <Loader2 className="w-10 h-10 text-white animate-spin" />;
      case 'speaking':
        return <Volume2 className="w-10 h-10 text-white" />;
      default:
        return <Mic className="w-10 h-10 text-white" />;
    }
  };

  const getButtonClass = () => {
    const base = "relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 transform hover:scale-110 shadow-2xl focus:outline-none";
    
    switch (status) {
      case 'listening':
        return `${base} bg-red-500 text-red-500 pulse-ring`;
      case 'processing':
        return `${base} bg-indigo-600`;
      case 'speaking':
        return `${base} bg-green-500`;
      default:
        return `${base} bg-indigo-500 hover:bg-indigo-600`;
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={onClick}
        disabled={disabled || status === 'processing'}
        className={getButtonClass()}
      >
        {getIcon()}
      </button>
      <span className="text-sm font-medium tracking-wide opacity-80 uppercase transition-opacity duration-300">
        {status === 'listening' ? 'Listening...' : 
         status === 'processing' ? 'Processing...' : 
         status === 'speaking' ? 'Speaking...' : 'Tap to Speak'}
      </span>
    </div>
  );
};
