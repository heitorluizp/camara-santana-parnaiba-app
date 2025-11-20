import { Routes, Route, useLocation } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/Home";
import NoticiaDetalhe from "./pages/NoticiaDetalhe";
import Vereadores from "./pages/Vereadores";
import VereadorDetalhe from "./pages/VereadorDetalhe";
import Leis from "./pages/Leis";
import Propostas from "./pages/Propostas";
import TvCamara from "./pages/TvCamara";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminNoticias from "./pages/admin/AdminNoticias";

export default function App() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");

  const Layout = isAdmin ? AdminLayout : AppLayout;

  return (
    <Layout>
      <Routes>
        {/* APP */}
        <Route path="/" element={<Home />} />
        <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
        <Route path="/vereadores" element={<Vereadores />} />
        <Route path="/vereador/:id" element={<VereadorDetalhe />} />
        <Route path="/leis" element={<Leis />} />
        <Route path="/propostas" element={<Propostas />} />
        <Route path="/tv" element={<TvCamara />} />

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/noticias" element={<AdminNoticias />} />
      </Routes>
    </Layout>
  );
}
