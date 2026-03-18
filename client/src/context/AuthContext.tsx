"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  type AuthUser,
} from "@/lib/auth-api";

/**
 * Unified user type for the application
 */
interface AppUser extends AuthUser {
  firebaseUser?: FirebaseUser | null;
}

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Auth methods
  loginCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  loginGoogle: () => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;

  // Role checks
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  loginCredentials: async () => ({ success: false }),
  loginGoogle: async () => ({ success: false }),
  logout: async () => {},
  isAdmin: false,
  isStaff: false,
  isStudent: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check session from API
   */
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (data.authenticated && data.user) {
        setUser(data.user);
        setToken(data.user.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.user.token);
        }
        return true;
      } else {
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
        return false;
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
      setToken(null);
      return false;
    }
  }, []);

  /**
   * Login with credentials (Admin/Staff)
   */
  const loginCredentials = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          email,
          password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.user);
        setToken(result.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', result.token);
        }
        return { success: true, redirectUrl: result.redirectUrl };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }, []);

  /**
   * Login with Google (Students)
   * This is called after Firebase authentication is complete
   */
  const loginGoogle = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return { success: false, error: "No Firebase user found" };
    }

    try {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          firebaseToken: idToken,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUser({ ...result.user, firebaseUser });
        setToken(result.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', result.token);
        }
        return { success: true, redirectUrl: result.redirectUrl };
      }

      // If backend auth fails, sign out from Firebase
      await firebaseSignOut(auth);
      return { success: false, error: result.error };
    } catch (error) {
      console.error("Google login error:", error);
      await firebaseSignOut(auth);
      return { success: false, error: "Failed to authenticate with server" };
    }
  }, []);

  /**
   * Logout - Clear session
   */
  const logout = useCallback(async () => {
    try {
      // Sign out from Firebase if student
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }

      // Clear session
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });

      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      await checkSession();
      setLoading(false);
    };

    initAuth();
  }, [checkSession]);

  /**
   * Listen for Firebase auth state changes (for students)
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && user?.role === "STUDENT") {
        // Update firebase user reference
        setUser(prev => prev ? { ...prev, firebaseUser } : null);
      }
    });

    return () => unsubscribe();
  }, [user?.role]);

  // Role checks
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";
  const isStudent = user?.role === "STUDENT";
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated,
      loginCredentials,
      loginGoogle,
      logout,
      isAdmin,
      isStaff,
      isStudent,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
