import api from './api';
import { AuthResponse, LoginData, SignupData } from '@/types/auth';

export async function signupApi(data: SignupData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/signup', data);
  return response.data;
}

export async function loginApi(data: LoginData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/login', data);
  return response.data;
}

export async function logoutApi(): Promise<void> {
  await api.post('/api/auth/logout');
}

export async function refreshApi(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/api/auth/refresh');
  return response.data;
}

export async function setRefreshCookie(refreshToken: string): Promise<void> {
  await fetch('/api/set-refresh-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function clearRefreshCookie(): Promise<void> {
  await fetch('/api/clear-refresh-cookie', {
    method: 'POST',
  });
}
