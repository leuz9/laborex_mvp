import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Logo avec effet de pulsation */}
        <div className="relative z-10">
          <img
            src="https://cdn1.vc4a.com/media/2017/06/eyone-logo.png"
            alt="Eyone Logo"
            className="w-24 h-24 object-contain animate-pulse"
          />
        </div>

        {/* Cercles concentriques animés */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-32 h-32 border-4 border-blue-500/30 rounded-full animate-ping" />
          <div className="absolute w-32 h-32 border-4 border-blue-400/40 rounded-full animate-pulse" />
          <div className="absolute w-32 h-32 border-t-4 border-blue-600 rounded-full animate-spin" />
        </div>

        {/* Effet de particules */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      {/* Message de chargement avec effet de typing */}
      <div className="mt-8 text-white font-medium relative">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">{'>'}</span>
          <span className="animate-typing overflow-hidden whitespace-nowrap border-r-2 border-blue-400 pr-1">
            Chargement en cours...
          </span>
        </div>
      </div>

      {/* Points de chargement animés */}
      <div className="mt-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-500 animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;