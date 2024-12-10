/** 할일 목록 페이지 */
'use client';

import { useState, useEffect } from 'react';
import TodoInput from '@/components/TodoInput';
import TodoList from '@/components/TodoList';
import { Todo } from '@/api/types';
import { todoService } from '@/api/todoService';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        console.log('Tenant ID:', process.env.NEXT_PUBLIC_TENANT_ID); // 환경변수 출력
        const fetchedTodos = await todoService.getTodos();
        console.log('Fetched Todos:', fetchedTodos); // 가져온 Todo 출력
        setTodos(fetchedTodos);
      } catch (error) {
        console.error('Todo 목록을 불러오는데 실패했습니다.fetchTodos', error);
        
      }
    };
    fetchTodos();
  }, []);

  // 로고 클릭시 새로고침
  const handleLogoClick = () => {
    router.push('/'); 
  }

  // Todo 추가 handle 함수
  const handleAddTodo = async (newTodoTitle: string) => {
    try {
      const createdTodo = await todoService.createTodo(newTodoTitle);
      setTodos([...todos, createdTodo]);
    } catch (error) {
      console.error('Todo 추가하는데 실패했습니다: hahndleAddTodo', error);
    }
  };

  // Todo 목록 토글 함수
  const handleToggleTodo = async (id: number) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      const updatedTodo = await todoService.updateTodo(id, {
        isCompleted: !todoToUpdate.isCompleted
      });

      setTodos(prevTodos => 
        prevTodos.map(todo => 
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error('토글 실패: handleToggleTodo', error);
    }
  };

  const incompleteTodos = todos.filter(todo => !todo.isCompleted);
  const completedTodos = todos.filter(todo => todo.isCompleted);

  return (
    <main className='max-w-3xl mx-auto p-4'>
      <header className='mb-8'>
        <div className='w-24 h-12 cursor-pointer' onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <img src='/img.png' alt='logo image' className='w-full h-auto' />
        </div>
      </header>

      <TodoInput onAdd={handleAddTodo} />
      
      <div className='mt-8 md:flex md:space-x-8'>
        <div className='md:w-1/2'>
          <div className='mb-4'>
            <h2 className='inline-block px-4 py-2 bg-[#D9F99D] rounded-full text-sm font-bold'>TO DO
            </h2>
          </div>
        {todos && 
        <TodoList 
          todos={incompleteTodos} 
          onToggle={handleToggleTodo}  
        />}
        </div>

        <div className='md:w-1/2'>
          <div className='mb-4'>
            <h2 className='inline-block px-4 py-2 bg-[#166534] rounded-full text-sm font-bold text-lime-300'>DONE
            </h2>
          </div>
          {todos &&
          <TodoList 
            todos={completedTodos} 
            onToggle={handleToggleTodo}
          />}
        </div>
      </div>
    </main>
  );
}
