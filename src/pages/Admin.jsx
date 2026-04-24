import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { generateA3PDF } from "../utils/generateA3PDF";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setTags(data || []);
    setLoading(false);
  }

  const getStatus = (t) => {
    if (t.locked) return "Cadastrado";
    if (t.name) return "Vinculado";
    return "Disponível";
  };

  const getTelefone = (t) => {
    return t.tutor1_telefone || t.tutor2_telefone || "-";
  };

  function editar(tag) {
    window.location.href = `/admin/edit/${tag.code}`;
  }

  async function limpar(tag) {
    if (!confirm("Resetar QR?")) return;

    await supabase
      .from("tags")
      .update({
        locked: false,
        name: null,
        tutor1_nome: null,
        tutor1_telefone: null,
        tutor2_nome: null,
        tutor2_telefone: null,
        foto_url: null,
        tipo: null,
        tipo_sanguineo: null,
        comorbidades: null,
        alergias: null,
        medicamentos: null,
        observacoes: null,
      })
      .eq("code", tag.code);

    fetchData();
  }

  async function baixarQR(tag) {
    const url = `${BASE_URL}/qr/${tag.code}`;

    const qr = await QRCode.toDataURL(url, { width: 1000 });

    const link = document.createElement("a");
    link.href = qr;
    link.download = `QR_${tag.code}.png`;
    link.click();
  }

  function exportXLS() {
    const data = tags.map((t) => ({
      Código: t.code,
      NFC: `${BASE_URL}/nfc/${t.code}`,
      QR: `${BASE_URL}/qr/${t.code}`,
      Nome: t.name || "-",
      Telefone: getTelefone(t),
      Status: getStatus(t),
      Impresso: t.printed ? "Sim" : "Não",
      Criado: new Date(t.created_at).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tags");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(new Blob([buffer]), "tags_kydlab.xlsx");
  }

  // 🚀 AQUI ESTÁ A CORREÇÃO REAL
  async function gerarA3() {
    const { data: tags, error } = await supabase
      .rpc("get_tags_for_print", { qty: 125 });

    if (error || !tags || tags.length === 0) {
      alert("Sem QR disponíveis");
      return;
    }

    await generateA3PDF(tags);

    alert("A3 gerado com sucesso!");
    fetchData();
  }

  const filtered = tags.filter((t) =>
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 20 }}>
      <h1>🛠️ Admin KYDLAB</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={exportXLS}>📥 XLS</button>
        <button onClick={gerarA3}>📄 Gerar A3 (125 QR)</button>
      </div>

      <input
        placeholder="Buscar código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <br /><br />

      {loading && <p>Carregando...</p>}

      {!loading && (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Status</th>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Impresso</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((tag) => (
              <tr key={tag.code}>
                <td>{tag.code}</td>
                <td>{getStatus(tag)}</td>
                <td>{tag.name || "-"}</td>
                <td>{getTelefone(tag)}</td>
                <td>{tag.printed ? "Sim" : "Não"}</td>

                <td>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button onClick={() => baixarQR(tag)}>⬇️</button>
                    <button onClick={() => editar(tag)}>✏️</button>
                    <button onClick={() => limpar(tag)}>🧹</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}