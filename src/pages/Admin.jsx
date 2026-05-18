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
  const [gerandoA3, setGerandoA3] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ CORREÇÃO AQUI
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

        if (error) {
          console.error("Erro ao buscar tags:", error);
          break;
        }

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
      console.error("Erro inesperado:", err);
    } finally {
      setLoading(false);
    }
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
      Lote: t.lote || "-",
      Impresso: t.printed ? "Sim" : "Não",
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

  // ... RESTO DO CÓDIGO CONTINUA EXATAMENTE IGUAL (SEM ALTERAÇÃO)
}