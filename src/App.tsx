import { useState, useEffect } from 'react';
import { CozyRoom3D } from './components/CozyRoom3D';
import { AIPromptInput } from './components/AIPromptInput';
import { TodoList } from './components/TodoList';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SoundControl } from './components/SoundControl';
import { EnvironmentGallery } from './components/EnvironmentGallery';
import { Settings, Sparkles, Volume2 } from 'lucide-react';
import { Button } from './components/ui/button';

export interface Environment {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bgmUrl?: string;
  ambienceUrl?: string;
  timeOfDay: 'day' | 'night' | 'sunset' | 'dynamic';
}

const defaultEnvironments: Environment[] = [
  {
    id: 'cozy-room',
    name: '아늑한 침실',
    description: '따뜻한 조명이 있는 편안한 개인 공간',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80',
    timeOfDay: 'night'
  },
  {
    id: 'tokyo-cafe',
    name: '비 오는 도쿄 카페',
    description: '빗소리가 들리는 작은 카페',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1920&q=80',
    timeOfDay: 'day'
  },
  {
    id: 'forest-cabin',
    name: '숲속 오두막',
    description: '새소리가 들리는 울창한 숲',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    timeOfDay: 'day'
  },
  {
    id: 'study-desk',
    name: '집중 서재',
    description: 'Lo-fi 음악이 흐르는 서재',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&q=80',
    timeOfDay: 'sunset'
  },
  {
    id: 'mountain-view',
    name: '산 전망대',
    description: '평화로운 산 풍경',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    timeOfDay: 'dynamic'
  }
];

export default function App() {
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment>(defaultEnvironments[0]);
  const [showGallery, setShowGallery] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(50);
  const [ambienceVolume, setAmbienceVolume] = useState(50);
  const [todos, setTodos] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);

  // Load saved state from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem('productivity-todos');
    const savedEnvironment = localStorage.getItem('productivity-environment');
    const savedBgmVolume = localStorage.getItem('productivity-bgm-volume');
    const savedAmbienceVolume = localStorage.getItem('productivity-ambience-volume');

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedEnvironment) {
      const env = JSON.parse(savedEnvironment);
      setCurrentEnvironment(env);
    }
    if (savedBgmVolume) {
      setBgmVolume(parseInt(savedBgmVolume));
    }
    if (savedAmbienceVolume) {
      setAmbienceVolume(parseInt(savedAmbienceVolume));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('productivity-todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('productivity-environment', JSON.stringify(currentEnvironment));
  }, [currentEnvironment]);

  useEffect(() => {
    localStorage.setItem('productivity-bgm-volume', bgmVolume.toString());
  }, [bgmVolume]);

  useEffect(() => {
    localStorage.setItem('productivity-ambience-volume', ambienceVolume.toString());
  }, [ambienceVolume]);

  const handleEnvironmentSelect = (env: Environment) => {
    setCurrentEnvironment(env);
    setShowGallery(false);
  };

  const handleAIGenerate = (prompt: string) => {
    // Simulate AI generation by selecting a related environment
    const keywords = prompt.toLowerCase();
    let selectedEnv = defaultEnvironments[0];

    if (keywords.includes('카페') || keywords.includes('비') || keywords.includes('cafe') || keywords.includes('rain')) {
      selectedEnv = defaultEnvironments[1];
    } else if (keywords.includes('숲') || keywords.includes('자연') || keywords.includes('forest') || keywords.includes('nature')) {
      selectedEnv = defaultEnvironments[2];
    } else if (keywords.includes('서재') || keywords.includes('공부') || keywords.includes('study') || keywords.includes('desk')) {
      selectedEnv = defaultEnvironments[3];
    } else if (keywords.includes('산') || keywords.includes('mountain') || keywords.includes('전망')) {
      selectedEnv = defaultEnvironments[4];
    }

    setCurrentEnvironment({
      ...selectedEnv,
      description: `AI 생성: ${prompt}`
    });
    setShowAIPrompt(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-neutral-900">
      {/* 3D Cozy Room Environment */}
      <CozyRoom3D />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10 pointer-events-none">
        <div className="bg-gradient-to-br from-orange-900/40 to-amber-900/40 backdrop-blur-xl rounded-2xl px-6 py-3 border border-orange-400/30 shadow-2xl pointer-events-auto">
          <h1 className="text-white/90">🔥 비 오는 날의 Cozy 오두막</h1>
          <p className="text-orange-200/80 text-sm mt-1">음악 듣는 갈색 고양이와 함께하는 따뜻한 공간</p>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <Button
            variant="outline"
            className="bg-amber-900/40 hover:bg-amber-800/60 backdrop-blur-xl rounded-2xl px-6 border border-amber-400/30 text-white shadow-xl"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Lo-fi Beats
          </Button>
        </div>
      </div>



      {/* Todo List - Draggable */}
      <TodoList todos={todos} setTodos={setTodos} />

      {/* Pomodoro Timer */}
      <PomodoroTimer />

      {/* Sound Control */}
      <SoundControl
        bgmVolume={bgmVolume}
        setBgmVolume={setBgmVolume}
        ambienceVolume={ambienceVolume}
        setAmbienceVolume={setAmbienceVolume}
      />

      {/* Time Display */}
      <div className="absolute bottom-6 left-6 bg-amber-900/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-amber-400/30 shadow-xl pointer-events-none">
        <div className="text-orange-100 text-sm">
          {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 right-6 bg-amber-900/40 backdrop-blur-xl px-4 py-2 rounded-xl border border-amber-400/30 shadow-xl pointer-events-none">
        <div className="text-orange-100 text-sm">
          🖱️ 마우스로 드래그하여 시점 회전 | 스크롤로 줌
        </div>
      </div>
    </div>
  );
}
