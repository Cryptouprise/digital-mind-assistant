
import React from 'react';

interface JarvisChatMessageProps {
  message: {
    user: string;
    bot: string;
  };
}

const JarvisChatMessage: React.FC<JarvisChatMessageProps> = ({ message }) => {
  return (
    <div className="space-y-2">
      <div className="bg-blue-600/20 p-3 rounded-lg">
        <p className="font-semibold text-blue-200 mb-1">You</p>
        <p className="text-white">{message.user}</p>
      </div>
      <div className="bg-slate-800 p-3 rounded-lg">
        <p className="font-semibold text-blue-200 mb-1">Jarvis</p>
        <p className="text-white whitespace-pre-wrap">{message.bot}</p>
      </div>
    </div>
  );
};

export default JarvisChatMessage;
