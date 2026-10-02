import type { WorldCollider } from './collision';

export interface WorldColliderIndex {
  cellSize: number;
  columns: number;
  rows: number;
  cells: WorldCollider[][];
  all: readonly WorldCollider[];
}

const clampCell = (value: number, max: number) => Math.max(0, Math.min(max - 1, value));

export const buildWorldColliderIndex = (
  colliders: readonly WorldCollider[],
  worldWidth: number,
  worldHeight: number,
  cellSize = 160,
  queryPadding = 112
): WorldColliderIndex => {
  const columns = Math.ceil(worldWidth / cellSize);
  const rows = Math.ceil(worldHeight / cellSize);
  const cells = Array.from({ length: columns * rows }, () => [] as WorldCollider[]);

  for (const collider of colliders) {
    const minCol = clampCell(Math.floor((collider.minX - queryPadding) / cellSize), columns);
    const maxCol = clampCell(Math.floor((collider.maxX + queryPadding) / cellSize), columns);
    const minRow = clampCell(Math.floor((collider.minY - queryPadding) / cellSize), rows);
    const maxRow = clampCell(Math.floor((collider.maxY + queryPadding) / cellSize), rows);
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) cells[row * columns + col].push(collider);
    }
  }
  return { cellSize, columns, rows, cells, all: colliders };
};
export const queryWorldColliderIndex = (
  index: WorldColliderIndex,
  x: number,
  y: number
): readonly WorldCollider[] => {
  const col = clampCell(Math.floor(x / index.cellSize), index.columns);
  const row = clampCell(Math.floor(y / index.cellSize), index.rows);
  return index.cells[row * index.columns + col] ?? index.all;
};
