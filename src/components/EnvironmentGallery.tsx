import { X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Environment } from '../App';

interface EnvironmentGalleryProps {
  environments: Environment[];
  currentEnvironment: Environment;
  onSelect: (env: Environment) => void;
  onClose: () => void;
}

export function EnvironmentGallery({
  environments,
  currentEnvironment,
  onSelect,
  onClose
}: EnvironmentGalleryProps) {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-20 flex items-center justify-center p-6">
      <div className="bg-gradient-to-br from-white/95 to-purple-50/95 backdrop-blur-xl rounded-3xl p-8 max-w-5xl w-full border border-purple-200/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-neutral-900">환경 선택</h2>
            <p className="text-neutral-600 text-sm mt-1">작업에 몰입할 수 있는 환경을 선택하세요</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {environments.map((env) => {
            const isSelected = currentEnvironment.id === env.id;
            return (
              <button
                key={env.id}
                onClick={() => onSelect(env)}
                className={`relative group rounded-2xl overflow-hidden transition-all ${
                  isSelected
                    ? 'ring-4 ring-purple-500 scale-[1.02]'
                    : 'hover:scale-[1.02] hover:shadow-xl'
                }`}
              >
                <div
                  className="aspect-video bg-cover bg-center"
                  style={{ backgroundImage: `url(${env.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white mb-1">{env.name}</h3>
                    <p className="text-white/80 text-sm">{env.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-2xl">
          <p className="text-sm text-purple-800">
            💡 <strong>팁:</strong> 각 환경은 고유한 분위기와 사운드를 제공합니다. AI 환경 생성 기능으로 더 많은 환경을 만들어보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
