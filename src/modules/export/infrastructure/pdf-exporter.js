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
  const gutterX = 10;
  const gutterY = 20; // Aumentado para facilitar el corte con guillotina

  const cardWidth =
    (availableWidth - gutterX * (layout.cols - 1)) / layout.cols;
  const cardHeight =
    (availableHeight - gutterY * (layout.rows - 1)) / layout.rows;

  let currentCard = 0;

  while (currentCard < cards.length) {
    if (currentCard > 0) doc.addPage();

    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (currentCard >= cards.length) break;

        const x = marginX + c * (cardWidth + gutterX);
        const y = marginY + r * (cardHeight + gutterY);

        drawSingleCard(
          doc,
          cards[currentCard],
          x,
          y,
          cardWidth,
          cardHeight,
          currentCard + 1,
        );
        currentCard++;
      }
    }
  }

  doc.save(`bingo_${paperSize.id.toLowerCase()}.pdf`);
}

function drawSingleCard(doc, card, x, y, width, height, cardNumber) {
  const headerHeight = height * 0.18; // Space for images & text
  const gridHeight = height - headerHeight;
  const cols = 5;
  const rows = 6; // 1 bingo header + 5 numbers
  const cellWidth = width / cols;
  const cellHeight = gridHeight / rows;

  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height);

  // Card Number
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const formattedNumber = String(cardNumber).padStart(3, "0");
  doc.text(`Número de cartón: ${formattedNumber}`, x, y - 3);

  // --- HEADER SECTION ---
  const imageSize = headerHeight * 0.7;
  const paddingY = (headerHeight - imageSize) / 2;
  const paddingX = 5;

  // Left Image: logo-silvia.jpeg
  try {
    doc.addImage(
      "/logo-silvia.jpeg",
      "JPEG",
      x + paddingX,
      y + paddingY,
      imageSize,
      imageSize,
    );
  } catch (e) {
    console.error("Could not load logo-silvia.jpeg", e);
  }

  // Right Image: qr.png
  try {
    doc.addImage(
      "/qr.png",
      "PNG",
      x + width - imageSize - paddingX,
      y + paddingY,
      imageSize,
      imageSize,
    );
  } catch (e) {
    console.error("Could not load qr.png", e);
  }

  // Center Text: BINGO SOLIDARIO
  doc.setFont("helvetica", "bold");
  doc.setFontSize(headerHeight * 0.85); // Casi el doble de 0.45, muy grande e impactante
  const title = "BINGO SOLIDARIO";
  const titleW = doc.getTextWidth(title);
  doc.text(
    title,
    x + (width - titleW) / 2,
    y + headerHeight / 2 + headerHeight * 0.22, // Reajuste de centrado para fuente gigante
  );

  // --- GRID SECTION ---
  const gridStartY = y + headerHeight;

  // Header BINGO Letters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(cellWidth * 0.85); // Aumentado significativamente

  for (let c = 0; c < 5; c++) {
    const cx = x + c * cellWidth;
    doc.setFillColor(230, 230, 230);
    doc.rect(cx, gridStartY, cellWidth, cellHeight, "DF");

    const letter = card.letters[c];
    const textW = doc.getTextWidth(letter);
    doc.text(
      letter,
      cx + (cellWidth - textW) / 2,
      gridStartY + cellHeight * 0.82, // Ajuste para centrar letra gigante
    );
  }

  // Numbers Grid
  doc.setFontSize(cellWidth * 0.85); // Aumentado significativamente
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const cx = x + c * cellWidth;
      const cy = gridStartY + (r + 1) * cellHeight;
      doc.rect(cx, cy, cellWidth, cellHeight);

      const cell = card.grid[r][c];
      if (cell.isFree) {
        doc.setFontSize(cellWidth * 0.45); // Aumentado significativamente
        const text = "FREE";
        const textW = doc.getTextWidth(text);
        doc.text(text, cx + (cellWidth - textW) / 2, cy + cellHeight * 0.7);
        doc.setFontSize(cellWidth * 0.85);
      } else {
        const text = String(cell.value);
        const textW = doc.getTextWidth(text);
        doc.text(text, cx + (cellWidth - textW) / 2, cy + cellHeight * 0.82); // Ajuste para centrar número gigante
      }
    }
  }
}
