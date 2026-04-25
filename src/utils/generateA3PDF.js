import jsPDF from "jspdf";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";

export async function generateA3PDF(tags) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a3",
  });

  // 📄 DIMENSÕES A3
  const pageWidth = 297;
  const pageHeight = 420;

  // 🔒 MARGEM FIXA
  const margin = 20;

  // 📦 TAMANHOS FIXOS (SEU PADRÃO)
  const qrBox = 15;      // caixa do QR (1.5cm)
  const qrSize = 10;     // QR dentro (1cm)
  const textWidth = 30;  // área do código

  const boxWidth = qrBox + textWidth; // 45mm
  const boxHeight = qrBox;            // 15mm

  // 📐 ÁREA UTIL
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const cols = Math.floor(usableWidth / boxWidth);
  const rows = Math.floor(usableHeight / boxHeight);

  let index = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {

      if (index >= tags.length) break;

      const tag = tags[index];

      const x = margin + c * boxWidth;
      const y = margin + r * boxHeight;

      const url = `${BASE_URL}/qr/${tag.code}`;

      const qr = await QRCode.toDataURL(url, {
        margin: 0,
        scale: 4
      });

      // 🔲 BORDA EXTERNA
      pdf.rect(x, y, boxWidth, boxHeight);

      // 🔳 LINHA DIVISÓRIA
      pdf.line(x + qrBox, y, x + qrBox, y + boxHeight);

      // 📱 QR CENTRALIZADO NA CAIXA
      const qrOffset = (qrBox - qrSize) / 2;

      pdf.addImage(
        qr,
        "PNG",
        x + qrOffset,
        y + qrOffset,
        qrSize,
        qrSize
      );

      // 🔤 TEXTO
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(9);

      pdf.text(
        tag.code,
        x + qrBox + 2,
        y + boxHeight / 2 + 2
      );

      index++;
    }
  }

  pdf.save("QR_A3_KYDLAB.pdf");
}		