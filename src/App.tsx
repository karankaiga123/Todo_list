import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load from local storage
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in" style={{ maxWidth: '600px' }}>
      {/* Simplified Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-semibold mb-2" style={{ letterSpacing: '-0.02em' }}>My Tasks</h1>
        <p className="text-slate-400 text-sm">
          {activeTodos.length === 0 ? 'All done! 🎉' : `${activeTodos.length} task${activeTodos.length === 1 ? '' : 's'} remaining`}
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col gap-6 mb-10">
        {/* Input Form */}
        <form onSubmit={addTodo} className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-5 py-4 text-base transition-all outline-none glass focus:border-indigo-400/40 text-white placeholder:text-slate-500"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.08)',
              fontSize: '15px'
            }}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-md shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Tabs */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between text-sm px-1">
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
              {(['all', 'active', 'completed'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-3 py-1.5 rounded-md transition-all capitalize ${filter === filterType
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
            {completedTodos.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-slate-500 hover:text-red-400 transition-colors text-xs font-medium"
              >
                Clear Completed
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {filteredTodos.map((todo) => (
            <motion.div
              layout
              key={todo.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className={`flex items-start gap-3 p-4 glass hover:bg-white/10 transition-all cursor-pointer group ${todo.completed ? 'opacity-50' : ''
                  }`}
                onClick={() => toggleTodo(todo.id)}
                style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
              >
                {/* Checkbox */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${todo.completed
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-2 border-slate-500 group-hover:border-indigo-400'
                    }`}
                >
                  {todo.completed && <Check className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* Task Text */}
                <span
                  className={`flex-1 transition-all ${todo.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                    }`}
                  style={{ fontSize: '15px', lineHeight: '1.5' }}
                >
                  {todo.text}
                </span>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTodo(todo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all text-sm px-2"
                  aria-label="Delete todo"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTodos.length === 0 && todos.length > 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            {filter === 'active' ? 'No active tasks!' : 'No completed tasks yet.'}
          </div>
        )}

        {todos.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-slate-500 text-sm">No tasks yet. Add one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
