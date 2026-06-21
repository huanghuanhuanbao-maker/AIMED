import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex space-x-1.5 items-center p-1 h-5">
      <div className="w-2 h-2 bg-medical-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-medical-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-medical-600 rounded-full animate-bounce"></div>
    </div>
  );
};
