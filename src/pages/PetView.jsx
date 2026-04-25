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
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      window.location.href = "/";
      return;
    }

    if (!data.locked) {
      window.location.href = `/escolha/${code}`;
      return;
    }

    setData(data);
  }

  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  function telefoneValido(tel) {
    return tel && (tel.length === 10 || tel.length === 11);
  }

  const telefone1 = limparTelefone(data?.tutor1_telefone);
  const telefone2 = limparTelefone(data?.tutor2_telefone);

  const telefonePrincipal = telefoneValido(telefone1)
    ? telefone1
    : telefoneValido(telefone2)
    ? telefone2
    : null;

  function mensagemBase() {
    return encodeURIComponent(
      `Encontrei ${data.name || "esse pet"} em uma emergência.`
    );
  }

  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) {
      alert("Telefone não disponível");
      return;
    }

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const mensagem = encodeURIComponent(
          `Encontrei ${data.name || "esse pet"} em uma emergência.\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      () => {
        setLoadingLoc(false);
        window.location.href = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <img
          src={
            data?.foto_url && data.foto_url !== ""
              ? data.foto_url + "?t=" + Date.now()
              : "https://via.placeholder.com/150"
          }
          style={foto}
        />

        <h2 style={nome}>Oi, me chamo</h2>
        <h1 style={petNome}>{data.name || "Pet"}</h1>

        <p style={frase}>
          Estou perdido 😢 Me ajude a voltar pra casa!
        </p>
      </div>

      {/* CONTATO PRINCIPAL */}
      {telefoneValido(telefonePrincipal) && (
        <div style={card}>
          <p style={label}>TUTOR 1</p>
          <h3>{data.tutor1_nome || data.tutor2_nome}</h3>

          <div style={botoes}>
            <a href={`tel:${telefonePrincipal}`} style={btnLigar}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/55${telefonePrincipal}?text=${mensagemBase()}`}
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

      {/* CONTATO 2 */}
      {telefoneValido(telefone2) &&
        telefone2 !== telefonePrincipal && (
          <div style={card}>
            <p style={label}>TUTOR 2</p>
            <h3>{data.tutor2_nome}</h3>

            <div style={botoes}>
              <a href={`tel:${telefone2}`} style={btnLigar}>
                📞 Ligar
              </a>

              <a
                href={`https://wa.me/55${telefone2}?text=${mensagemBase()}`}
                style={btnWhats}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}

      {/* OBSERVAÇÕES */}
      {data.observacoes && (
        <div style={card}>
          <p style={label}>INFORMAÇÕES IMPORTANTES</p>
          <p>{data.observacoes}</p>
        </div>
      )}

      <p style={rodape}>
        Este QR ajuda a encontrar pets perdidos 🐾
      </p>

    </Container>
  );
}

/* 🎨 ESTILOS MANTIDOS */

const header = { textAlign: "center", padding: 20 };

const foto = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 10,
};

const nome = { margin: 0 };

const petNome = {
  margin: 0,
  fontSize: 24,
};

const frase = { color: "#666" };

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
};

const botoes = {
  display: "flex",
  gap: 10,
  marginTop: 10,
};

const btnLigar = {
  flex: 1,
  background: "#e53935",
  color: "#fff",
  padding: 10,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none",
};

const btnWhats = {
  flex: 1,
  background: "#2ecc71",
  color: "#fff",
  padding: 10,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none",
};

const btnLocal = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  border: "none",
  background: "#e53935",
  color: "#fff",
};

const label = {
  fontSize: 12,
  color: "#888",
};

const rodape = {
  textAlign: "center",
  fontSize: 12,
  color: "#aaa",
  marginTop: 20,
};