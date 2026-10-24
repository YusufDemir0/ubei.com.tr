import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { mockAdapter } from '../mock/adapter';

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || '/api/v1';
  }
  const backendInternal = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';
  return `${backendInternal.replace(/\/+$/, '')}/api/v1`;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000, // 15s optimal timeout for responsive UX & network resilience
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Set baseURL dynamically and ensure credentials are transmitted
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Handle global errors (e.g. 401 Unauthorized)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Statik yayın: backend yok, tüm istekler mock/data.ts'ten yanıtlanır
apiClient.defaults.adapter = mockAdapter;

export default apiClient;
