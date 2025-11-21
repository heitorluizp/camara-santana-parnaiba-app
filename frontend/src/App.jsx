import { Routes, Route, useLocation, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import NoticiaDetalhe from "./pages/NoticiaDetalhe";
import Vereadores from "./pages/Vereadores";
import VereadorDetalhe from "./pages/VereadorDetalhe";
import Leis from "./pages/Leis";
import Propostas from "./pages/Propostas";
import TvCamara from "./pages/TvCamara";
import OrdemDoDia from "./pages/OrdemDoDia";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminNoticias from "./pages/admin/AdminNoticias";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminLeis from "./pages/admin/AdminLeis";
import AdminPropostas from "./pages/admin/AdminPropostas";
import AdminOrdemDia from "./pages/admin/AdminOrdemDia";
import Perfil from "./pages/Perfil";
import Chat from "./pages/Chat";




function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Login />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Login />;
  }
  
  // Verificar se é admin ou vereador
  if (user.tipo !== 'admin' && user.tipo !== 'vereador') {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        background: '#020617', 
        color: '#f9fafb',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta área.</p>
        <p>Tipo de usuário: {user.tipo}</p>
        <p>Área restrita para administradores e vereadores.</p>
        <Link 
          to="/" 
          style={{ 
            color: '#3b82f6', 
            textDecoration: 'none',
            marginTop: '20px',
            padding: '10px 20px',
            border: '1px solid #3b82f6',
            borderRadius: '8px'
          }}
        >
          ← Voltar ao início
        </Link>
      </div>
    );
  }
  
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const Layout = isAdmin ? AdminLayout : AppLayout;

  return (
    <Layout>
      <Routes>
        {/* APP */}
        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />
        <Route
          path="/conversas"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/conversas/:id"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/noticia/:id" 
          element={
            <PrivateRoute>
              <NoticiaDetalhe />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/vereadores" 
          element={
            <PrivateRoute>
              <Vereadores />
            </PrivateRoute>
          } 
        />
        <Route
          path="/vereador/:id"
          element={
            <PrivateRoute>
              <VereadorDetalhe />
            </PrivateRoute>
          }
        />
        <Route 
          path="/leis" 
          element={
            <PrivateRoute>
              <Leis />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/propostas" 
          element={
            <PrivateRoute>
              <Propostas />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/tv" 
          element={
            <PrivateRoute>
              <TvCamara />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/ordem-do-dia" 
          element={
            <PrivateRoute>
              <OrdemDoDia />
            </PrivateRoute>
          } 
        />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/noticias" 
          element={
            <AdminRoute>
              <AdminNoticias />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/usuarios" 
          element={
            <AdminRoute>
              <AdminUsuarios />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/leis" 
          element={
            <AdminRoute>
              <AdminLeis />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/propostas" 
          element={
            <AdminRoute>
              <AdminPropostas />
            </AdminRoute>
          } 
        />
        <Route 
          path="/admin/ordem-dia" 
          element={
            <AdminRoute>
              <AdminOrdemDia />
            </AdminRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}
