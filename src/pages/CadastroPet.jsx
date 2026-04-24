import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";
import imageCompression from "browser-image-compression";

export default function CadastroPet() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [tutor1Nome, setTutor1Nome] = useState("");
  const [tutor1Telefone, setTutor1Telefone] = useState("");
  const [tutor2Nome, setTutor2Nome] = useState("");
  const [tutor2Telefone, setTutor2Telefone] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔥 TELEFONE FORMATADO
  function formatarTelefone(valor) {
    const v = valor.replace(/\D/g, "");

    if (v.length <= 10) {
      return v
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return v
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }

  function telefoneValido(tel) {
    const t = (tel || "").replace(/\D/g, "");
    return t.length === 10 || t.length === 11;
  }

  function limparTelefone(tel) {
    return tel.replace(/\D/g, "");
  }

  // 🔥 FOTO (FIX iPHONE)
  async function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      setFoto(compressedFile);

      // 🔥 FileReader evita tela preta
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      alert("Erro ao processar imagem");
    }
  }

  async function salvar() {
    let erros = [];

    if (!name) erros.push("Nome do pet");
    if (!telefoneValido(tutor1Telefone)) erros.push("Telefone com DDD");

    if (erros.length > 0) {
      alert(`Preencha corretamente:\n- ${erros.join("\n- ")}`);
      return;
    }

    let foto_url = null;

    if (foto) {
      const fileName = `${code}_${Date.now()}`;

      const { error } = await supabase.storage
        .from("profile-photos")
        .upload(fileName, foto);

      if (!error) {
        const { data } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        foto_url = data.publicUrl;
      }
    }

    await supabase
      .from("tags")
      .update({
        name,
        tipo: "pet",

        tutor1_nome: tutor1Nome,
        tutor1_telefone: limparTelefone(tutor1Telefone),

        tutor2_nome: tutor2Nome,
        tutor2_telefone: limparTelefone(tutor2Telefone),

        observacoes,
        foto_url,
        locked: true
      })
      .eq("code", code);

    navigate(`/pet/${code}`);
  }

  return (
    <Container>

      <div style={header}>
        <h2>🐶 Cadastro do Pet</h2>
        <p style={subtitle}>Identificação • {code}</p>
      </div>

      <div style={card}>
        <h3>📸 Foto</h3>

        <label style={fotoCircle}>
          {preview ? (
            <img src={preview} style={imgCircle} />
          ) : (
            <>
              <div style={{ fontSize: 28 }}>🐾</div>
              <span style={fotoTexto}>Enviar foto</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFoto}
            hidden
          />
        </label>

        <input
          style={input}
          placeholder="Nome do pet"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div style={card}>
        <h3>📞 Tutores</h3>

        <input
          style={input}
          placeholder="Nome do tutor principal"
          value={tutor1Nome}
          onChange={(e) => setTutor1Nome(e.target.value)}
        />

        <input
          style={{
            ...input,
            border: telefoneValido(tutor1Telefone)
              ? "1px solid #ddd"
              : "1px solid red"
          }}
          placeholder="(11) 99999-9999"
          value={tutor1Telefone}
          onChange={(e) =>
            setTutor1Telefone(formatarTelefone(e.target.value))
          }
        />

        <input
          style={input}
          placeholder="Nome tutor 2"
          value={tutor2Nome}
          onChange={(e) => setTutor2Nome(e.target.value)}
        />

        <input
          style={input}
          placeholder="Telefone contato 2"
          value={tutor2Telefone}
          onChange={(e) =>
            setTutor2Telefone(formatarTelefone(e.target.value))
          }
        />
      </div>

      <div style={card}>
        <h3>📝 Observações</h3>

        <textarea
          style={input}
          placeholder="Ex: dócil, idoso, precisa de cuidados..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <div style={alerta}>
        ⚠️ Revise os dados antes de salvar.
      </div>

      <button style={botao} onClick={salvar}>
        💾 Salvar Cadastro
      </button>

    </Container>
  );
}

/* estilos mantidos */