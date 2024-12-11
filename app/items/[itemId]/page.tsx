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
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const fetchedTodo = await todoService.getTodoById(Number(resolvedParams.itemId));
        setTodo(fetchedTodo);
        setName(fetchedTodo.name);
        setIsCompleted(fetchedTodo.isCompleted);
        setMemo(fetchedTodo.memo || '');

        // 이미지 URL 확인을 위한 로깅
        console.log('Fetched Todo Image URL:', fetchedTodo.imageUrl);

        if (fetchedTodo.imageUrl) {
          setImage(fetchedTodo.imageUrl);
        console.log('fetchTodo: ', fetchedTodo);
        }
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
        // 이미지 업로드 후 URL 받기
        let updatedImageUrl = todo.imageUrl;
        // const updateData = {
        //   name,
        //   isCompleted,
        //   memo,
        // };
        // await todoService.updateTodo(todo.id, updateData);
        // if (imageFile) {
        //   const formData = new FormData();
        //   formData.append('image', imageFile);
        //   await todoService.uploadImage(todo.id, formData);
        // }

        // 이미지가 변경된 경우에만 이미지 업로드
        if (image && image !== todo.imageUrl) {
          // 새로 추가된 이미지인 경우
          if (image.startsWith('blob:')) {
            const formData = new FormData();
            const response = await fetch(image);
            const blob = await response.blob();
            formData.append('image', blob, 'image.jpg');

            const uploadResult = await todoService.uploadImage(formData);
            console.log('Uploaded Image Result:', uploadResult);

            updatedImageUrl = uploadResult.url; // 업로드된 이미지 URL
          } 
        }
        // 통합된 업데이트 요청
        const updateData = {
          name,
          isCompleted,
          memo,
          imageUrl: updatedImageUrl
        };
        const updatedTodo = await todoService.updateTodo(todo.id, updateData);
        console.log('Updated todo:', updatedTodo);
        setTodo(updatedTodo);

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
      e.preventDefault();
      const file = e.target.files?.[0];
      if (!file) return;

      if (file) {
        // 파일명 검증
        if (!/^[a-zA-Z]+$/.test(file.name.split('.')[0])) {
          alert('이미지 파일이름은 영어로만 이루어져야 합니다.');
          return;
        }
        //파일 크기 검증
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
        if (image && image.startsWith('blob:')) {
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
          <form onSubmit={handleSubmit} className='p-4'>
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
                {todo.imageUrl ? (
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={todo.imageUrl}
                      alt="Todo image"
                      fill
                      className="object-cover rounded-lg"
                      priority  // LCP 경고 해결
                    />
                    <button
                      className="absolute bottom-4 right-4 bg-gray-700 rounded-full p-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // 이벤트 전파 중단
                        setImage(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type='button'
                    className="absolute bottom-4 right-4 bg-gray-100 rounded-full p-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      document.getElementById('image-upload')?.click();
                    }}
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
                  onClick={(e) => e.stopPropagation()} // 이벤트 전파 중단
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
                  type='submit'
                  // onSubmit={handleSubmit}
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
          </form>
    </div>
    )
}