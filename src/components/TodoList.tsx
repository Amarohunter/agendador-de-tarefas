import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Edit3, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
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
      createdAt: new Date()
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
    
    toast({
      title: "Tarefa adicionada!",
      description: "Nova tarefa criada com sucesso.",
    });
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
    
    toast({
      title: "Tarefa removida",
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
      title: "Tarefa atualizada",
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          TodoList
        </h1>
        <p className="text-muted-foreground">
          Organize suas tarefas de forma simples e eficiente
        </p>
        {totalCount > 0 && (
          <div className="text-sm text-muted-foreground">
            {completedCount} de {totalCount} tarefas concluídas
          </div>
        )}
      </div>

      {/* Add Todo Form */}
      <Card className="p-4 shadow-md border-0 bg-card/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Adicionar nova tarefa..."
            className="flex-1 border-input focus:border-input-focus transition-smooth"
            onKeyPress={(e) => handleKeyPress(e, addTodo)}
          />
          <Button 
            onClick={addTodo}
            className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-primary"
            disabled={!newTodo.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Todo List */}
      <div className="space-y-3">
        {todos.length === 0 ? (
          <Card className="p-8 text-center shadow-sm border-0 bg-card/50">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-2">📝</div>
              <p>Nenhuma tarefa ainda.</p>
              <p className="text-sm">Adicione sua primeira tarefa acima!</p>
            </div>
          </Card>
        ) : (
          todos.map((todo) => (
            <Card 
              key={todo.id} 
              className={`p-4 shadow-md border-0 bg-card/80 backdrop-blur-sm transition-smooth hover:shadow-lg todo-slide-in ${
                todo.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleComplete(todo.id)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                
                <div className="flex-1">
                  {editingId === todo.id ? (
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="border-input focus:border-input-focus"
                      onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                      autoFocus
                    />
                  ) : (
                    <span className={`${
                      todo.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-card-foreground'
                    } transition-smooth`}>
                      {todo.text}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingId === todo.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={saveEdit}
                        className="h-8 w-8 p-0 hover:bg-success/10 hover:text-success"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                        disabled={todo.completed}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTodo(todo.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Footer Stats */}
      {totalCount > 0 && (
        <Card className="p-4 text-center shadow-sm border-0 bg-card/50">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-primary">{totalCount}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="font-semibold text-success">{completedCount}</div>
              <div className="text-muted-foreground">Concluídas</div>
            </div>
            <div>
              <div className="font-semibold text-destructive">{totalCount - completedCount}</div>
              <div className="text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}