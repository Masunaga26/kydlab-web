import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";
import imageCompression from "browser-image-compression";

export default function CadastroPet() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [telefone, setTelefone] = useState("");
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

  // 📸 FOTO (GALERIA + CÂMERA)
  async function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      setFoto(compressed);
      setPreview(URL.createObjectURL(compressed));
    } catch {
      alert("Erro ao processar imagem");
    }
  }

  // 💾 SALVAR
  async function salvar() {
    if (!name || !telefone) {
      alert("Preencha os campos obrigatórios (*)");
      return;
    }

    if (!telefoneValido(telefone)) {
      alert("Digite um telefone válido com DDD");
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
        tipo: "pet",
        tutor1_telefone: telefone.replace(/\D/g, ""),
        observacoes,
        foto_url,
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
            <>
              <div style={{ fontSize: 28 }}>🐾</div>
              <span style={fotoTexto}>Adicionar foto</span>
            </>
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
        <label style={label}>
          Nome do pet <span style={obrigatorio}>*</span>
        </label>
        <input
          style={input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={label}>
          Telefone do responsável <span style={obrigatorio}>*</span>
        </label>
        <input
          style={{
            ...input,
            border: telefoneValido(telefone)
              ? "1px solid #ddd"
              : "1px solid red",
          }}
          placeholder="(99) 99999-9999"
          value={telefone}
          onChange={(e) =>
            setTelefone(formatarTelefone(e.target.value))
          }
        />
      </div>

      {/* OBS */}
      <div style={card}>
        <label style={label}>Observações</label>
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
        💾 Salvar Cadastro
      </button>

    </Container>
  );
}

/* ===== ESTILOS ===== */

const card = {
  background: "#fff",
  padding: 15,
  borderRadius: 15,
  marginBottom: 15,
  boxShadow: "0 4px 15px rgba(0,0,0,0.08)"
};

const fotoCircle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "#ffeaea",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  cursor: "pointer"
};

const fotoTexto = {
  color: "#ff3b3b",
  fontWeight: 600
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover"
};

const input = {
  width: "100%",
  padding: 12,
  borderRadius: 10,
  border: "1px solid #ddd",
  marginTop: 5
};

const label = {
  marginTop: 10,
  display: "block"
};

const obrigatorio = {
  color: "red"
};

const botao = {
  width: "100%",
  padding: 16,
  background: "#ff2d2d",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontWeight: "bold"
};