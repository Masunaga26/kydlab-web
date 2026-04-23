import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function NfcView() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [bloqueado, setBloqueado] = useState(true);

  useEffect(() => {
    verificar();
  }, []);

  async function verificar() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) return;

    // 🔒 NÃO ATIVADO
    if (!data.locked) {
      setBloqueado(true);
      return;
    }

    // 🔓 ATIVADO → LIBERA
    setBloqueado(false);

    // 🔥 REDIRECIONAMENTO CORRETO
    if (data.tipo === "pet") {
      navigate(`/pet/${code}`);
    } else {
      navigate(`/pessoa/${code}`);
    }
  }

  if (bloqueado) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <h2>🔒 Produto não ativado</h2>
        <p>Finalize o cadastro antes de usar o NFC</p>
      </div>
    );
  }

  return null;
}