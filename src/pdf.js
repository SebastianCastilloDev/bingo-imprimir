import { jsPDF } from "jspdf";
import { generateCards } from "./bingo";

export function generateBingoPDF(quantity, cardsPerPage) {
  // Configuración base A4: 210 x 297 mm
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const cards = generateCards(quantity);

  // Layouts
  const layoutConf = {
    4: {
      rows: 2,
      cols: 2,
      cardWidth: 90,
      cardHeight: 120,
      marginX: 10,
      marginY: 20,
    },
    6: {
      rows: 3,
      cols: 2,
      cardWidth: 90,
      cardHeight: 85,
      marginX: 10,
      marginY: 15,
    },
  };

  let conf = layoutConf[cardsPerPage];
  if (!conf) conf = layoutConf[4];

  // Variables para posicionar
  let cardIndex = 0;

  while (cardIndex < cards.length) {
    if (cardIndex > 0) doc.addPage();

    // Dibujar cartones en esta página
    for (let r = 0; r < conf.rows; r++) {
      for (let c = 0; c < conf.cols; c++) {
        if (cardIndex >= cards.length) break;

        const x = conf.marginX + c * (conf.cardWidth + 10);
        const y = conf.marginY + r * (conf.cardHeight + 10);

        drawCard(doc, cards[cardIndex], x, y, conf.cardWidth, conf.cardHeight);
        cardIndex++;
      }
    }
  }

  doc.save("bingo_cards.pdf");
}

function drawCard(doc, card, startX, startY, width, height) {
  const letters = card.letters;
  const grid = card.grid;

  const cols = 5;
  const rows = 6; // 1 para letras + 5 para números

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  // Dibujar el borde exterior del cartón
  doc.setLineWidth(0.5);
  doc.rect(startX, startY, width, height);

  // Dibujar ID
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${card.id}`, startX, startY - 2);

  // Opciones de fuente para letras BINGO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);

  // Dibujar letras B I N G O
  for (let c = 0; c < cols; c++) {
    const cx = startX + c * cellWidth;
    const cy = startY;

    // Casilla letra
    doc.setFillColor(220, 220, 220); // Gris claro
    doc.rect(cx, cy, cellWidth, cellHeight, "DF"); // Draw & Fill

    // Texto letra
    const letter = letters[c];
    const textWidth =
      (doc.getStringUnitWidth(letter) * doc.getFontSize()) /
      doc.internal.scaleFactor;
    doc.text(letter, cx + (cellWidth - textWidth) / 2, cy + cellHeight / 1.5);
  }

  // Opciones de fuente para números
  doc.setFontSize(18);

  // Dibujar cuadrícula y números
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];

      const cx = startX + c * cellWidth;
      const cy = startY + (r + 1) * cellHeight; // +1 por la fila de letras

      // Dibujar caja
      doc.rect(cx, cy, cellWidth, cellHeight);

      // Valor (número o FREE)
      if (cell.isFree) {
        doc.setFontSize(10);
        const text = "FREE";
        const textWidth =
          (doc.getStringUnitWidth(text) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        doc.text(text, cx + (cellWidth - textWidth) / 2, cy + cellHeight / 1.5);
        doc.setFontSize(18); // Reset
      } else {
        const text = String(cell.value);
        const textWidth =
          (doc.getStringUnitWidth(text) * doc.getFontSize()) /
          doc.internal.scaleFactor;
        doc.text(text, cx + (cellWidth - textWidth) / 2, cy + cellHeight / 1.5);
      }
    }
  }
}
