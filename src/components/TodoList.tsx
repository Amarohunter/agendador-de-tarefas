import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Trash2, 
  Plus, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  Target, 
  Clock,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  category?: '🎯' | '⚡' | '📅' | '💡';
}

const categories = [
  { emoji: '🎯', label: 'Meta' },
  { emoji: '⚡', label: 'Urgente' },
  { emoji: '📅', label: 'Agendado' },
  { emoji: '💡', label: 'Ideia' }
];

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'🎯' | '⚡' | '📅' | '💡'>('🎯');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        setTodos(parsed.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        })));
      } catch (error) {
        console.error('Error loading todos:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo.trim(),
      completed: false,
      createdAt: new Date(),
      category: selectedCategory
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
    
    toast({
      title: "✨ Tarefa adicionada!",
      description: "Nova tarefa criada com sucesso.",
    });
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    
    toast({
      title: "🗑️ Tarefa removida",
      description: "Tarefa deletada com sucesso.",
      variant: "destructive",
    });
  };

  const toggleComplete = (id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;

    setTodos(prev => prev.map(todo =>
      todo.id === editingId ? { ...todo, text: editText.trim() } : todo
    ));
    
    setEditingId(null);
    setEditText('');
    
    toast({
      title: "✏️ Tarefa atualizada",
      description: "Alterações salvas com sucesso.",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const groupedTodos = todos.reduce((acc, todo) => {
    const category = todo.category || '🎯';
    if (!acc[category]) acc[category] = [];
    acc[category].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-6 py-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-primary shadow-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
            TodoMagic
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transforme suas ideias em realizações com nossa plataforma intuitiva e moderna
        </p>
        
        {totalCount > 0 && (
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-foreground">Progresso</span>
              <span className="text-primary">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden shadow-sm">
              <div 
                className="h-full bg-gradient-primary transition-all duration-700 ease-out shadow-glow"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {completedCount} de {totalCount} tarefas concluídas
            </div>
          </div>
        )}
      </div>

      {/* Add Todo Form */}
      <Card className="p-6 shadow-lg border-0 bg-gradient-card backdrop-blur-md">
        <div className="space-y-4">
          {/* Category Selection */}
          <div className="flex gap-2 justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.emoji}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(cat.emoji as any)}
                className={`transition-all duration-300 ${
                  selectedCategory === cat.emoji 
                    ? 'bg-gradient-primary text-white shadow-primary scale-105' 
                    : 'hover:bg-accent hover:scale-105'
                }`}
              >
                <span className="text-lg mr-2">{cat.emoji}</span>
                {cat.label}
              </Button>
            ))}
          </div>
          
          {/* Input Form */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Descreva sua próxima conquista..."
                className="pl-12 h-14 text-lg border-2 border-transparent focus:border-primary bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300"
                onKeyPress={(e) => handleKeyPress(e, addTodo)}
              />
              <ListTodo className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            <Button 
              onClick={addTodo}
              className="h-14 px-8 bg-gradient-primary hover:bg-gradient-hover transition-all duration-300 shadow-primary hover:shadow-glow hover:scale-105"
              disabled={!newTodo.trim()}
            >
              <Plus className="h-5 w-5 mr-2" />
              Adicionar
            </Button>
          </div>
        </div>
      </Card>

      {/* Todo Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {Object.entries(groupedTodos).map(([category, categoryTodos]) => (
          <Card key={category} className="p-6 shadow-lg border-0 bg-gradient-card backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{category}</span>
              <h3 className="font-display font-semibold text-lg">
                {categories.find(c => c.emoji === category)?.label}
              </h3>
              <div className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {categoryTodos.length}
              </div>
            </div>
            
            <div className="space-y-3">
              {categoryTodos.map((todo) => (
                <Card 
                  key={todo.id} 
                  className={`p-4 shadow-md border-0 bg-white/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] todo-slide-in ${
                    todo.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleComplete(todo.id)}
                      className="data-[state=checked]:bg-gradient-success data-[state=checked]:border-success shadow-sm"
                    />
                    
                    <div className="flex-1">
                      {editingId === todo.id ? (
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="border-primary focus:border-primary bg-white/80"
                          onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                          autoFocus
                        />
                      ) : (
                        <span className={`font-medium ${
                          todo.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        } transition-all duration-300`}>
                          {todo.text}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1">
                      {editingId === todo.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={saveEdit}
                            className="h-9 w-9 p-0 hover:bg-success-glow hover:text-success transition-all duration-300"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEdit}
                            className="h-9 w-9 p-0 hover:bg-destructive-glow hover:text-destructive transition-all duration-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(todo)}
                            className="h-9 w-9 p-0 hover:bg-primary-glow hover:text-primary transition-all duration-300"
                            disabled={todo.completed}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTodo(todo.id)}
                            className="h-9 w-9 p-0 hover:bg-destructive-glow hover:text-destructive transition-all duration-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {categoryTodos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-3xl mb-2">{category}</div>
                  <p className="text-sm">Nenhuma tarefa nesta categoria</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {totalCount === 0 && (
        <Card className="p-12 text-center shadow-lg border-0 bg-gradient-card backdrop-blur-md">
          <div className="space-y-6">
            <div className="inline-flex p-6 rounded-full bg-gradient-primary shadow-glow">
              <Target className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold">Pronto para começar?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Adicione sua primeira tarefa e comece a organizar suas metas de forma inteligente
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Footer */}
      {totalCount > 0 && (
        <Card className="p-6 text-center shadow-lg border-0 bg-gradient-card backdrop-blur-md">
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                <div className="text-2xl font-display font-bold text-primary">{totalCount}</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Total</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="text-2xl font-display font-bold text-success">{completedCount}</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Concluídas</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
                <div className="text-2xl font-display font-bold text-destructive">{totalCount - completedCount}</div>
              </div>
              <div className="text-sm text-muted-foreground font-medium">Pendentes</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}