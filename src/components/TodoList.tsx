import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X, GripVertical, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

export function TodoList({ todos, setTodos }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('input, button, label')) return;
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

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now().toString(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

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
        style={{ width: isMinimized ? '280px' : '380px' }}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 px-5 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-orange-300/20">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-orange-200/60" />
            <h3 className="text-orange-50">할 일 목록</h3>
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
          <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
            {/* Add Todo */}
            <div className="flex gap-2">
              <Input
                placeholder="새로운 할 일 추가..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                className="bg-white/80 border-white/30 text-neutral-900 placeholder:text-neutral-500 rounded-xl"
              />
              <Button
                onClick={addTodo}
                size="icon"
                className="bg-orange-500 hover:bg-orange-600 rounded-xl shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Todo Items */}
            <div className="space-y-2">
              {todos.length === 0 ? (
                <p className="text-white/60 text-center py-8 text-sm">
                  아직 할 일이 없습니다.<br />새로운 할 일을 추가해보세요!
                </p>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/15 p-3 rounded-xl border border-white/10 transition-colors group"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="border-white/40 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                    />
                    <span
                      className={`flex-1 text-white text-sm ${
                        todo.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/60 hover:text-white hover:bg-white/10 rounded-lg w-7 h-7 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {/* Stats */}
            {todos.length > 0 && (
              <div className="pt-3 border-t border-white/10 text-white/60 text-sm">
                완료: {todos.filter(t => t.completed).length} / {todos.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
