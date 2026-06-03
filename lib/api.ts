import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Access token stored in memory only — never localStorage/sessionStorage
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach access token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  // FormData must set Content-Type with boundary automatically (not application/json)
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

/**
 * Une seule promesse de refresh partagée : évite plusieurs POST /refresh en parallèle
 * quand plusieurs requêtes reçoivent 401 au même instant.
 */
let refreshAuthPromise: Promise<string> | null = null;

async function performTokenRefresh(): Promise<string> {
  const response = await axios.post<{ accessToken: string; refreshToken?: string }>(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/auth/refresh`,
    {},
    { withCredentials: true }
  );

  const newAccessToken: string = response.data.accessToken;
  setAccessToken(newAccessToken);

  if (response.data.refreshToken && typeof window !== 'undefined') {
    await fetch('/api/set-refresh-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: response.data.refreshToken }),
    });
  }

  return newAccessToken;
}

// Response interceptor: handle 401 with silent token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] ?? '60';
      error.message = `Trop de tentatives. Réessayez dans ${retryAfter} secondes.`;
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!refreshAuthPromise) {
        refreshAuthPromise = performTokenRefresh().finally(() => {
          refreshAuthPromise = null;
        });
      }

      try {
        const newToken = await refreshAuthPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
