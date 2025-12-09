import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextData } from '../types/Auth';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load auth data from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('@App:token');
    const storedUser = localStorage.getItem('@App:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, _password: string): Promise<void> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Fake authentication - accept any credentials
    const fakeToken = `fake-jwt-token-${Date.now()}`;
    const fakeUser: User = {
      id: '1',
      username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
    };

    // Store in localStorage
    localStorage.setItem('@App:token', fakeToken);
    localStorage.setItem('@App:user', JSON.stringify(fakeUser));

    setToken(fakeToken);
    setUser(fakeUser);
  };

  const logout = (): void => {
    localStorage.removeItem('@App:token');
    localStorage.removeItem('@App:user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
