import axios, { type AxiosError } from 'axios';
import { Platform } from 'react-native';
import { TokenStorage } from '../storage/token-storage';

const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Android emulator uses 10.0.2.2 to reach host machine
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1/mobile';
  }
  return 'http://localhost:3000/api/v1/mobile';
};

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await TokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please check your network connection.';
    return Promise.reject(new Error(errorMsg));
  }
);
