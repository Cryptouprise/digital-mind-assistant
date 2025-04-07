
import React from 'react';
import JarvisChatMessage from './JarvisChatMessage';

interface JarvisChatLogProps {
  chatLog: { user: string; bot: string }[];
}

const JarvisChatLog: React.FC<JarvisChatLogProps> = ({ chatLog }) => {
  if (chatLog.length === 0) {
    return (
      <div className="text-center text-slate-400 mt-8">
        <p>Ask Jarvis anything to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chatLog.map((entry, idx) => (
        <JarvisChatMessage key={idx} message={entry} />
      ))}
    </div>
  );
};

export default JarvisChatLog;
