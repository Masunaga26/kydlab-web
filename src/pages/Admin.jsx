import { useEffect, useState } from "react";

export default function Admin() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    // 🔁 Aqui você já deve ter sua chamada real (Supabase ou API)
    // Exemplo mock (remove depois)
    const mock = [
      { code: "ABC123", status: "Disponível", nome: null },
      { code: "DEF456", status: "Ativado", nome: "João" },
      { code: "GHI789", status: "Ativado", nome: "Maria" },
    ];
    setTags(mock);
  }, []);

  // 🔥 CONTADORES
  const total = tags.length;
  const cadastrados = tags.filter(t => t.status === "Ativado").length;
  const disponiveis = tags.filter(t => t.status === "Disponível").length;

  return (
    <div style={{ padding: 20 }}>
      <h1>🔧 Admin KYDLAB</h1>

      {/* 📊 DASHBOARD */}
      <div style={{
        display: "flex",
        gap: 20,
        marginBottom: 20
      }}>
        <div style={box}>Total QR<br /><b>{total}</b></div>
        <div style={box}>Cadastrados<br /><b>{cadastrados}</b></div>
        <div style={box}>Disponíveis<br /><b>{disponiveis}</b></div>
      </div>

      {/* 📋 TABELA */}
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>Código</th>
            <th>Status</th>
            <th>Nome</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((t, i) => (
            <tr key={i}>
              <td>{t.code}</td>
              <td>{t.status}</td>
              <td>{t.nome || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const box = {
  background: "#ef1c1c",
  color: "#fff",
  padding: 20,
  borderRadius: 10,
  flex: 1,
  textAlign: "center",
  fontSize: 18
};