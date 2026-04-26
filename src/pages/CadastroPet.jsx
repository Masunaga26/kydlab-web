import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

import TapLayout, {
  TapHero,
  TapCard,
  TapSectionTitle,
  TapSecurityNotice,
  TapWarningBox,
  TapPrimaryButton,
} from "../components/TapLayout";

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

  // 🔥 COMPRESSÃO (mantida)
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
        const fileName = `${code}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, foto, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          console.error("ERRO UPLOAD:", uploadError);
          alert("Erro no upload");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(fileName);

        foto_url = publicUrlData.publicUrl;
      }

      const updateData = {
        name: nome,

        tutor1_nome: tutor1Nome,
        tutor1_telefone: telefone1,

        tutor2_nome: tutor2Nome,
        tutor2_telefone: telefone2,

        observacoes,

        tipo: "pet",
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
        console.error(error);
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
    <TapLayout footerType="simple" productType="pet" code={code}>
      <TapHero
        variant="form"
        title="Cadastre os dados"
        subtitle="Identificação pet de emergência"
        code={code}
      />

      <TapSecurityNotice>
        Não pedimos dados sensíveis como documentos ou dados bancários.
      </TapSecurityNotice>

      <TapCard>
        <TapSectionTitle
          icon="🐾"
          title="Dados do Pet"
          subtitle="Essas informações ajudam a identificar e devolver o pet com mais rapidez."
        />

        <div style={photoRow}>
          <div
            style={fotoCircle}
            onClick={() => document.getElementById("fileInputPet").click()}
          >
            {preview ? (
              <img src={preview} style={imgCircle} alt="Prévia do pet" />
            ) : (
              <span style={fotoIcon}>🐶</span>
            )}

            <input
              id="fileInputPet"
              type="file"
              accept="image/*"
              onChange={handleFoto}
              style={{ display: "none" }}
            />
          </div>

          <div style={photoTextBox}>
            <button
              type="button"
              onClick={() => document.getElementById("fileInputPet").click()}
              style={uploadButton}
            >
              ⬆️ Enviar foto
            </button>

            <p style={uploadHint}>JPG ou PNG, máx 5MB</p>
          </div>
        </div>

        <label style={label}>Nome do pet *</label>
        <input
          placeholder="Nome do pet"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={input}
        />
      </TapCard>

      <TapCard>
        <TapSectionTitle
          icon="📞"
          title="Contatos dos Tutores"
          subtitle="Esses contatos serão usados para ajudar o pet a voltar para casa."
        />

        <div style={contactBox}>
          <h3 style={contactTitle}>Tutor 1</h3>

          <label style={labelSmall}>Nome</label>
          <input
            placeholder="Nome do tutor"
            value={tutor1Nome}
            onChange={(e) => setTutor1Nome(e.target.value)}
            style={input}
          />

          <label style={labelSmall}>Telefone *</label>
          <input
            placeholder="(00) 00000-0000"
            value={telefone1}
            onChange={(e) =>
              setTelefone1(e.target.value.replace(/[^0-9()\- ]/g, ""))
            }
            style={input}
          />
        </div>

        <div style={contactBox}>
          <h3 style={contactTitle}>Tutor 2</h3>

          <label style={labelSmall}>Nome</label>
          <input
            placeholder="Nome do tutor"
            value={tutor2Nome}
            onChange={(e) => setTutor2Nome(e.target.value)}
            style={input}
          />

          <label style={labelSmall}>Telefone</label>
          <input
            placeholder="(00) 00000-0000"
            value={telefone2}
            onChange={(e) =>
              setTelefone2(e.target.value.replace(/[^0-9()\- ]/g, ""))
            }
            style={input}
          />
        </div>
      </TapCard>

      <TapCard>
        <TapSectionTitle
          icon="🩺"
          title="Informações Importantes"
          subtitle="Adicione observações que possam ajudar quem encontrar o pet."
        />

        <label style={label}>Condições especiais, comportamento ou observações</label>
        <textarea
          placeholder="Ex: Idoso e dócil, usa medicação, assusta com barulho..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          style={textarea}
        />
      </TapCard>

      <TapWarningBox>
        Para segurança e eficiência do produto, após salvar os dados não são
        alterados. Revise antes de salvar.
      </TapWarningBox>

      <TapPrimaryButton onClick={salvar} disabled={salvando}>
        {salvando ? "Salvando..." : "💾 Salvar dados"}
      </TapPrimaryButton>

      <p style={obs}>* Campos obrigatórios</p>
    </TapLayout>
  );
}

/* 🎨 ESTILOS VISUAIS DA TELA */

const photoRow = {
  display: "flex",
  alignItems: "center",
  gap: 20,
  marginBottom: 24,
};

const fotoCircle = {
  width: 120,
  height: 120,
  minWidth: 120,
  borderRadius: "50%",
  background: "#fbe2e2",
  border: "5px solid #f3caca",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  overflow: "hidden",
};

const imgCircle = {
  width: "100%",
  height: "100%",
  borderRadius: "50%",
  objectFit: "cover",
};

const fotoIcon = {
  fontSize: 44,
};

const photoTextBox = {
  flex: 1,
};

const uploadButton = {
  width: "auto",
  background: "transparent",
  color: "#ef1c1c",
  border: "none",
  padding: 0,
  margin: 0,
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  textAlign: "left",
};

const uploadHint = {
  margin: "10px 0 0",
  color: "#777",
  fontSize: 14,
};

const label = {
  display: "block",
  margin: "16px 0 8px",
  color: "#111",
  fontWeight: 800,
  fontSize: 15,
};

const labelSmall = {
  display: "block",
  margin: "16px 0 8px",
  color: "#666",
  fontWeight: 850,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const input = {
  width: "100%",
  minHeight: 56,
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid #e5e5e5",
  background: "#fff",
  fontSize: 16,
  color: "#222",
  outline: "none",
  margin: 0,
};

const textarea = {
  ...input,
  minHeight: 108,
  resize: "vertical",
  lineHeight: 1.4,
};

const contactBox = {
  background: "#fafafa",
  border: "1px solid #f0f0f0",
  borderRadius: 18,
  padding: 18,
  marginTop: 16,
};

const contactTitle = {
  margin: "0 0 12px",
  color: "#d71920",
  fontSize: 18,
  fontWeight: 900,
};

const obs = {
  textAlign: "center",
  fontSize: 12,
  color: "#999",
  margin: "12px 0 0",
};