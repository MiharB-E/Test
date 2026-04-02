import api from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  last_name?: string | null;
  group_id: number | null;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  email: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/login', { 
    email: email.toLowerCase().trim(), 
    password 
  });
  return response.data;
};

export const register = async (data: {
  email: string;
  password: string;
  name: string;
  last_name: string;
}): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/register', {
    ...data,
    email: data.email.toLowerCase().trim()
  });
  return response.data;
};

export const verifyCode = async (email: string, code: string) => {
  const response = await api.post('/verify', { email: email.toLowerCase().trim(), code });
  return response.data;
};