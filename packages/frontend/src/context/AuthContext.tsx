import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  setRole: (role: string) => void;
}

function parseRole(token: string | null): string | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role ?? null
  } catch {
    return null
  }
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<string | null>(() =>
    parseRole(localStorage.getItem("token"))
  );

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    setRole(parseRole(newToken));
  };
  const logout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
