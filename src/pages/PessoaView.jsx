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
      console.error(err);
      alert("Erro ao carregar");
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

  // 🔥 MENSAGEM PADRÃO CORRIGIDA
  function mensagemBase() {
    return encodeURIComponent(
      `Estou com ${data.name || "essa pessoa"} em uma emergência.`
    );
  }

  // 🔥 LOCALIZAÇÃO (NÃO MEXER NA BASE)
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
        <h1 style={pessoaNome}>{data.name || "Pessoa"}</h1>

        {data.data_nascimento && (
          <p style={idadeStyle}>
            🎂 {calcularIdade(data.data_nascimento)} anos
          </p>
        )}

        <p style={frase}>🚨 Em caso de emergência</p>
      </div>

      {/* 🔥 BOTÃO SAMU CORRIGIDO */}
      <a href="tel:192" style={btnSamu}>
        👉 Ligar SAMU (192)
      </a>

      {/* TIPO SANGUÍNEO */}
      {data.tipo_sanguineo && (
        <div style={tipoBox}>
          🩸 Tipo sanguíneo: <strong>{data.tipo_sanguineo}</strong>
        </div>
      )}

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
            <p style={label}>CONTATO 2</p>
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

      {/* SAÚDE */}
      {(data.comorbidades || data.alergias || data.medicamentos) && (
        <div style={card}>
          <h3>🩺 Informações de saúde</h3>

          {data.comorbidades && (
            <p><strong>Comorbidades:</strong> {data.comorbidades}</p>
          )}

          {data.alergias && (
            <p><strong>Alergias:</strong> {data.alergias}</p>
          )}

          {data.medicamentos && (
            <p><strong>Medicamentos:</strong> {data.medicamentos}</p>
          )}
        </div>
      )}

      <p style={rodape}>
        Este QR ajuda em situações de emergência.
        Use com responsabilidade 🙏
      </p>

    </Container>
  );
}

/* ESTILOS (mantidos) */