import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CadastroPessoa() {
  const { code } = useParams();

  const [nome, setNome] = useState("");
  const [dataNascTexto, setDataNascTexto] = useState("");
  const [dataNascObj, setDataNascObj] = useState(null);
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

  // 🔥 NOVO — COMPRESSÃO
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
          0.7 // qualidade
        );
      };

      reader.readAsDataURL(file);
    });
  }

  // 📸 FOTO (AGORA COM COMPRESSÃO)
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
          data_nascimento: dataNascObj
            ? dataNascObj.toISOString().split("T")[0]
            : formatarDataISO(dataNascTexto),
          tipo_sanguineo: tipoSanguineo,

          tutor1_nome: tutor1Nome,
          tutor1_telefone: telefone1,

          tutor2_nome: tutor2Nome,
          tutor2_telefone: telefone2,

          comorbidades,
          alergias,
          medicamentos,

          foto_url,

          tipo: "pessoa",
          locked: true,
        })
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
      <div style={fotoCircle} onClick={() => document.getElementById("fileInput").click()}>
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

      {/* RESTANTE IGUAL (não alterado) */}
    </Container>
  );
}

/* estilos iguais */