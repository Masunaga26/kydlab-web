import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TapLayout, { TapCard } from "../components/TapLayout";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "trocar-esta-senha";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  function entrar(e) {
    e.preventDefault();

    if (senha !== ADMIN_PASSWORD) {
      setErro("Senha incorreta");
      return;
    }

    localStorage.setItem("kyd_admin_auth", "true");
    navigate("/admin");
  }

  return (
    <TapLayout footerType="simple" productType="geral">
      <div style={screenCenter}>
        <TapCard style={loginCard}>
          <div style={iconBox}>🔐</div>

          <h1 style={title}>Admin KYD LAB</h1>

          <p style={subtitle}>
            Acesso restrito ao painel administrativo.
          </p>

          <form onSubmit={entrar}>
            <label style={label}>Senha de acesso</label>

            <input
              type="password"
              value={senha}
              onChange={(e) => {
                setSenha(e.target.value);
                setErro("");
              }}
              placeholder="Digite a senha"
              style={input}
              autoFocus
            />

            {erro && <p style={errorText}>{erro}</p>}

            <button type="submit" style={button}>
              Entrar
            </button>
          </form>
        </TapCard>
      </div>
    </TapLayout>
  );
}

/* 🎨 ESTILO ADMIN LOGIN */

const screenCenter = {
  minHeight: "72vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  padding: "24px 0",
};

const loginCard = {
  textAlign: "center",
  paddingTop: 34,
  paddingBottom: 34,
};

const iconBox = {
  width: 72,
  height: 72,
  margin: "0 auto 18px",
  borderRadius: 22,
  background: "#fff1f1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 34,
};

const title = {
  margin: 0,
  fontSize: 28,
  fontWeight: 950,
  color: "#111",
};

const subtitle = {
  margin: "10px 0 24px",
  color: "#666",
  fontSize: 15,
  lineHeight: 1.45,
};

const label = {
  display: "block",
  textAlign: "left",
  margin: "0 0 8px",
  color: "#666",
  fontSize: 13,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const input = {
  width: "100%",
  minHeight: 54,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ddd",
  background: "#fff",
  fontSize: 16,
  outline: "none",
  margin: 0,
};

const errorText = {
  margin: "12px 0 0",
  color: "#ef1c1c",
  fontSize: 14,
  fontWeight: 800,
};

const button = {
  width: "100%",
  minHeight: 56,
  marginTop: 18,
  borderRadius: 16,
  border: "none",
  background: "#ef1c1c",
  color: "#fff",
  fontWeight: 900,
  fontSize: 17,
  cursor: "pointer",
  boxShadow: "0 16px 30px rgba(239,28,28,.22)",
};