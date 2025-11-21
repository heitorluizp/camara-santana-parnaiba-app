import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // carregar usuário salvo
  useEffect(() => {
    const saved = localStorage.getItem("app_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function login(name, email) {
    const u = { name, email };
    setUser(u);
    localStorage.setItem("app_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("app_user");
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
