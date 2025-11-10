/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from "react";

type User = {
  id: number;
  userName: string;
  email: string;
  role: "admin" | "user";
};

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // 👈 agregado
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // cargar datos desde localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    try {
      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.userName && parsed?.email) {
          setAccessToken(storedToken);
          setUser(parsed);
        }
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setAccessToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setAccessToken(null);
    setUser(null);
  };

  // 👇 agregamos setUser al value
  const value: AuthContextType = {
    user,
    accessToken,
    login,
    logout,
    isAuthenticated: !!accessToken,
    setUser, // 👈 agregado
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// hook personalizado
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};
