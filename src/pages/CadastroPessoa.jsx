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

  function limparTelefone(tel) {
    return tel.replace(/\D/g, "");
  }

  function converterData(date) {
    if (!date) return null;
    return date.toISOString().split("T")[0];
  }

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
    } catch (err) {
      alert("Erro ao processar imagem");
    }
  }

  async function salvar() {
    const { data: check } = await supabase
      .from("tags")
      .select("locked")
      .eq("code", code)
      .single();

    if (check?.locked) {
      alert("Cadastro já bloqueado");
      return;
    }

    if (!name || !contato1Telefone) {
      alert("Preencha os campos obrigatórios");
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

    if (error) {
      alert(error.message);
      return;
    }

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
          <input type="file" onChange={handleFoto} hidden />
        </label>

        <input
          style={input}
          placeholder="Nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* 🔥 NOVO DATEPICKER */}
        <div>
          <label style={label}>📅 Data de nascimento</label>

          <DatePicker
            selected={dataNascimento}
            onChange={(date) => setDataNascimento(date)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            placeholderText="Selecione a data"
            className="custom-datepicker"
          />
        </div>
      </div>

      <div style={card}>
        <h3>🩸 Saúde</h3>

        <select style={input} value={tipoSanguineo} onChange={(e) => setTipoSanguineo(e.target.value)}>
          <option value="">Tipo sanguíneo</option>
          <option>O+</option><option>O-</option>
          <option>A+</option><option>A-</option>
          <option>B+</option><option>B-</option>
          <option>AB+</option><option>AB-</option>
        </select>

        <textarea style={input} placeholder="Comorbidades" value={comorbidades} onChange={(e) => setComorbidades(e.target.value)} />
        <textarea style={input} placeholder="Alergias" value={alergias} onChange={(e) => setAlergias(e.target.value)} />
        <textarea style={input} placeholder="Medicamentos" value={medicamentos} onChange={(e) => setMedicamentos(e.target.value)} />
      </div>

      <div style={card}>
        <h3>📞 Contatos</h3>

        <input style={input} placeholder="Nome do contato principal" value={contato1Nome} onChange={(e) => setContato1Nome(e.target.value)} />
        <input style={input} placeholder="Telefone principal" value={contato1Telefone} onChange={(e) => setContato1Telefone(e.target.value)} />

        <input style={input} placeholder="Nome contato 2" value={contato2Nome} onChange={(e) => setContato2Nome(e.target.value)} />
        <input style={input} placeholder="Telefone contato 2" value={contato2Telefone} onChange={(e) => setContato2Telefone(e.target.value)} />
      </div>

      <button style={botao} onClick={salvar}>
        💾 Salvar Cadastro
      </button>

    </Container>
  );
}

/* mantém seus estilos iguais */