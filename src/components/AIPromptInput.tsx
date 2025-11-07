import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface AIPromptInputProps {
  onGenerate: (prompt: string) => void;
  onClose: () => void;
}

export function AIPromptInput({ onGenerate, onClose }: AIPromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const examplePrompts = [
    '비 오는 날 도쿄의 작은 카페',
    '새소리 들리는 울창한 숲속의 오두막',
    'Lo-fi 음악이 흐르는 밤의 서재',
    '눈 내리는 겨울 산장',
    '바다가 보이는 해변 테라스'
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    onGenerate(prompt);
    setIsGenerating(false);
    setPrompt('');
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-white/95 to-purple-50/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-purple-200/50 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-neutral-900">AI 환경 생성</h2>
              <p className="text-neutral-600 text-sm mt-1">원하는 작업 환경을 텍스트로 설명해주세요</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-neutral-200/50"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="예: 비 오는 날 창가에서 따뜻한 차를 마시는 분위기..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-32 bg-white/80 border-purple-200 focus:border-purple-400 rounded-2xl resize-none"
          />

          <div className="space-y-2">
            <p className="text-sm text-neutral-600">예시 프롬프트:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full text-sm transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-2xl h-12"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                환경 생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                환경 생성하기
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <p className="text-sm text-amber-800">
            💡 <strong>팁:</strong> 장소, 시간대, 날씨, 분위기를 구체적으로 설명하면 더 정확한 환경이 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
