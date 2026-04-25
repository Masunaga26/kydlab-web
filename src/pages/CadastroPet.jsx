import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";
import imageCompression from "browser-image-compression";

export default function CadastroPet() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [contato1Nome, setContato1Nome] = useState("");
  const [contato1Telefone, setContato1Telefone] = useState("");

  const [contato2Nome, setContato2Nome] = useState("");
  const [contato2Telefone, setContato2Telefone] = useState("");

  const [observacoes, setObservacoes] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  // 🔥 FORMATAR TELEFONE
  function formatarTelefone(valor) {
    return valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  }

  function telefoneValido(tel) {
    return tel.replace(/\D/g, "").length >= 10;
  }

  // 📸 FOTO
  async function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1024,
    });

    setFoto(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  // 💾 SALVAR
  async function salvar() {
    if (!name || !contato1Telefone) {
      alert("Preencha os campos obrigatórios (*)");
      return;
    }

    if (!telefoneValido(contato1Telefone)) {
      alert("Telefone inválido. Use DDD.");
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

    const { error } = await supabase
      .from("tags")
      .update({
        name,

        tutor1_nome: contato1Nome,
        tutor1_telefone: contato1Telefone.replace(/\D/g, ""),

        tutor2_nome: contato2Nome,
        tutor2_telefone: contato2Telefone.replace(/\D/g, ""),

        observacoes,

        foto_url,
        tipo: "pet",
        locked: true,
      })
      .eq("code", code);

    if (error) {
      alert(error.message);
      return;
    }

    navigate(`/pet/${code}`);
  }

  return (
    <Container>
      <h2>🐶 Cadastro do Pet</h2>

      {/* FOTO */}
      <div style={card}>
        <h3>📸 Foto</h3>

        <label style={fotoCircle}>
          {preview ? (
            <img src={preview} style={imgCircle} />
          ) : (
            <span>Adicionar foto</span>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleFoto}
            hidden
          />
        </label>
      </div>

      {/* DADOS */}
      <div style={card}>
        <label>
          Nome do pet <span style={obrigatorio}>*</span>
        </label>
        <input
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* CONTATO 1 */}
      <div style={card}>
        <h3>Contato principal</h3>

        <input
          style={input}
          placeholder="Nome"
          value={contato1Nome}
          onChange={(e) => setContato1Nome(e.target.value)}
        />

        <input
          style={{
            ...input,
            border: telefoneValido(contato1Telefone)
              ? "1px solid #ddd"
              : "1px solid red",
          }}
          placeholder="(99) 99999-9999"
          value={contato1Telefone}
          onChange={(e) =>
            setContato1Telefone(formatarTelefone(e.target.value))
          }
        />
      </div>

      {/* CONTATO 2 */}
      <div style={card}>
        <h3>Contato secundário</h3>

        <input
          style={input}
          placeholder="Nome"
          value={contato2Nome}
          onChange={(e) => setContato2Nome(e.target.value)}
        />

        <input
          style={input}
          placeholder="(99) 99999-9999"
          value={contato2Telefone}
          onChange={(e) =>
            setContato2Telefone(formatarTelefone(e.target.value))
          }
        />
      </div>

      {/* OBSERVAÇÕES */}
      <div style={card}>
        <label>Observações</label>
        <textarea
          style={input}
          placeholder="Ex: dócil, idoso, precisa de cuidados..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />
      </div>

      <p style={{ fontSize: 12, color: "#777" }}>
        * Campos obrigatórios
      </p>

      <button style={botao} onClick={salvar}>
        💾 Salvar
      </button>
    </Container>
  );
}

/* ESTILOS */
const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15
};

const fotoCircle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "#eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  cursor: "pointer"
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover"
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 5,
  borderRadius: 8,
  border: "1px solid #ddd"
};

const obrigatorio = {
  color: "red"
};

const botao = {
  width: "100%",
  padding: 15,
  background: "#ff2d2d",
  color: "#fff",
  border: "none",
  borderRadius: 10
};