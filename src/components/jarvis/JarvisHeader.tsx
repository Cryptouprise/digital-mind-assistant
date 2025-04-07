
import React from 'react';

interface JarvisHeaderProps {
  branding: { company: string } | null;
}

const JarvisHeader: React.FC<JarvisHeaderProps> = ({ branding }) => {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-bold mb-2 text-white">Jarvis Assistant</h2>
      <p className="text-sm text-slate-300">For {branding?.company || 'Your Business'}</p>
    </div>
  );
};

export default JarvisHeader;
