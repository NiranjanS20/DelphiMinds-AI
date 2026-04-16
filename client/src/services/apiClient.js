import axios from 'axios';
import { auth } from '../firebase/firebaseConfig';

/**
 * Centralized Axios API client with Firebase token interceptor.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken(/* forceRefresh */ false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error attaching auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      console.warn('Unauthorized — redirecting to login');
      window.location.href = '/login';
    } else if (status === 403) {
      console.warn('Forbidden — insufficient permissions');
    } else if (status >= 500) {
      console.error('Server error:', message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
