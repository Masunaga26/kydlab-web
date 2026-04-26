import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

export default function CadastroPessoa() {
  const { code } = useParams();

  const [nome, setNome] = useState("");
  const [dataNascTexto, setDataNascTexto] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [telefone1, setTelefone1] = useState("");
  const [telefone2, setTelefone2] = useState("");
  const [tutor1Nome, setTutor1Nome] = useState("");
  const [tutor2Nome, setTutor2Nome] = useState("");

  const [comorbidades, setComorbidades] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const [salvando, setSalvando] = useState(false);

  function telefoneValido(tel) {
    const limpo = tel.replace(/\D/g, "");
    return limpo.length === 10 || limpo.length === 11;
  }

  // 🔥 COMPRESSÃO
  function comprimirImagem(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 1200;
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  }

  async function handleFoto(e) {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await comprimirImagem(file);

    setFoto(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  function formatarDataISO(data) {
    if (!data || data.length !== 10) return null;
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  async function salvar() {
    if (salvando) return;

    if (!nome) {
      alert("Preencha o nome");
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
        const fileName = `${code}-${Date.now()}.jpg`;

        const { data, error: uploadError } = await supabase.storage
          .from("profile-photos") // ✅ CORRIGIDO
          .upload(fileName, foto, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("ERRO UPLOAD:", uploadError);
          alert("Erro ao enviar foto");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile-photos") // ✅ CORRIGIDO
          .getPublicUrl(fileName);

        foto_url = publicUrlData.publicUrl;
      }

      const updateData = {
        name: nome,
        data_nascimento: formatarDataISO(dataNascTexto),
        tipo_sanguineo: tipoSanguineo,

        tutor1_nome: tutor1Nome,
        tutor1_telefone: telefone1,

        tutor2_nome: tutor2Nome,
        tutor2_telefone: telefone2,

        comorbidades,
        alergias,
        medicamentos,

        tipo: "pessoa",
        locked: true,
      };

      if (foto_url) {
        updateData.foto_url = foto_url;
      }

      const { error } = await supabase
        .from("tags")
        .update(updateData)
        .eq("code", code);

      if (error) {
        alert("Erro ao salvar");
        return;
      }

      window.location.href = `/pessoa/${code}`;
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
        onClick={() => document.getElementById("fileInput").click()}
      >
        {preview ? (
          <img src={preview} style={imgCircle} />
        ) : (
          <span style={fotoTexto}>Adicionar foto</span>
        )}

        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFoto}
          style={{ display: "none" }}
        />
      </div>

      {/* NOME */}
      <label style={label}>Nome *</label>
      <input value={nome} onChange={(e) => setNome(e.target.value)} style={input} />

      {/* DATA */}
      <label style={label}>Data de nascimento</label>

      <input
        placeholder="__/__/____"
        value={dataNascTexto}
        onChange={(e) => {
          let v = e.target.value.replace(/\D/g, "");

          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
          if (v.length > 5) v = v.slice(0, 5) + "/" + v.slice(5, 9);

          setDataNascTexto(v);
        }}
        style={input}
      />

      {/* TIPO SANGUÍNEO */}
      <label style={label}>Tipo sanguíneo</label>
      <select
        value={tipoSanguineo}
        onChange={(e) => setTipoSanguineo(e.target.value)}
        style={input}
      >
        <option value="">Selecione</option>
        <option>O+</option>
        <option>O-</option>
        <option>A+</option>
        <option>A-</option>
        <option>B+</option>
        <option>B-</option>
        <option>AB+</option>
        <option>AB-</option>
      </select>

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

      {/* SAÚDE */}
      <label style={label}>Comorbidades</label>
      <input value={comorbidades} onChange={(e) => setComorbidades(e.target.value)} style={input} />

      <label style={label}>Alergias</label>
      <input value={alergias} onChange={(e) => setAlergias(e.target.value)} style={input} />

      <label style={label}>Medicamentos</label>
      <input value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} style={input} />

      {/* BOTÃO */}
      <button onClick={salvar} disabled={salvando} style={btnSalvar}>
        {salvando ? "Salvando..." : "Salvar"}
      </button>

      <p style={obs}>*Obrigatório</p>

    </Container>
  );
}

/* 🎨 ESTILOS */

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