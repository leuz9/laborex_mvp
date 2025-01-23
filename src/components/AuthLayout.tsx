import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
        >
          <source src="https://cdn.pixabay.com/video/2024/07/01/218955_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <img
              src="https://eyone.net/wp-content/uploads/2023/10/logo.png"
              alt="Eyone Logo"
              className="h-12"
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}