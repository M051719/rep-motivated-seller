// API utility functions
import { supabase } from './supabase';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export const api = {
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  },

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  },

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  },

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, { method: 'DELETE' });
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      return { error: (error as Error).message, status: 500 };
    }
  }
};

export default api;
