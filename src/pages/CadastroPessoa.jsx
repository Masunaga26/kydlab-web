import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Container from "../components/Container";
import imageCompression from "browser-image-compression";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CadastroPessoa() {
  const { code } = useParams();
  const navigate = useNavigate();

  const dataPadrao = new Date();
  dataPadrao.setFullYear(dataPadrao.getFullYear() - 18);

  const [name, setName] = useState("");
  const [dataNascimento, setDataNascimento] = useState(dataPadrao);
  const [dataTexto, setDataTexto] = useState("");

  const [contato1Nome, setContato1Nome] = useState("");
  const [contato1Telefone, setContato1Telefone] = useState("");

  const [contato2Nome, setContato2Nome] = useState("");
  const [contato2Telefone, setContato2Telefone] = useState("");

  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [comorbidades, setComorbidades] = useState("");
  const [alergias, setAlergias] = useState("");
  const [medicamentos, setMedicamentos] = useState("");

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
    const t = tel.replace(/\D/g, "");
    return t.length === 10 || t.length === 11;
  }

  function limparTelefone(tel) {
    return tel.replace(/\D/g, "");
  }

  function converterData(date) {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  }

  // 🔥 FOTO OK (mantido)
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

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(compressed);

    } catch (err) {
      alert("Erro ao processar imagem");
    }
  }

  async function salvar() {
    let erros = [];

    if (!name) erros.push("Nome");
    if (!telefoneValido(contato1Telefone)) erros.push("Telefone com DDD");

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
        data_nascimento: converterData(dataNascimento),
        tipo: "pessoa",
        tutor1_nome: contato1Nome,
        tutor1_telefone: limparTelefone(contato1Telefone),
        tutor2_nome: contato2Nome,
        tutor2_telefone: limparTelefone(contato2Telefone),
        tipo_sanguineo: tipoSanguineo,
        comorbidades,
        alergias,
        medicamentos,
        foto_url,
        locked: true
      })
      .eq("code", code);

    navigate(`/pessoa/${code}`);
  }

  return (
    <Container>

      <div style={header}>
        <h2>👤 Cadastro de Pessoa</h2>
        <p style={subtitle}>Identificação • {code}</p>
      </div>

      <div style={card}>
        <h3>📸 Foto</h3>

        <label style={fotoCircle}>
          {preview ? (
            <img src={preview} style={imgCircle} />
          ) : (
            <>
              <div style={{ fontSize: 28 }}>👤</div>
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
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label style={label}>📅 Data de nascimento</label>

        <DatePicker
          selected={dataNascimento}
          onChange={(date) => setDataNascimento(date)}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
        />

        {/* 🔥 DIGITAÇÃO MANUAL */}
        <input
          style={input}
          placeholder="Digite: DD/MM/AAAA"
          value={dataTexto}
          onChange={(e) => setDataTexto(e.target.value)}
        />
      </div>

      <div style={card}>
        <h3>📞 Contatos</h3>

        <input
          style={input}
          placeholder="Nome do contato principal"
          value={contato1Nome}
          onChange={(e) => setContato1Nome(e.target.value)}
        />

        <input
          style={{
            ...input,
            border: telefoneValido(contato1Telefone)
              ? "1px solid #ddd"
              : "1px solid red"
          }}
          placeholder="(11) 99999-9999"
          value={contato1Telefone}
          onChange={(e) =>
            setContato1Telefone(formatarTelefone(e.target.value))
          }
        />

        <input
          style={input}
          placeholder="Nome contato 2"
          value={contato2Nome}
          onChange={(e) => setContato2Nome(e.target.value)}
        />

        <input
          style={input}
          placeholder="Telefone contato 2"
          value={contato2Telefone}
          onChange={(e) =>
            setContato2Telefone(formatarTelefone(e.target.value))
          }
        />
      </div>

      <button style={botao} onClick={salvar}>
        💾 Salvar Cadastro
      </button>

    </Container>
  );
}

/* estilos mantidos */