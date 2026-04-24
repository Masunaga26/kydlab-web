import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function PetView() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const { data: tag, error } = await supabase
        .from("tags")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !tag) {
        alert("Código inválido");
        window.location.href = "/";
        return;
      }

      if (!tag.locked) {
        window.location.href = `/escolha/${code}`;
        return;
      }

      setData(tag);

    } catch (err) {
      console.error("Erro ao carregar PetView:", err);
      alert("Erro ao carregar dados");
      window.location.href = "/";
    }
  }

  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  const telefone1 = limparTelefone(data?.tutor1_telefone);
  const telefone2 = limparTelefone(data?.tutor2_telefone);

  function telefoneValido(tel) {
    return tel && tel.length >= 10;
  }

  const telefonePrincipal =
    telefoneValido(telefone1)
      ? telefone1
      : telefoneValido(telefone2)
      ? telefone2
      : null;

  // 🔥 CORRIGIDO PRA iPHONE
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível");
      return;
    }

    if (!navigator.geolocation) {
      alert("Seu dispositivo não suporta localização.");
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Encontrei o pet!\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        // 🔥 FIX iPHONE
        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      () => {
        setLoadingLoc(false);

        // 🔥 FALLBACK
        const mensagem = encodeURIComponent(
          `Encontrei o pet, mas não consegui enviar a localização.`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  return (
    <Container>

      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Oi, me chamo</h2>
        <h1 style={petNome}>{data.name || "Pet"}</h1>

        <p style={frase}>
          Estou perdido 😢 Me ajude a voltar pra casa!
        </p>
      </div>

      {telefoneValido(telefonePrincipal) && (
        <div style={card}>
          <p style={label}>CONTATO PRINCIPAL</p>
          <h3>{data.tutor1_nome || data.tutor2_nome || "Responsável"}</h3>

          <div style={botoes}>
            <a href={`tel:${telefonePrincipal}`} style={btnLigar}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/55${telefonePrincipal}`}
              style={btnWhats}
            >
              💬 WhatsApp
            </a>
          </div>

          <button
            style={btnLocal}
            onClick={() => enviarLocalizacao(telefonePrincipal)}
          >
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </div>
      )}

      {telefoneValido(telefone2) &&
        telefone2 !== telefonePrincipal && (
          <div style={card}>
            <p style={label}>CONTATO 2</p>
            <h3>{data.tutor2_nome}</h3>

            <div style={botoes}>
              <a href={`tel:${telefone2}`} style={btnLigar}>
                📞 Ligar
              </a>

              <a
                href={`https://wa.me/55${telefone2}`}
                style={btnWhats}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}

      {data.observacoes && (
        <div style={card}>
          <p style={label}>INFORMAÇÕES</p>
          <p>{data.observacoes}</p>
        </div>
      )}

      <p style={rodape}>
        Este QR ajuda a encontrar pets perdidos 🐾  
        Compartilhe com responsabilidade 🙏
      </p>

    </Container>
  );
}

/* ESTILOS (mantidos) */