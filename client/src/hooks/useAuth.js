import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for auth operations — thin wrapper over AuthContext.
 */
export function useAuth() {
  return useAuthContext();
}

export default useAuth;
