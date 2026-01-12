import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Types
interface UserData {
  _id?: string;
  storeEmail?: string;
  storeName?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  isAuthenticated: boolean;
  LogOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Cookie management utilities
const COOKIE_OPTIONS = "; path=/; SameSite=Strict";

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}${COOKIE_OPTIONS}`;
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC${COOKIE_OPTIONS}`;
}

interface ContextProviderProps {
  children: ReactNode;
}

export default function ContextProviderAllOver({ children }: ContextProviderProps) {
  // Initialize state from cookies for persistence
  const [userData, setUserData] = useState<UserData | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getCookie('accessToken'));
  const [userEmail, setUserEmailState] = useState<string | null>(() => getCookie('userEmail'));

  // Computed property for authentication status
  const isAuthenticated = Boolean(token && userEmail);

  // Token setter with cookie persistence
  const setToken = (newToken: string | null) => {
    if (newToken) {
      setCookie('accessToken', newToken, 7); // 7 days
    } else {
      deleteCookie('accessToken');
    }
    setTokenState(newToken);
  };

  // Email setter with cookie persistence
  const setUserEmail = (email: string | null) => {
    if (email) {
      setCookie('userEmail', email, 7); // 7 days
    } else {
      deleteCookie('userEmail');
    }
    setUserEmailState(email);
  };

  // Logout function
  const LogOut = () => {
    deleteCookie('accessToken');
    deleteCookie('userEmail');
    setTokenState(null);
    setUserEmailState(null);
    setUserData(null);
  };

  // Verify token on mount
  useEffect(() => {
    // If we have stored credentials, we're potentially authenticated
    // The actual verification happens when accessing protected routes
  }, []);

  const contextValue: AuthContextType = {
    userData,
    setUserData,
    token,
    setToken,
    userEmail,
    setUserEmail,
    isAuthenticated,
    LogOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useTheContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useTheContext must be used within a ContextProviderAllOver");
  }
  return context;
};
