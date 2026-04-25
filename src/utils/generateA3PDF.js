import { generateA3PDF } from "./generateA3PDF";

export async function gerarLoteA3() {
  // 1. BUSCAR QR NÃO IMPRESSOS
  const { data: tags, error } = await supabase
    .from("tags")
    .select("*")
    .eq("printed", false)
    .eq("locked", false)
    .limit(125);

  if (error || !tags || tags.length === 0) {
    alert("Nenhum QR disponível");
    return;
  }

  // 2. GERAR PDF
  await generateA3PDF(tags);

  // 3. MARCAR COMO IMPRESSO
  const ids = tags.map(t => t.id);

  const { error: updateError } = await supabase
    .from("tags")
    .update({ printed: true })
    .in("id", ids);

  if (updateError) {
    console.error("Erro ao marcar como impresso:", updateError);
  }
}