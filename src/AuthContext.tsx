import React, { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  username: string;
  email: string;
  image: string;
  bio: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

function noProviderError(): never {
  throw new Error("useAuth must be used within an AuthProvider");
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: noProviderError,
  logout: noProviderError,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function login(userData: User) {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
