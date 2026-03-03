import { jsPDF } from "jspdf";
import { generateBatch } from "../../bingo/domain/bingo-logic";

/**
 * PDF Infrastructure Service
 * Handles the generation of the PDF document using jsPDF.
 */
export function exportToPDF(quantity, cardsPerPage, paperSize) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: paperSize.unit,
    format: [paperSize.width, paperSize.height],
  });

  const cards = generateBatch(quantity);

  // Layout logic based on paper dimensions
  const layouts = {
    4: { rows: 2, cols: 2 },
    6: { rows: 3, cols: 2 },
  };

  const layout = layouts[cardsPerPage] || layouts[4];

  // Calculate relative sizes to fit any paper
  // We leave some margin (10mm)
  const marginX = 10;
  const marginY = 15;
  const availableWidth = paperSize.width - marginX * 2;
  const availableHeight = paperSize.height - marginY * 2;

  // Spacing between cards
  const gutter = 10;

  const cardWidth = (availableWidth - gutter * (layout.cols - 1)) / layout.cols;
  const cardHeight =
    (availableHeight - gutter * (layout.rows - 1)) / layout.rows;

  let currentCard = 0;

  while (currentCard < cards.length) {
    if (currentCard > 0) doc.addPage();

    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (currentCard >= cards.length) break;

        const x = marginX + c * (cardWidth + gutter);
        const y = marginY + r * (cardHeight + gutter);

        drawSingleCard(doc, cards[currentCard], x, y, cardWidth, cardHeight);
        currentCard++;
      }
    }
  }

  doc.save(`bingo_${paperSize.id.toLowerCase()}.pdf`);
}

function drawSingleCard(doc, card, x, y, width, height) {
  const cols = 5;
  const rows = 6; // 1 header + 5 numbers
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height);

  // ID
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`ID: ${card.id}`, x, y - 2);

  // Header BINGO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(width / 6); // Responsive font size

  for (let c = 0; c < 5; c++) {
    const cx = x + c * cellWidth;
    doc.setFillColor(230, 230, 230);
    doc.rect(cx, y, cellWidth, cellHeight, "DF");

    const letter = card.letters[c];
    const textW = doc.getTextWidth(letter);
    doc.text(letter, cx + (cellWidth - textW) / 2, y + cellHeight * 0.7);
  }

  // Grid & Numbers
  doc.setFontSize(width / 6.5);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cx = x + c * cellWidth;
      const cy = y + (r + 1) * cellHeight;
      doc.rect(cx, cy, cellWidth, cellHeight);

      const cell = card.grid[r][c];
      if (cell.isFree) {
        doc.setFontSize(width / 12);
        const text = "FREE";
        const textW = doc.getTextWidth(text);
        doc.text(text, cx + (cellWidth - textW) / 2, cy + cellHeight * 0.65);
        doc.setFontSize(width / 6.5);
      } else {
        const text = String(cell.value);
        const textW = doc.getTextWidth(text);
        doc.text(text, cx + (cellWidth - textW) / 2, cy + cellHeight * 0.7);
      }
    }
  }
}
