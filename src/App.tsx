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

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="ios-list-container">
      {/* iOS Large Title Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-between mb-4"
      >
        <h1 className="ios-large-title">My Tasks</h1>
        {todos.some(t => t.completed) && (
          <button
            onClick={clearCompleted}
            className="text-[17px] text-[var(--ios-blue)] active:opacity-50 transition-opacity"
          >
            Clear
          </button>
        )}
      </motion.div>

      {/* iOS Segmented Control */}
      <div className="ios-segmented-control">
        {(['all', 'active', 'completed'] as const).map((filterType) => (
          <div
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`ios-segment ${filter === filterType ? 'active' : ''} capitalize`}
          >
            {filterType}
          </div>
        ))}
      </div>

      {/* Input Group */}
      <div className="ios-group">
        <div className="ios-row p-0">
          <form onSubmit={addTodo} className="w-full flex items-center pr-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add New Task"
              className="ios-search-bar bg-transparent pl-4"
            />
            <button
              type="submit"
              className="bg-[var(--ios-blue)] rounded-full p-1 w-7 h-7 flex items-center justify-center text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Task List - Inset Grouped */}
      {filteredTodos.length > 0 && (
        <>
          <h2 className="ios-section-header">
            {filter === 'all' ? 'All Tasks' : filter} • {filteredTodos.length}
          </h2>
          <div className="ios-group">
            <AnimatePresence initial={false} mode="popLayout">
              {filteredTodos.map((todo) => (
                <motion.div
                  layout
                  key={todo.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 40, mass: 1 }}
                >
                  <div className="ios-row cursor-pointer group" onClick={() => toggleTodo(todo.id)}>
                    {/* iOS Checkbox */}
                    <div className={`ios-checkbox ${todo.completed ? 'checked' : ''}`}>
                      {todo.completed && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </div>

                    <span
                      className={`flex-1 text-[17px] ${todo.completed ? 'text-[var(--ios-text-secondary)] line-through' : 'text-white'}`}
                    >
                      {todo.text}
                    </span>

                    {/* Swipe-to-delete simulation (button for now) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTodo(todo.id);
                      }}
                      className="text-[var(--ios-red)] opacity-0 group-hover:opacity-100 transition-opacity px-2"
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredTodos.length === 0 && (
        <div className="text-center mt-20 text-[var(--ios-gray)]">
          <p className="text-[17px]">No {filter === 'all' ? '' : filter} tasks</p>
        </div>
      )}
    </div>
  );
};

export default App;
