import { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from '../firebase/firebaseConfig';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * AuthProvider — wraps app with Firebase auth state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Email/password login
  const syncBackendProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      return;
    }

    try {
      const token = await firebaseUser.getIdToken();
      if (import.meta.env.DEV) {
        console.debug('[Auth] Syncing profile with backend', {
          uid: firebaseUser.uid,
          hasToken: Boolean(token),
        });
      }

      await fetch(`${API_BASE}/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        }),
      });
    } catch (syncError) {
      if (import.meta.env.DEV) {
        console.warn('[Auth] Backend profile sync failed', syncError);
      }
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setUser(result.user);
      await syncBackendProfile(result.user);
      return result.user;
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  // Email/password signup
  const signup = async (email, password, displayName) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      setUser(auth.currentUser || result.user);
      await syncBackendProfile(auth.currentUser || result.user);
      return result.user;
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      await syncBackendProfile(result.user);
      return result.user;
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get current ID token
  const getToken = async () => {
    if (!user) return null;
    return user.getIdToken();
  };

  const clearError = () => setError(null);

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
    getToken,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

/**
 * Map Firebase error codes to user-friendly messages.
 */
function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
}

export default AuthContext;
