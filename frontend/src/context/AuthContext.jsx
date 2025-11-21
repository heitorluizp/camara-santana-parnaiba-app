import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:3000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // carregar usuário salvo e verificar token
  useEffect(() => {
    const token = localStorage.getItem("app_token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  async function validateToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      } else {
        // Token inválido, remove do localStorage
        localStorage.removeItem("app_token");
        localStorage.removeItem("app_refresh_token");
      }
    } catch (error) {
      console.error("Erro ao validar token:", error);
      localStorage.removeItem("app_token");
      localStorage.removeItem("app_refresh_token");
    }
    setLoading(false);
  }

  async function login(email, senha) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar tokens
        localStorage.setItem("app_token", data.accessToken);
        localStorage.setItem("app_refresh_token", data.refreshToken);
        
        // Buscar dados do usuário
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          return { success: true, user: userData.user };
        }
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Erro no login' };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  async function register(nome, email, senha, telefone = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, email, senha, telefone })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Salvar tokens
        localStorage.setItem("app_token", data.accessToken);
        localStorage.setItem("app_refresh_token", data.refreshToken);
        
        // Buscar dados do usuário
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user);
          return { success: true };
        }
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Erro no cadastro' };
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return { success: false, error: 'Erro de conexão' };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("app_token");
    localStorage.removeItem("app_refresh_token");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
