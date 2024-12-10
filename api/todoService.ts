/** API 요청 관련 함수 */
import axios from 'axios';
import { Todo } from './types';

const NEXT_PUBLIC_TENANT_ID="dhkm-todo"
const tenantId = NEXT_PUBLIC_TENANT_ID;
// const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
// const API_BASE_URL = `https://assignment-todolist-api.vercel.app/api/`;

if (!tenantId) {
  throw new Error('NEXT_PUBLIC_TENANT_ID is not defined');
}

const axiosInstance = axios.create({
  baseURL: `https://assignment-todolist-api.vercel.app/api/${tenantId}`
});

export const todoService = {
  // Todo 목록 조회 함수
  getTodos: async (): Promise<Todo[]> => {
    const response = await axiosInstance.get(`/items`);
    return response.data; // 응답의 data 필드에서 실제 데이터 추출
  },
  // Todo 완료 토글
  toggleTodoStatus: async (id: number): Promise<Todo> => {
    const response = await axiosInstance.patch(`/items/${id}`, {
      isCompleted: undefined
    })
    return response.data;
  },
  // Todo 상세 조회
  getTodoById: async (id: number): Promise<Todo> => {
    const response = await axiosInstance.get(`/items/${id}`);
    return response.data;
  },
  // Todo 추가하기
  createTodo: async (name: string): Promise<Todo> => {
    try {
      const response = await axiosInstance.post(`/items`, { 
        name
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create todo:', error);
      throw error;
    }
  },
  // Todo 수정
  updateTodo: async (id: number, data: Partial<Todo>): Promise<Todo> => {
    const response = await axiosInstance.patch(`/items/${id}`, data);
    return response.data;
  },
  // Todo 삭제
  deleteTodo: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/items/${id}`);
  }
  // 이미지 업로드


};
