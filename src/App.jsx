import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 🔹 Páginas
import NfcView from "./pages/NfcView";
import QrRedirect from "./pages/QrRedirect";
import Escolha from "./pages/Escolha";

import CadastroPet from "./pages/CadastroPet";
import CadastroPessoa from "./pages/CadastroPessoa";

import PetView from "./pages/PetView";
import PessoaView from "./pages/PessoaView";

import Admin from "./pages/Admin";
import AdminEdit from "./pages/AdminEdit";
import AdminLogin from "./pages/AdminLogin";

// 🔒 Proteção Admin
import AdminRoute from "./components/AdminRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 ADMIN PRIMEIRO (CRÍTICO) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/edit/:code"
          element={
            <AdminRoute>
              <AdminEdit />
            </AdminRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* 🔥 REDIRECT RAIZ */}
        <Route path="/" element={<Navigate to="/escolha/TESTE123" />} />

        {/* 🔥 ENTRADAS */}
        <Route path="/qr/:code" element={<QrRedirect />} />
        <Route path="/nfc/:code" element={<NfcView />} />

        {/* 🔀 ESCOLHA */}
        <Route path="/escolha/:code" element={<Escolha />} />

        {/* 📝 CADASTRO */}
        <Route path="/cadastro/pet/:code" element={<CadastroPet />} />
        <Route path="/cadastro/pessoa/:code" element={<CadastroPessoa />} />

        {/* 👁️ VISUALIZAÇÃO */}
        <Route path="/pet/:code" element={<PetView />} />
        <Route path="/pessoa/:code" element={<PessoaView />} />

        {/* 🔥 FALLBACK (ESSENCIAL) */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}