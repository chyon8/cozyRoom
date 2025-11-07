import { useEffect, useState } from 'react';
import { Environment } from '../App';

interface EnvironmentViewerProps {
  environment: Environment;
}

export function EnvironmentViewer({ environment }: EnvironmentViewerProps) {
  const [timeOpacity, setTimeOpacity] = useState(1);

  useEffect(() => {
    if (environment.timeOfDay === 'dynamic') {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 18) {
        setTimeOpacity(0.1); // Day - lighter overlay
      } else {
        setTimeOpacity(0.4); // Night - darker overlay
      }
    } else if (environment.timeOfDay === 'night') {
      setTimeOpacity(0.4);
    } else if (environment.timeOfDay === 'sunset') {
      setTimeOpacity(0.3);
    } else {
      setTimeOpacity(0.1);
    }
  }, [environment]);

  return (
    <div className="absolute inset-0 transition-opacity duration-1000">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url(${environment.imageUrl})`,
          filter: 'brightness(0.85) saturate(1.1)'
        }}
      />

      {/* Time-based Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-purple-900/10 to-pink-900/20 transition-opacity duration-1000"
        style={{ opacity: timeOpacity }}
      />

      {/* Subtle Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30" />

      {/* Particle Effect Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-2 h-2 bg-white rounded-full animate-float-1" style={{ top: '20%', left: '30%' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-float-2" style={{ top: '40%', left: '60%' }} />
        <div className="absolute w-2 h-2 bg-white rounded-full animate-float-3" style={{ top: '60%', left: '20%' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-float-1" style={{ top: '80%', left: '70%' }} />
        <div className="absolute w-1 h-1 bg-white rounded-full animate-float-2" style={{ top: '30%', left: '80%' }} />
      </div>

      <style>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-30px) translateX(-10px); opacity: 0.5; }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.4; }
          50% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 10s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
