import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types/Task';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (params: { email: string; password: string }) => Promise<void>;
  register: (params: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check existing session on boot
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AuthService.getAccessToken();
        if (token) {
          // Try to get fresh profile or fallback to cached
          try {
            const currentUser = await AuthService.getCurrentUser(token);
            setUser(currentUser);
          } catch {
            const cached = await AuthService.getCachedUser();
            setUser(cached);
          }
        }
      } catch (error) {
        console.warn('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (params: { email: string; password: string }) => {
    const { user: authUser } = await AuthService.login(params);
    setUser(authUser);
  };

  const register = async (params: { name: string; email: string; password: string }) => {
    const { user: authUser } = await AuthService.register(params);
    setUser(authUser);
  };

  const logout = async () => {
    try {
      try {
        const { TaskApiService } = await import('../services/api/taskApi');
        await TaskApiService.disconnectLms();
      } catch (lmsErr) {
        console.warn('LMS disconnect during logout warning:', lmsErr);
      }
      await AuthService.logout();
    } finally {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
