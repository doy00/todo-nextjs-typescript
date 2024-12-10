/** 할 일 목록 컴포넌트 */
'use client';

import { Todo } from '@/api/types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onToggle?: (id: number) => void;
}

export default function TodoList({ todos, onToggle }:TodoListProps) {

  return (
    <ul className='space-y-2'>
      {todos.map((todo) => (
        <TodoItem 
          key={todo.id} 
          todo={todo} 
          onToggle={onToggle ? () => onToggle(todo.id) : undefined}
        />
      ))}
    </ul>
  );
}