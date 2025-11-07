import { Volume2, Music, Wind, GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { useState, useRef, useEffect } from 'react';

interface SoundControlProps {
  bgmVolume: number;
  setBgmVolume: (volume: number) => void;
  ambienceVolume: number;
  setAmbienceVolume: (volume: number) => void;
}

export function SoundControl({
  bgmVolume,
  setBgmVolume,
  ambienceVolume,
  setAmbienceVolume
}: SoundControlProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: window.innerHeight - 280 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button[role="slider"]')) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + deltaX,
        y: dragRef.current.startPosY + deltaY
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="absolute z-30 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      <div
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        style={{ width: '320px' }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/30 to-red-600/30 px-5 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-orange-300/20">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-orange-200/60" />
            <h3 className="text-orange-50">사운드 컨트롤</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl w-8 h-8"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>

        {!isMinimized && (
          <div className="p-5 space-y-6">
            {/* BGM Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-orange-300" />
                  <span className="text-orange-50 text-sm">배경 음악</span>
                </div>
                <span className="text-white/60 text-sm">{bgmVolume}%</span>
              </div>
              <Slider
                value={[bgmVolume]}
                onValueChange={([value]) => setBgmVolume(value)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Ambience Volume */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-300" />
                  <span className="text-orange-50 text-sm">주변 소리</span>
                </div>
                <span className="text-white/60 text-sm">{ambienceVolume}%</span>
              </div>
              <Slider
                value={[ambienceVolume]}
                onValueChange={([value]) => setAmbienceVolume(value)}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Quick Presets */}
            <div className="pt-3 border-t border-white/10">
              <p className="text-white/60 text-xs mb-2">빠른 설정</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setBgmVolume(0);
                    setAmbienceVolume(0);
                  }}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                >
                  무음
                </button>
                <button
                  onClick={() => {
                    setBgmVolume(30);
                    setAmbienceVolume(70);
                  }}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                >
                  자연음
                </button>
                <button
                  onClick={() => {
                    setBgmVolume(70);
                    setAmbienceVolume(30);
                  }}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm transition-colors"
                >
                  음악
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
