'use client';
import { useEffect, useState } from "react";

export default function SplashScreen({ finishLoading }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timeout to hide the splash screen after a delay
    const timeout = setTimeout(() => {
      setIsVisible(false);
      finishLoading();
    }, 3000); // Duration for splash screen (3 seconds)

    return () => clearTimeout(timeout);
  }, [finishLoading]);

  return (
    <div
      className={`${
        isVisible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-1000 fixed inset-0 flex flex-col items-center justify-center bg-white w-screen h-screen `}
    >
      {/* Logo */}
      <img src="/sync-draw-logo.ico" alt="Sync Draw Logo" className="h-32 w-auto mb-4 animate-fade-in-up" />

      {/* Heading */}
      <h1 className="text-2xl font-bold text-blue-700 animate-fade-in-up delay-500">Draw Together, Talk Together</h1>
      <p className="text-lg font-medium text-gray-500 mt-2 animate-fade-in-up delay-700">
        Real-Time Collaborative Canvas
      </p>

      <style jsx>{`
        /* Keyframes for fade-in-up animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease forwards;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
