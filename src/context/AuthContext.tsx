import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (userData?: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kc_auth') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('kc_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('kc_auth', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('kc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kc_user');
    }
  }, [user]);

  function login(userData?: UserProfile) {
    if (userData) {
      setUser(userData);
    } else if (!user) {
      setUser({ name: 'Learner', email: 'learner@kannadaconnect.com' });
    }
    setIsLoggedIn(true);
  }

  function logout() {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('kc_user');
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
