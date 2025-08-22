// Updated AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { StaffMember } from '../types';

interface AuthContextType {
  currentUser: StaffMember | null;
  isLoading: boolean;
  logIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => Promise<void>;
  logOut: () => void;
  updateCurrentUser: (user: StaffMember) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const logIn = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required.");
      }

      const user = await window.db.logIn(credentials);
      
      if (user) {
        setCurrentUser(user);
      } else {
        // If user is null/undefined, throw a specific error
        throw new Error("Invalid email or password.");
      }
    } catch (error: any) {
      // Re-throw the error so it can be caught in the component
      throw new Error(error.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: Pick<StaffMember, 'name' | 'email' | 'phone'> & { password: string }) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!data.name || !data.email || !data.password) {
        throw new Error("Name, email, and password are required.");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Please enter a valid email address.");
      }

      // Password strength validation
      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      const newUser = await window.db.signUp(data);
      
      if (newUser) {
        setCurrentUser(newUser);
      } else {
        throw new Error("Failed to create account. Please try again.");
      }
    } catch (error: any) {
      // Re-throw the error so it can be caught in the component
      throw new Error(error.message || "Account creation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = () => {
    setCurrentUser(null);
  };

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