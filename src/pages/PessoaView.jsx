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
    return tel && tel.length >= 10;
  }

  const telefonePrincipal =
    telefoneValido(limparTelefone(data?.tutor1_telefone))
      ? limparTelefone(data?.tutor1_telefone)
      : telefoneValido(limparTelefone(data?.tutor2_telefone))
      ? limparTelefone(data?.tutor2_telefone)
      : null;

  function calcularIdade(dataNascimento) {
    if (!dataNascimento) return null;

    const hoje = new Date();
    const nasc = new Date(dataNascimento);

    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;

    return idade;
  }

  // 🔥 LOCALIZAÇÃO CORRIGIDA + MENSAGEM MELHOR
  function enviarLocalizacao(telefone) {
    if (!telefoneValido(telefone)) return;

    setLoadingLoc(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoadingLoc(false);

        const { latitude, longitude } = pos.coords;

        const msg = encodeURIComponent(
          `Estou com ${data.name || "essa pessoa"} em uma emergência.\nLocalização:\nhttps://maps.google.com/?q=${latitude},${longitude}`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${msg}`;
      },
      () => {
        setLoadingLoc(false);

        const msg = encodeURIComponent(
          `Estou com ${data.name || "essa pessoa"} em uma emergência`
        );

        window.location.href = `https://wa.me/55${telefone}?text=${msg}`;
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  if (!data) return <p style={{ textAlign: "center" }}>Carregando...</p>;

  const msgWhats = encodeURIComponent(
    `Estou com ${data.name || "essa pessoa"} em uma emergência`
  );

  return (
    <Container>

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

      {/* 🔥 SAMU CORRIGIDO */}
      <a href="tel:192" style={btnSamu}>
        👇 Ligar para o SAMU (192)
      </a>

      {telefonePrincipal && (
        <div style={card}>
          <p style={label}>CONTATO PRINCIPAL</p>
          <h3>{data.tutor1_nome || data.tutor2_nome}</h3>

          <div style={botoes}>
            <a href={`tel:${telefonePrincipal}`} style={btnLigar}>
              📞 Ligar
            </a>

            <a
              href={`https://wa.me/55${telefonePrincipal}?text=${msgWhats}`}
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

    </Container>
  );
}