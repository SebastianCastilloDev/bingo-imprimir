export const PAPER_SIZES = {
  A4: {
    id: "A4",
    name: "A4",
    width: 210,
    height: 297,
    unit: "mm",
  },
  LETTER: {
    id: "LETTER",
    name: "Carta",
    width: 215.9,
    height: 279.4,
    unit: "mm",
  },
  LEGAL: {
    id: "LEGAL",
    name: "Oficio",
    width: 215.9,
    height: 330,
    unit: "mm",
  },
};

export function getPaperSize(id) {
  return PAPER_SIZES[id] || PAPER_SIZES.A4;
}
