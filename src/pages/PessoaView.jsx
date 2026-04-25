import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function PessoaView() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const { data: tag } = await supabase
      .from("tags")
      .select("*")
      .eq("code", code)
      .single();

    if (!tag) {
      window.location.href = "/";
      return;
    }

    if (!tag.locked) {
      window.location.href = `/escolha/${code}`;
      return;
    }

    setData(tag);
  }

  function limparTelefone(tel) {
    return (tel || "").replace(/\D/g, "");
  }

  const telefone = limparTelefone(data?.tutor1_telefone);

  function telefoneValido(tel) {
    return tel && tel.length >= 10;
  }

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nasc = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    return idade;
  }

  // 🔥 MENSAGEM PADRÃO
  function mensagemBase() {
    return encodeURIComponent(
      `Estou com ${data.name || "essa pessoa"} em uma emergência.`
    );
  }

  // 🔥 LOCALIZAÇÃO (iPHONE OK)
  function enviarLocalizacao() {
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
          `Estou com ${data.name || "essa pessoa"} em uma emergência.\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${mensagem}`;
      },
      () => {
        setLoadingLoc(false);

        window.location.href = `https://wa.me/55${telefone}?text=${mensagemBase()}`;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  return (
    <Container>

      {/* HEADER */}
      <div style={header}>
        <img
          src={data.foto_url || "https://via.placeholder.com/150"}
          style={foto}
        />

        <h2 style={nome}>Olá, meu nome é</h2>
        <h1 style={pessoaNome}>{data.name}</h1>

        {data.data_nascimento && (
          <p style={idadeStyle}>
            🎂 {calcularIdade(data.data_nascimento)} anos
          </p>
        )}

        <p style={frase}>🚨 Em caso de emergência</p>
      </div>

      {/* BOTÃO SAMU MELHORADO */}
      <a href="tel:192" style={btnSamu}>
        👉 Ligar SAMU (192)
      </a>

      {/* CONTATO */}
      {telefoneValido(telefone) && (
        <div style={card}>
          <h3>Contato</h3>

          <div style={botoes}>
            <a href={`tel:${telefone}`} style={btnLigar}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/55${telefone}?text=${mensagemBase()}`}
              style={btnWhats}
            >
              💬 WhatsApp
            </a>
          </div>

          <button style={btnLocal} onClick={enviarLocalizacao}>
            {loadingLoc ? "Enviando..." : "📍 Enviar localização"}
          </button>
        </div>
      )}

    </Container>
  );
}

/* ESTILOS */

const header = {
  background: "#ff2d2d",
  padding: "25px 15px",
  textAlign: "center",
  color: "#fff",
  borderRadius: "0 0 20px 20px"
};

const foto = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff"
};

const nome = { margin: 0 };
const pessoaNome = { margin: 0, fontSize: 26 };

const idadeStyle = { marginTop: 5 };

const frase = { marginTop: 10 };

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginTop: 15
};

const botoes = {
  display: "flex",
  gap: 10,
  marginTop: 10
};

const btnLigar = {
  flex: 1,
  background: "#ff2d2d",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none"
};

const btnWhats = {
  flex: 1,
  background: "#25D366",
  color: "#fff",
  padding: 12,
  textAlign: "center",
  borderRadius: 10,
  textDecoration: "none"
};

const btnLocal = {
  marginTop: 10,
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#ff2d2d",
  color: "#fff"
};

const btnSamu = {
  display: "block",
  width: "100%",
  padding: 14,
  marginTop: 15,
  textAlign: "center",
  background: "#d10000",
  color: "#fff",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: "bold"
};