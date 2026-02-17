"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the two roles required for the assignment
type Role = 'manager' | 'developer' | null;

interface AuthContextType {
  role: Role;
  token: string | null;
  login: (role: Role, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydration: On page load, check if the user has an existing session in LocalStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('safeconfig_role') as Role;
    const savedToken = localStorage.getItem('safeconfig_token');

    if (savedRole && savedToken) {
      setRole(savedRole);
      setToken(savedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (newRole: Role, newToken: string) => {
    setRole(newRole);
    setToken(newToken);
    
    // Senior Tip: Persist session so refreshing the page doesn't "log out" the user
    localStorage.setItem('safeconfig_role', newRole as string);
    localStorage.setItem('safeconfig_token', newToken);
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    localStorage.removeItem('safeconfig_role');
    localStorage.removeItem('safeconfig_token');
    
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ role, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access in components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};