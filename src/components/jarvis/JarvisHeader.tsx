
import React from 'react';

interface JarvisHeaderProps {
  branding: { company: string } | null;
  subtitle?: string;
  logoUrl?: string;
}

const JarvisHeader: React.FC<JarvisHeaderProps> = ({ branding, subtitle, logoUrl }) => {
  return (
    <div className="mb-4 flex items-center gap-3">
      {logoUrl && (
        <div className="rounded-full bg-blue-600/20 p-2">
          <img src={logoUrl} alt="Jarvis Logo" className="h-10 w-10" />
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold mb-1 text-white">Jarvis Assistant</h2>
        <p className="text-sm text-slate-300">
          {subtitle || `For ${branding?.company || 'Your Business'}`}
        </p>
      </div>
    </div>
  );
};

export default JarvisHeader;
