/**
 * Bingo Domain Service
 * Handles the logic for creating valid Bingo cards.
 */

const COLUMNS_CONFIG = [
  { letter: "B", min: 1, max: 15 },
  { letter: "I", min: 16, max: 30 },
  { letter: "N", min: 31, max: 45 },
  { letter: "G", min: 46, max: 60 },
  { letter: "O", min: 61, max: 75 },
];

const ROWS = 5;
const COLS = 5;
const FREE_CELL = { row: 2, col: 2 };

function pickUnique(min, max, count) {
  const pool = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

export function generateCard() {
  const colData = COLUMNS_CONFIG.map(({ min, max }) =>
    pickUnique(min, max, ROWS),
  );
  const grid = Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => {
      const isFree = row === FREE_CELL.row && col === FREE_CELL.col;
      return {
        value: isFree ? null : colData[col][row],
        isFree,
      };
    }),
  );

  return {
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    grid,
    letters: COLUMNS_CONFIG.map((c) => c.letter),
  };
}

export function generateBatch(quantity) {
  return Array.from({ length: quantity }, () => generateCard());
}
