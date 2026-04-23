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
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (!data) {
      alert("Código inválido");
      window.location.href = "/";
      return;
    }

    if (!data.locked) {
      window.location.href = `/escolha/${code}`;
      return;
    }

    setData(data);
  }

  // 🔥 TELEFONE LIMPO
  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  // 🔥 TELEFONE PRINCIPAL
  function getTelefonePrincipal() {
    const t1 = limparTelefone(data?.tutor1_telefone);
    const t2 = limparTelefone(data?.tutor2_telefone);

    if (t1.length >= 10) return t1;
    if (t2.length >= 10) return t2;

    return null;
  }

  function telefoneValido(tel) {
    return tel && tel.length >= 10;
  }

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

        window.open(`https://wa.me/55${telefone}?text=${mensagem}`, "_blank");
      },
      () => {
        setLoadingLoc(false);
        alert("Permita a localização.");
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  const telefonePrincipal = getTelefonePrincipal();

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Oi, me chamo</h2>
        <h1 style={petNome}>{data.name}</h1>

        <p style={frase}>
          Estou perdido 😢 Me ajude a voltar pra casa!
        </p>
      </div>

      {/* CONTATO PRINCIPAL */}
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
              target="_blank"
              style={btnWhats}
            >
              💬 WhatsApp
            </a>
          </div>

          <button
            style={{
              ...btnLocal,
              opacity: telefoneValido(telefonePrincipal) ? 1 : 0.5
            }}
            disabled={!telefoneValido(telefonePrincipal)}
            onClick={() => enviarLocalizacao(telefonePrincipal)}
          >
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </div>
      )}

      {/* CONTATO 2 */}
      {telefoneValido(data?.tutor2_telefone) &&
        limparTelefone(data.tutor2_telefone) !== telefonePrincipal && (
          <div style={card}>
            <p style={label}>CONTATO 2</p>
            <h3>{data.tutor2_nome}</h3>

            <div style={botoes}>
              <a
                href={`tel:${limparTelefone(data.tutor2_telefone)}`}
                style={btnLigar}
              >
                📞 Ligar
              </a>

              <a
                href={`https://wa.me/55${limparTelefone(data.tutor2_telefone)}`}
                target="_blank"
                style={btnWhats}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}

      {/* OBS */}
      {data.observacoes && (
        <div style={card}>
          <p style={label}>INFORMAÇÕES</p>
          <p>{data.observacoes}</p>
        </div>
      )}

      {/* RODAPÉ */}
      <p style={rodape}>
        Este QR ajuda a encontrar pets perdidos 🐾  
        Compartilhe com responsabilidade 🙏
      </p>

    </Container>
  );
}

/* ===== ESTILOS ===== */

const header = {
  background: "#ff2d2d",
  padding: "25px 15px",
  borderRadius: "0 0 20px 20px",
  textAlign: "center",
  color: "#fff",
  marginBottom: 20
};

const foto = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff",
  marginBottom: 10
};

const nome = { margin: 0, fontSize: 16 };
const petNome = { margin: 0, fontSize: 26 };

const frase = { marginTop: 5 };

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
};

const label = {
  fontSize: 12,
  color: "#999",
  marginBottom: 5
};

const botoes = {
  display: "flex",
  gap: 10,
  marginTop: 10,
  flexWrap: "wrap"
};

const btnLigar = {
  flex: 1,
  background: "#ff2d2d",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: "600"
};

const btnWhats = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 12,
  textDecoration: "none",
  fontWeight: "600"
};

const btnLocal = {
  marginTop: 10,
  width: "100%",
  padding: 14,
  borderRadius: 12,
  border: "none",
  background: "#ff2d2d",
  color: "#fff",
  fontWeight: "bold"
};

const rodape = {
  textAlign: "center",
  fontSize: 12,
  color: "#777",
  marginTop: 20,
  lineHeight: 1.4
};