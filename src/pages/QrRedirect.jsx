import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function QrRedirect() {
  const { code } = useParams();

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
        alert("Código inválido");
        window.location.href = "/";
        return;
      }

      // 🔴 JÁ CADASTRADO
      if (data.locked) {
        if (data.tipo === "pet") {
          window.location.href = `/pet/${code}`;
        } else {
          window.location.href = `/pessoa/${code}`;
        }
        return;
      }

      // 🟡 SEM TIPO → escolha
      if (!data.tipo) {
        window.location.href = `/escolha/${code}`;
        return;
      }

      // 🟢 IR DIRETO PRO CADASTRO
      if (data.tipo === "pet") {
        window.location.href = `/cadastro/pet/${code}`;
      } else {
        window.location.href = `/cadastro/pessoa/${code}`;
      }

    } catch (err) {
      console.error("Erro no QR Redirect:", err);
      alert("Erro ao carregar. Tente novamente.");
      window.location.href = "/";
    }
  }

  return (
    <Container>
      <div style={box}>
        <div style={logo}>🔴 KYD LAB</div>

        <div style={loader}></div>

        <p style={texto}>Carregando informações...</p>
      </div>
    </Container>
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

const loader = {
  width: 40,
  height: 40,
  border: "4px solid #eee",
  borderTop: "4px solid #ff2d2d",
  borderRadius: "50%",
  margin: "0 auto",
  animation: "spin 1s linear infinite"
};