import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function CadastroPet() {
  const { code } = useParams();

  const [nome, setNome] = useState("");
  const [telefone1, setTelefone1] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [tutor1Nome, setTutor1Nome] = useState("");
  const [tutor2Nome, setTutor2Nome] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [salvando, setSalvando] = useState(false);

  function telefoneValido(tel) {
    const limpo = tel.replace(/\D/g, "");
    return limpo.length === 10 || limpo.length === 11;
  }

  function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    setFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvar() {
    if (salvando) return;

    if (!nome) {
      alert("Preencha o nome do pet");
      return;
    }

    if (!telefoneValido(telefone1)) {
      alert("Telefone inválido");
      return;
    }

    if (telefone2 && !telefoneValido(telefone2)) {
      alert("Telefone inválido");
      return;
    }

    setSalvando(true);

    try {
      let foto_url = null;

      if (foto) {
        const fileName = `${code}-${Date.now()}`;

        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(fileName, foto);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("fotos")
            .getPublicUrl(fileName);

          foto_url = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase
        .from("tags")
        .update({
          name: nome,

          tutor1_nome: tutor1Nome,
          tutor1_telefone: telefone1,

          tutor2_nome: tutor2Nome,
          tutor2_telefone: telefone2,

          observacoes,
          foto_url,

          tipo: "pet",
          locked: true,
        })
        .eq("code", code);

      if (error) {
        alert("Erro ao salvar");
        return;
      }

      window.location.href = `/pet/${code}`;

    } catch (err) {
      console.error(err);
      alert("Erro inesperado");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Container>

      {/* FOTO */}
      <div
        style={fotoCircle}
        onClick={() => document.getElementById("fileInputPet").click()}
      >
        {preview ? (
          <img src={preview} style={imgCircle} />
        ) : (
          <span style={fotoTexto}>Adicionar foto</span>
        )}

        <input
          id="fileInputPet"
          type="file"
          accept="image/*"
          onChange={handleFoto}
          style={{ display: "none" }}
        />
      </div>

      {/* NOME */}
      <label style={label}>Nome do pet *</label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={input}
      />

      {/* CONTATO 1 */}
      <label style={label}>Contato principal *</label>
      <input
        placeholder="(99)99999-9999"
        value={telefone1}
        onChange={(e) =>
          setTelefone1(e.target.value.replace(/[^0-9()\- ]/g, ""))
        }
        style={input}
      />

      <input
        placeholder="Nome contato"
        value={tutor1Nome}
        onChange={(e) => setTutor1Nome(e.target.value)}
        style={input}
      />

      {/* CONTATO 2 */}
      <label style={label}>Contato secundário</label>
      <input
        placeholder="(99)99999-9999"
        value={telefone2}
        onChange={(e) =>
          setTelefone2(e.target.value.replace(/[^0-9()\- ]/g, ""))
        }
        style={input}
      />

      <input
        placeholder="Nome contato"
        value={tutor2Nome}
        onChange={(e) => setTutor2Nome(e.target.value)}
        style={input}
      />

      {/* OBSERVAÇÕES */}
      <label style={label}>Informações importantes</label>
      <input
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        style={input}
      />

      {/* BOTÃO */}
      <button onClick={salvar} disabled={salvando} style={btnSalvar}>
        {salvando ? "Salvando..." : "Salvar"}
      </button>

      <p style={obs}>*Obrigatório</p>

    </Container>
  );
}

/* 🔥 ESTILOS (mantidos) */

const fotoCircle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "#ffeaea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "20px auto",
  cursor: "pointer",
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};

const fotoTexto = {
  color: "#ff3b3b",
  fontWeight: 600,
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginTop: 5,
  marginBottom: 10,
};

const label = {
  marginTop: 10,
  display: "block",
};

const btnSalvar = {
  width: "100%",
  padding: 15,
  borderRadius: 12,
  background: "#ff3b3b",
  color: "#fff",
  border: "none",
  marginTop: 20,
};

const obs = {
  textAlign: "center",
  fontSize: 12,
  color: "#999",
  marginTop: 10,
};