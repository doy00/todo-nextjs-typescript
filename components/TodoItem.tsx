'use client';

import { Todo } from '@/api/types';
import Link from 'next/link';

interface TodoItemProps {
  todo: Todo;
  onToggle?: (id: number) => void;
}

export default function TodoItem({ todo, onToggle }: TodoItemProps) {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(todo.id);
    }
  };
  return (
    <div className='flex items-center justify-between p-4 border-2 border-slate-900 rounded-full'>
      <div>
      <button
          type="button"
          className={`mr-2 rounded-full p-2 w-8 h-8 ${
            todo.isCompleted
              ? 'bg-[#7C3AED] border-2 border-slate-900 text-white'
              : 'bg-white border-2 border-slate-900'
          }`}
          onClick={handleToggle}
        >
          {todo.isCompleted ? '✓' : ''}
        </button>
        {/* <input
          type='checkbox'
          checked={todo.isCompleted}
          onChange={() => onToggle && onToggle(todo.id)}
          className='mr-2'
        /> */}

        <Link href={`/items/${todo.id}`}>
                <span className={`cursor-pointer ${todo.isCompleted ? 'line-through text-gray-800' : ''}`}>
                  {todo.name}
                </span>
        </Link>

      </div>
    </div>
  )
}