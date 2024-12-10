/** 할 일 입력창 
*/

'use client';

import { useState } from "react";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type='text'
        id='todo-input'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="할 일을 입력해주세요"
        className="flex-1 px-4 py-2 rounded-full border-2 border-slate-900 focus:outline-none focus:border-purple-600"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-gray-200 border-2 border-slate-900 rounded-full hover:bg-gray-300"
      >+ 추가하기</button>
    </form>
  )
}