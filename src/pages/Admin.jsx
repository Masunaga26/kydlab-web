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
      console.error("Erro ao buscar tags:", error);
      setLoading(false);
      return;
    }

    setTags(data || []);
    setLoading(false);
  }

  function sairAdmin() {
    localStorage.removeItem("kyd_admin_auth");
    window.location.href = "/admin/login";
  }

  // STATUS
  const getStatus = (t) => {
    if (t.locked) return "Cadastrado";
    if (t.name) return "Vinculado";
    return "Disponível";
  };

  // TELEFONE
  const getTelefone = (t) => {
    return t.tutor1_telefone || t.tutor2_telefone || "-";
  };

  // EDITAR
  function editar(tag) {
    window.location.href = `/admin/edit/${tag.code}`;
  }

  // LIMPAR
  async function limpar(tag) {
    if (!confirm(`Deseja resetar o QR ${tag.code}?`)) return;

    const { error } = await supabase
      .from("tags")
      .update({
        locked: false,
        printed: false,
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

    if (error) {
      alert("Erro ao limpar");
      console.error(error);
      return;
    }

    fetchData();
  }

  // BAIXAR QR
  async function baixarQR(tag) {
    try {
      const url = `${BASE_URL}/qr/${tag.code}`;

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 1000,
      });

      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `QR_${tag.code}.png`;
      link.click();
    } catch (err) {
      alert("Erro ao gerar QR");
      console.error(err);
    }
  }

  // EXPORT XLS
  function exportXLS() {
    const data = tags.map((t) => ({
      Código: t.code,
      NFC: `${BASE_URL}/nfc/${t.code}`,
      QR: `${BASE_URL}/qr/${t.code}`,
      Nome: t.name || "-",
      Telefone: getTelefone(t),
      Status: getStatus(t),
      Criado: new Date(t.created_at).toLocaleString(),
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

  // 🚀 GERAR A3 CORRETO (SEM GERAR NOVO LOTE)
  async function gerarA3() {
    const { data: tagsDisponiveis, error } = await supabase
      .from("tags")
      .select("*")
      .eq("printed", false)
      .eq("locked", false)
      .limit(125);

    if (error || !tagsDisponiveis || tagsDisponiveis.length === 0) {
      alert("Nenhum QR disponível");
      return;
    }

    await generateA3PDF(tagsDisponiveis);

    const ids = tagsDisponiveis.map((t) => t.id);

    await supabase.from("tags").update({ printed: true }).in("id", ids);

    alert("PDF A3 gerado com sucesso!");

    fetchData();
  }

  // FILTRO
  const filtered = tags.filter((t) =>
    String(t.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const total = tags.length;
  const cadastrados = tags.filter((t) => t.locked).length;
  const disponiveis = tags.filter((t) => !t.locked && !t.name).length;
  const impressos = tags.filter((t) => t.printed).length;

  return (
    <div style={page}>
      <div style={shell}>
        <header style={header}>
          <div>
            <p style={eyebrow}>Painel administrativo</p>
            <h1 style={title}>Admin KYD LAB</h1>
            <p style={subtitle}>
              Controle dos códigos QR/NFC, exportações e geração de folhas A3.
            </p>
          </div>

          <button type="button" onClick={sairAdmin} style={logoutButton}>
            Sair
          </button>
        </header>

        <section style={statsGrid}>
          <div style={statCard}>
            <span style={statLabel}>Total</span>
            <strong style={statNumber}>{total}</strong>
          </div>

          <div style={statCard}>
            <span style={statLabel}>Cadastrados</span>
            <strong style={statNumber}>{cadastrados}</strong>
          </div>

          <div style={statCard}>
            <span style={statLabel}>Disponíveis</span>
            <strong style={statNumber}>{disponiveis}</strong>
          </div>

          <div style={statCard}>
            <span style={statLabel}>Impressos</span>
            <strong style={statNumber}>{impressos}</strong>
          </div>
        </section>

        <section style={toolbar}>
          <button type="button" onClick={exportXLS} style={buttonDark}>
            📥 Exportar XLS
          </button>

          <button type="button" onClick={gerarA3} style={buttonRed}>
            📄 Gerar A3
          </button>
        </section>

        <section style={searchCard}>
          <label style={searchLabel}>Buscar código</label>
          <input
            placeholder="Digite o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
          />
        </section>

        {loading && (
          <section style={emptyCard}>
            <div style={loader}></div>
            <p style={emptyText}>Carregando códigos...</p>
          </section>
        )}

        {!loading && (
          <section style={tableCard}>
            <div style={tableHeader}>
              <h2 style={tableTitle}>Códigos</h2>
              <span style={tableCount}>{filtered.length} resultado(s)</span>
            </div>

            {filtered.length === 0 ? (
              <div style={emptyState}>
                <p style={emptyText}>Nenhum código encontrado.</p>
              </div>
            ) : (
              <div style={tableScroll}>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={th}>Código</th>
                      <th style={th}>Status</th>
                      <th style={th}>Tipo</th>
                      <th style={th}>Nome</th>
                      <th style={th}>Telefone</th>
                      <th style={th}>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((tag) => (
                      <tr key={tag.code}>
                        <td style={tdCode}>{tag.code}</td>

                        <td style={td}>
                          <span style={statusBadge(getStatus(tag))}>
                            {getStatus(tag)}
                          </span>
                        </td>

                        <td style={td}>{tag.tipo || "-"}</td>
                        <td style={td}>{tag.name || "-"}</td>
                        <td style={td}>{getTelefone(tag)}</td>

                        <td style={td}>
                          <div style={actions}>
                            <button
                              type="button"
                              style={actionButtonDark}
                              onClick={() => baixarQR(tag)}
                              title="Baixar QR"
                            >
                              ⬇️ QR
                            </button>

                            <button
                              type="button"
                              style={actionButtonBlue}
                              onClick={() => editar(tag)}
                              title="Editar"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              style={actionButtonRed}
                              onClick={() => limpar(tag)}
                              title="Limpar"
                            >
                              🧹
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

/* 🎨 ESTILO ADMIN */

const page = {
  minHeight: "100vh",
  background: "#f5f5f5",
  color: "#111",
  fontFamily: "Inter, Arial, sans-serif",
};

const shell = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "24px 16px 40px",
};

const header = {
  background: "#ef1c1c",
  color: "#fff",
  padding: 28,
  borderRadius: 24,
  marginBottom: 18,
  boxShadow: "0 16px 36px rgba(239,28,28,.22)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
};

const logoutButton = {
  width: "auto",
  minHeight: 40,
  padding: "0 16px",
  borderRadius: 12,
  border: "none",
  background: "rgba(255,255,255,.18)",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const eyebrow = {
  margin: "0 0 6px",
  fontSize: 13,
  fontWeight: 900,
  opacity: 0.8,
  textTransform: "uppercase",
  letterSpacing: ".5px",
};

const title = {
  margin: 0,
  fontSize: 34,
  lineHeight: 1.1,
  fontWeight: 950,
};

const subtitle = {
  margin: "10px 0 0",
  fontSize: 15,
  lineHeight: 1.45,
  opacity: 0.9,
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 18,
};

const statCard = {
  background: "#fff",
  borderRadius: 18,
  padding: 18,
  border: "1px solid #eee",
  boxShadow: "0 10px 24px rgba(0,0,0,.06)",
};

const statLabel = {
  display: "block",
  color: "#777",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 8,
};

const statNumber = {
  display: "block",
  color: "#111",
  fontSize: 28,
  lineHeight: 1,
  fontWeight: 950,
};

const toolbar = {
  display: "flex",
  gap: 10,
  marginBottom: 14,
};

const buttonDark = {
  width: "auto",
  minHeight: 48,
  padding: "0 18px",
  borderRadius: 14,
  border: "none",
  background: "#222",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const buttonRed = {
  ...buttonDark,
  background: "#ef1c1c",
};

const searchCard = {
  background: "#fff",
  borderRadius: 18,
  padding: 18,
  marginBottom: 14,
  border: "1px solid #eee",
  boxShadow: "0 10px 24px rgba(0,0,0,.06)",
};

const searchLabel = {
  display: "block",
  fontSize: 13,
  fontWeight: 900,
  color: "#777",
  textTransform: "uppercase",
  letterSpacing: ".4px",
  marginBottom: 8,
};

const searchInput = {
  width: "100%",
  minHeight: 52,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid #ddd",
  fontSize: 16,
  outline: "none",
};

const tableCard = {
  background: "#fff",
  borderRadius: 22,
  padding: 18,
  border: "1px solid #eee",
  boxShadow: "0 12px 28px rgba(0,0,0,.08)",
};

const tableHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const tableTitle = {
  margin: 0,
  fontSize: 22,
  fontWeight: 950,
};

const tableCount = {
  color: "#777",
  fontSize: 13,
  fontWeight: 800,
};

const tableScroll = {
  width: "100%",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: 780,
};

const th = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #eee",
  color: "#777",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: ".4px",
};

const td = {
  padding: "13px 10px",
  borderBottom: "1px solid #f0f0f0",
  color: "#333",
  fontSize: 14,
  verticalAlign: "middle",
};

const tdCode = {
  ...td,
  fontWeight: 900,
  color: "#111",
};

const actions = {
  display: "flex",
  gap: 6,
};

const actionButtonBase = {
  width: "auto",
  minHeight: 36,
  padding: "0 10px",
  borderRadius: 10,
  border: "none",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const actionButtonDark = {
  ...actionButtonBase,
  background: "#555",
};

const actionButtonBlue = {
  ...actionButtonBase,
  background: "#3498db",
};

const actionButtonRed = {
  ...actionButtonBase,
  background: "#e74c3c",
};

const emptyCard = {
  background: "#fff",
  borderRadius: 22,
  padding: 28,
  textAlign: "center",
  border: "1px solid #eee",
};

const emptyState = {
  padding: 28,
  textAlign: "center",
};

const emptyText = {
  margin: 0,
  color: "#777",
  fontSize: 15,
};

const loader = {
  width: 42,
  height: 42,
  border: "5px solid #f1f1f1",
  borderTop: "5px solid #ef1c1c",
  borderRadius: "50%",
  margin: "0 auto 16px",
  animation: "spin 1s linear infinite",
};

function statusBadge(status) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 28,
    padding: "0 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
  };

  if (status === "Cadastrado") {
    return {
      ...base,
      background: "#eaf8ef",
      color: "#168a45",
    };
  }

  if (status === "Vinculado") {
    return {
      ...base,
      background: "#fff4d8",
      color: "#9a6a00",
    };
  }

  return {
    ...base,
    background: "#f1f1f1",
    color: "#666",
  };
}