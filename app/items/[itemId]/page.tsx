/** 할 일 상세 페이지 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { todoService } from '@/api/todoService';
import { Todo } from '@/api/types';
import Image from 'next/image';
import React from 'react';

export default function TodoDetails({ 
  params
  }: { 
    params: Promise<{ itemId: string }>
  }) {
  const router = useRouter();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [name, setName] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [memo, setMemo] = useState('');
  const [image, setImage] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const fetchedTodo = await todoService.getTodoById(Number(resolvedParams.itemId));
        setTodo(fetchedTodo);
        setName(fetchedTodo.name);
        setIsCompleted(fetchedTodo.isCompleted);
        setMemo(fetchedTodo.memo || '');
      } catch (error) {
        console.error('Failed to fetch todo:', error);
      }
    };
    fetchTodo();
  }, [resolvedParams.itemId]);

    // 로고 클릭시 새로고침
    const handleLogoClick = () => {
      router.push('/'); 
    }
    // 수정 submit 함수
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!todo) return;

      try {
        await todoService.updateTodo(todo.id, { name, isCompleted, memo });
        if (image) {
          // [ ] 이미지 업로드 함수 
        }
        router.push('/');
      } catch (error) {
        console.error('Todo 수정을 실패했습니다(handleSubmit)', error);
      }
    };

    const handleDelete = async () => {
      if (!todo) return;

      if (confirm('정말 삭제하시겠습니까?')) {
        try {
          await todoService.deleteTodo(todo.id);
          router.push('/');
        } catch (error) {
          console.error('Todo 삭제를 실패했습니다(handleDelete', error);
        }
      }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!/^[a-zA-Z]+$/.test(file.name.split('.')[0])) {
          alert('이미지 파일이름은 영어로만 이루어져야 합니다. 다시 등록해주세요.');
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('파일 크기는 5MB 이하여야 합니다.');
          return;
        }
        // setImageFile(file);   // File 객체 저장

        const imageUrl = URL.createObjectURL(file);   // 미리보기 URL 생성
        setImage(imageUrl);
      }
    };

    // 컴포넌트가 언마운트될 때 메모리 누수 방지
    useEffect(() => {
      return () => {
        if (image) {
          URL.revokeObjectURL(image);
        }
      };
    }, [image]);

    if (!todo) return <div>로딩중입니다...</div>;

    // Todo 목록 토글 함수
    const handleToggleTodo = async () => {
      if (!todo) return;
      try {
        const updatedTodo = await todoService.updateTodo(todo.id, {
          isCompleted: !isCompleted,
          name,
          memo
        });
        setIsCompleted(updatedTodo.isCompleted);
        setTodo(updatedTodo);
      } catch (error) {
        console.error('토글 실패: handleToggleTodo', error);
      }
    };

    if (!todo) return <div>Todo 로딩중...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className='mb-8'>
        <div className='w-24 h-12 cursor-pointer' onClick={handleLogoClick}>
          <Image 
            src='/img.png' 
            alt='logo image' 
            width={500}
            height={500}
          />
        </div>
      </header>

      <div className="flex items-center gap-2 mb-4 p-4 flex items-center justify-center rounded-full border-2">
        <button
          onClick={handleToggleTodo}
          className='w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center'
          >
            {isCompleted ? '✓' : ''}
          </button>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='flex-2 text-xl font-semibold bg-transparent border-none focus:outline-none'
          />
      </div>
      




      <div className="space-y-6">
        <div className="border-2 border-dashed rounded-lg p-4 min-h-[200px] relative">
          {image ? (
            <div className="relative w-full h-[200px]">
              <Image
                src={image}
                alt="Todo image"
                fill
                className="object-cover rounded-lg"
                
              />
              <button
                className="absolute bottom-4 right-4 bg-gray-700 rounded-full p-2"
                onClick={() => {
                  URL.revokeObjectURL(image);
                  setImage(null);
                  // setImageFile(null);
                }}
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              className="absolute bottom-4 right-4 bg-gray-100 rounded-full p-2"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <input
            type="file"
            id="image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
            // onChange={(e) => {
            //   const file = e.target.files?.[0];
            //   if (file) {
            //     const reader = new FileReader();
            //     reader.onloadend = () => {
            //       setImage(reader.result as string);
            //     };
            //     reader.readAsDataURL(file);
            //   }
            // }}
          />
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h2 className="text-brown-600 mb-4">Memo</h2>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full bg-transparent border-none resize-none focus:outline-none min-h-[100px]"
            placeholder="메모를 입력하세요"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onSubmit={handleSubmit}
            onClick={() => router.push('/')}
            className="px-6 py-2 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            ✓ 수정 완료
          </button>
          <button
            onClick={handleDelete}
            
            className="px-6 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            ✕ 삭제하기
          </button>
        </div>
      </div>
    </div>
    )
}