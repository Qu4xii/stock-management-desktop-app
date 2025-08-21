// src/renderer/src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { StaffMember } from '../types';

interface AuthContextType {
  currentUser: StaffMember | null;
  isLoading: boolean;
  logIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => Promise<void>;
  logOut: () => void;
  updateCurrentUser: (user: StaffMember) => void; // Added this method
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logIn = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const user = await window.db.logIn(credentials);
      if (user) {
        setCurrentUser(user);
      } else {
        throw new Error("Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => {
    setIsLoading(true);
    try {
      const newUser = await window.db.signUp(data);
      setCurrentUser(newUser); // Automatically log in the user after signup
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = () => {
    setCurrentUser(null);
  };

  // New method to update current user after profile changes
  const updateCurrentUser = (user: StaffMember) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      logIn, 
      signUp, 
      logOut, 
      updateCurrentUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}