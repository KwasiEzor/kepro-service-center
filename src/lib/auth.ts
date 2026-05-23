import api from './api';
import { AuthResponse, LoginDTO, RegisterDTO, User } from '../types';

export const authApi = {
  async register(data: RegisterDTO): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/api/auth/register', data);
    return response.data.data;
  },

  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await api.post<{ data: AuthResponse }>('/api/auth/login', credentials);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ data: { user: User } }>('/api/auth/me');
    return response.data.data.user;
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await api.post<{ data: { accessToken: string } }>('/api/auth/refresh');
    return response.data.data;
  },
};
