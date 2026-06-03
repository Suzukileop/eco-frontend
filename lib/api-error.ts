import { AxiosError } from 'axios';
import { ApiError } from '@/types/auth';

export function getApiErrorMessage(error: unknown, fallback = 'Une erreur est survenue.'): string {
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;
    const msg = axiosError.response?.data?.message;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg;
    }
    if (typeof axiosError.message === 'string' && axiosError.message.length > 0) {
      return axiosError.message;
    }
  }
  return fallback;
}
