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

const resolveCurrentUser = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (typeof auth.authStateReady === 'function') {
    try {
      await auth.authStateReady();
      return auth.currentUser;
    } catch (_error) {
      return auth.currentUser;
    }
  }

  return auth.currentUser;
};

// Request interceptor — attach Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = await resolveCurrentUser();
      if (user) {
        const token = await user.getIdToken(/* forceRefresh */ false);
        config.headers.Authorization = `Bearer ${token}`;

        if (import.meta.env.DEV) {
          console.debug('[API] Auth header attached', {
            url: config.url,
            hasToken: Boolean(token),
          });
        }
      } else if (import.meta.env.DEV) {
        console.debug('[API] No authenticated Firebase user for request', {
          url: config.url,
        });
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
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const originalRequest = error.config || {};

    if (status === 401) {
      try {
        const user = await resolveCurrentUser();

        if (user && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshedToken = await user.getIdToken(true);
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${refreshedToken}`,
          };

          if (import.meta.env.DEV) {
            console.debug('[API] Retrying 401 request with refreshed token', {
              url: originalRequest.url,
            });
          }

          return apiClient(originalRequest);
        }
      } catch (_refreshError) {
        // Fall through to redirect logic.
      }

      if (!['/login', '/signup'].includes(window.location.pathname)) {
        console.warn('Unauthorized — redirecting to login');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      console.warn('Forbidden — insufficient permissions');
    } else if (status >= 500) {
      console.error('Server error:', message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
