import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

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
        window.location.replace("/");
        return;
      }

      // 🔴 SEM TIPO → ESCOLHA
      if (!data.tipo) {
        window.location.replace(`/escolha/${code}`);
        return;
      }

      // 🟡 TEM TIPO MAS NÃO CADASTRADO
      if (!data.locked) {
        if (data.tipo === "pet") {
          window.location.replace(`/cadastro/pet/${code}`);
        } else {
          window.location.replace(`/cadastro/pessoa/${code}`);
        }
        return;
      }

      // 🟢 CADASTRADO → VIEW
      if (data.tipo === "pet") {
        window.location.replace(`/pet/${code}`);
      } else {
        window.location.replace(`/pessoa/${code}`);
      }

    } catch (err) {
      console.error("Erro QR:", err);
      window.location.replace("/");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <p>Carregando...</p>
    </div>
  );
}