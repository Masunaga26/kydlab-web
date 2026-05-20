import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { generateA3PDF } from "../utils/generateA3PDF";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";
const QTD_QR_A3 = 125;

export default function Admin() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    let todos = [];
    let from = 0;
    let to = 999;
    let hasMore = true;

    try {
      while (hasMore) {
        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) break;

        todos = [...todos, ...data];

        if (data.length < 1000) {
          hasMore = false;
        } else {
          from += 1000;
          to += 1000;
        }
      }

      setTags(todos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 📊 STATS
  const total = tags.length;
  const cadastrados = tags.filter((t) => t.locked).length;
  const disponiveis = tags.filter((t) => !t.locked && !t.name).length;
  const impressos = tags.filter((t) => t.printed).length;

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
    if (!confirm(`Deseja resetar o QR ${tag.code}?`)) return;

    await supabase
      .from("tags")
      .update({
        locked: false,
        printed: false,
        name: null,
      })
      .eq("code", tag.code);

    fetchData();
  }

  async function baixarQR(tag) {
    const url = `${BASE_URL}/qr/${tag.code}`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 1000,
    });

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `QR_${tag.code}.png`;
    link.click();
  }

  function exportXLS() {
    const data = tags.map((t) => ({
      Código: t.code,
      Nome: t.name || "-",
      Telefone: getTelefone(t),
      Status: getStatus(t),
      Impresso: t.printed ? "Sim" : "Não",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tags");

    const buffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([buffer]), "tags_kydlab.xlsx");
  }

  // 🎨 UI
  return (
    <div style={{ padding: 20 }}>

      <h2>🛠 Admin KYDLAB</h2>

      {/* 🔥 STATS */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <Card title="Total" value={total} />
        <Card title="Cadastrados" value={cadastrados} />
        <Card title="Disponíveis" value={disponiveis} />
        <Card title="Impressos" value={impressos} />
      </div>

      <button onClick={exportXLS}>Exportar XLS</button>

      <input
        placeholder="Buscar código..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table border="1" width="100%" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Status</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {tags
            .filter((t) => t.code.includes(search))
            .map((t) => (
              <tr key={t.code}>
                <td>{t.code}</td>
                <td>{getStatus(t)}</td>
                <td>{t.name || "-"}</td>
                <td>{getTelefone(t)}</td>

                <td>
                  <button onClick={() => baixarQR(t)}>QR</button>
                  <button onClick={() => editar(t)}>Editar</button>
                  <button onClick={() => limpar(t)}>Limpar</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// 🔲 CARD
function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 15,
        borderRadius: 10,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        minWidth: 120,
      }}
    >
      <div style={{ fontSize: 12 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}