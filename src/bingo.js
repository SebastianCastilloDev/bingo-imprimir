/**
 * Bingo Card Generator - Game Logic
 *
 * Standard BINGO rules:
 * B column: numbers 1–15   (col 0)
 * I column: numbers 16–30  (col 1)
 * N column: numbers 31–45  (col 2) — center cell (row 2) is FREE
 * G column: numbers 46–60  (col 3)
 * O column: numbers 61–75  (col 4)
 *
 * Each column has 5 rows of numbers randomly selected from its range.
 * Card is 5 columns × 5 rows = 25 cells, center is FREE.
 */

const COLUMNS = [
  { letter: "B", min: 1, max: 15 },
  { letter: "I", min: 16, max: 30 },
  { letter: "N", min: 31, max: 45 },
  { letter: "G", min: 46, max: 60 },
  { letter: "O", min: 61, max: 75 },
];

const FREE_ROW = 2; // 0-indexed middle row
const FREE_COL = 2; // 0-indexed middle column (N column)
const ROWS = 5;

/**
 * Pick `count` unique random integers in [min, max] inclusive.
 */
function pickUnique(min, max, count) {
  const pool = [];
  for (let i = min; i <= max; i++) pool.push(i);
  // Fisher-Yates shuffle then slice
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

/**
 * Generate a single BINGO card.
 * Returns a 2D array [row][col] where each cell is { value, isFree }.
 */
export function generateCard() {
  // Build column data first
  const colData = COLUMNS.map(({ min, max }) => pickUnique(min, max, ROWS));

  // Build grid [row][col]
  const grid = [];
  for (let row = 0; row < ROWS; row++) {
    const rowData = [];
    for (let col = 0; col < COLUMNS.length; col++) {
      const isFree = row === FREE_ROW && col === FREE_COL;
      rowData.push({
        value: isFree ? null : colData[col][row],
        isFree,
      });
    }
    grid.push(rowData);
  }

  return {
    grid,
    letters: COLUMNS.map((c) => c.letter),
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
  };
}

/**
 * Generate N unique bingo cards.
 */
export function generateCards(count) {
  return Array.from({ length: count }, () => generateCard());
}
