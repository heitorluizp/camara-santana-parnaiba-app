import { Routes, Route, useLocation } from "react-router-dom";
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
import Perfil from "./pages/Perfil";
import MinhasConversas from "./pages/MinhasConversas";
import Cadastro from "./pages/Cadastro";




function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Login />;
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
        <Route path="/cadastro" element={<Cadastro />} />

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
      <MinhasConversas />
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
            <PrivateRoute>
              <AdminNoticias />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Layout>
  );
}
