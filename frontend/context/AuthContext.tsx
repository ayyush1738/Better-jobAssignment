"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * RBAC Definitions
 * Manager: Can create flags and override AI blocks.
 * Developer: Can view and toggle flags in non-production.
 */
type Role = 'manager' | 'developer' | null;

interface User {
  email: string;
}

interface AuthContextType {
  role: Role;
  token: string | null;
  user: User | null;
  login: (role: Role, token: string, email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * HYDRATION PHASE
   * Ensures the session persists after a page refresh by checking LocalStorage.
   */
  useEffect(() => {
    const savedRole = localStorage.getItem('safeconfig_role') as Role;
    const savedToken = localStorage.getItem('safeconfig_token');
    const savedEmail = localStorage.getItem('safeconfig_email');

    if (savedRole && savedToken) {
      setRole(savedRole);
      setToken(savedToken);
      if (savedEmail) setUser({ email: savedEmail });
    }
    setIsLoading(false);
  }, []);

  /**
   * SESSION ACTIVATION
   * Persists the JWT and User Profile. 
   * Note: The keys here must match the keys read by lib/api.ts.
   */
  const login = (newRole: Role, newToken: string, email: string) => {
    setRole(newRole);
    setToken(newToken);
    setUser({ email });

    localStorage.setItem('safeconfig_role', newRole as string);
    localStorage.setItem('safeconfig_token', newToken);
    localStorage.setItem('safeconfig_email', email);
  };

  /**
   * SESSION TERMINATION
   * Clears all local state and forces a redirect to the login page.
   */
  const logout = () => {
    setRole(null);
    setToken(null);
    setUser(null);

    localStorage.removeItem('safeconfig_role');
    localStorage.removeItem('safeconfig_token');
    localStorage.removeItem('safeconfig_email');

    // Resetting window location ensures no stale data remains in memory
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ role, token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};