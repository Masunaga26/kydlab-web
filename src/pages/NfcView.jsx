import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function NfcView() {
  const { code } = useParams();

  const [status, setStatus] = useState("loading");
  // loading | bloqueado | redirecionando

  useEffect(() => {
    verificar();
  }, []);

  async function verificar() {
    try {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !data) {
        setStatus("bloqueado");
        return;
      }

      // 🔒 NÃO ATIVADO
      if (!data.locked) {
        setStatus("bloqueado");
        return;
      }

      // 🔥 ATIVADO → REDIRECIONA DIRETO (SEM BUG)
      setStatus("redirecionando");

      const destino =
        data.tipo === "pet"
          ? `/pet/${code}`
          : `/pessoa/${code}`;

      // 🚀 REDIRECT ROBUSTO (NFC SAFE)
      window.location.href = destino;

    } catch (err) {
      console.error("Erro NFC:", err);
      setStatus("bloqueado");
    }
  }

  // 🔄 LOADING
  if (status === "loading" || status === "redirecionando") {
    return (
      <div style={box}>
        <div style={logo}>🔴 KYD LAB</div>

        <div style={loader}></div>

        <p style={texto}>
          {status === "loading"
            ? "Carregando..."
            : "Abrindo informações..."}
        </p>
      </div>
    );
  }

  // 🔒 BLOQUEADO
  return (
    <div style={bloqueadoBox}>
      <h2>🔒 Produto não ativado</h2>
      <p>Finalize o cadastro antes de usar o NFC</p>
    </div>
  );
}

/* ===== ESTILOS ===== */

const box = {
  textAlign: "center",
  marginTop: 80
};

const logo = {
  fontWeight: "bold",
  fontSize: 18,
  marginBottom: 20
};

const texto = {
  marginTop: 20,
  color: "#777"
};

const bloqueadoBox = {
  padding: 20,
  textAlign: "center"
};

const loader = {
  width: 40,
  height: 40,
  border: "4px solid #eee",
  borderTop: "4px solid #ff2d2d",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite"
};