import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  GripVertical,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

export function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({
    x: window.innerWidth - 430,
    y: 120,
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const intervalRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("input, button")) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + deltaX,
        y: dragRef.current.startPosY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerEnd = () => {
    setIsRunning(false);
    if (isBreak) {
      toast.success("휴식 시간 종료! 다시 집중할 시간입니다 🎯");
      setIsBreak(false);
      setTimeLeft(workMinutes * 60);
    } else {
      toast.success("수고하셨습니다! 잠깐 휴식을 취하세요 ☕");
      setIsBreak(true);
      setTimeLeft(breakMinutes * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
  };

  const applySettings = () => {
    setTimeLeft(workMinutes * 60);
    setIsBreak(false);
    setIsRunning(false);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const progress = isBreak
    ? ((breakMinutes * 60 - timeLeft) / (breakMinutes * 60)) * 100
    : ((workMinutes * 60 - timeLeft) / (workMinutes * 60)) * 100;

  return (
    <div
      className="absolute z-30 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      <div
        className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
        style={{ width: "380px" }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 px-5 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-amber-300/20">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-amber-200/60" />
            <h3 className="text-amber-50">뽀모도로 타이머</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl w-8 h-8"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl w-8 h-8"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <div className="p-6">
            {showSettings ? (
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">
                    집중 시간 (분)
                  </label>
                  <Input
                    type="number"
                    value={workMinutes}
                    onChange={(e) =>
                      setWorkMinutes(parseInt(e.target.value) || 25)
                    }
                    className="bg-white/80 border-white/30 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">
                    휴식 시간 (분)
                  </label>
                  <Input
                    type="number"
                    value={breakMinutes}
                    onChange={(e) =>
                      setBreakMinutes(parseInt(e.target.value) || 5)
                    }
                    className="bg-white/80 border-white/30 rounded-xl"
                  />
                </div>
                <Button
                  onClick={applySettings}
                  className="w-full bg-orange-500 hover:bg-orange-600 rounded-xl"
                >
                  적용하기
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className="text-white/60 text-sm mb-2">
                    {isBreak ? "휴식 시간" : "집중 시간"}
                  </div>
                  <div className="text-6xl text-white mb-4 font-mono">
                    {formatTime(timeLeft)}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isBreak ? "bg-amber-400" : "bg-orange-400"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={toggleTimer}
                    size="icon"
                    className={`w-14 h-14 rounded-full ${
                      isBreak
                        ? "bg-amber-500 hover:bg-amber-600"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {isRunning ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    size="icon"
                    variant="outline"
                    className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border-white/30 text-white"
                  >
                    <RotateCcw className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
