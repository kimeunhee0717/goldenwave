// ============================================================================
// 오목 AI — Clean Minimax + Alpha-Beta + Make/Unmake
// ============================================================================
type Stone = 'black' | 'white' | null;
type Pos = { row: number; col: number };
const N = 15;
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];
const B: Stone[][] = [];
for (let i = 0; i < N; i++) B.push(new Array<Stone>(N).fill(null));

function loadBoard(src: Stone[][]) { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) B[r][c] = src[r][c]; }
function ok(r: number, c: number) { return r >= 0 && r < N && c >= 0 && c < N; }

function checkWin(r: number, c: number, s: Stone): boolean {
  if (!s) return false;
  for (const [dr, dc] of DIRS) {
    let cnt = 1;
    for (const d of [1, -1]) { let nr = r + dr * d, nc = c + dc * d; while (ok(nr, nc) && B[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; } }
    if (s === 'white' ? cnt >= 5 : cnt === 5) return true;
  }
  return false;
}

function countLine(r: number, c: number, dr: number, dc: number, s: 'black' | 'white'): [number, number] {
  let cnt = 1, op = 0;
  for (const d of [1, -1]) {
    let nr = r + dr * d, nc = c + dc * d;
    while (ok(nr, nc) && B[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; }
    if (ok(nr, nc) && B[nr][nc] === null) op++;
  }
  return [cnt, op];
}

function isOpenThree(r: number, c: number, dr: number, dc: number, s: Stone): boolean {
  if (!s) return false;
  const stones: [number, number][] = [[r, c]];
  for (const d of [1, -1]) { let nr = r + dr * d, nc = c + dc * d; while (ok(nr, nc) && B[nr][nc] === s) { stones.push([nr, nc]); nr += dr * d; nc += dc * d; } }
  if (stones.length !== 3) return false;
  stones.sort((a, b) => (a[0] - b[0]) * dr + (a[1] - b[1]) * dc);
  const [fr, fc] = stones[0], [lr, lc] = stones[2];
  return ok(fr - dr, fc - dc) && B[fr - dr][fc - dc] === null && ok(lr + dr, lc + dc) && B[lr + dr][lc + dc] === null;
}

function canPlace(r: number, c: number, s: 'black' | 'white'): boolean {
  if (B[r][c] !== null) return false;
  if (s === 'white') return true;
  B[r][c] = s;
  let valid = true;
  for (const [dr, dc] of DIRS) {
    let cnt = 1;
    for (const d of [1, -1]) { let nr = r + dr * d, nc = c + dc * d; while (ok(nr, nc) && B[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; } }
    if (cnt > 5) { valid = false; break; }
  }
  if (valid) { let ot = 0; for (const [dr, dc] of DIRS) if (isOpenThree(r, c, dr, dc, s)) ot++; if (ot >= 2) valid = false; }
  if (valid) { let fc = 0; for (const [dr, dc] of DIRS) { if (countLine(r, c, dr, dc, s)[0] === 4) fc++; } if (fc >= 2) valid = false; }
  B[r][c] = null;
  return valid;
}

// ── 패턴 점수 ──
function pScore(cnt: number, op: number): number {
  if (cnt >= 5) return 100000;
  if (cnt === 4) return op === 2 ? 50000 : op === 1 ? 10000 : 0;
  if (cnt === 3) return op === 2 ? 5000 : op === 1 ? 500 : 0;
  if (cnt === 2) return op === 2 ? 200 : op === 1 ? 20 : 0;
  if (cnt === 1) return op === 2 ? 5 : 0;
  return 0;
}

// ── 보드 전체 평가 (my 관점) ──
function evaluate(my: 'black' | 'white', opp: 'black' | 'white'): number {
  let ms = 0, os = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const s = B[r][c]; if (!s) continue;
    for (const [dr, dc] of DIRS) {
      if (ok(r - dr, c - dc) && B[r - dr][c - dc] === s) continue;
      let cnt = 0, er = r, ec = c;
      while (ok(er, ec) && B[er][ec] === s) { cnt++; er += dr; ec += dc; }
      let op = 0;
      if (ok(er, ec) && B[er][ec] === null) op++;
      if (ok(r - dr, c - dc) && B[r - dr][c - dc] === null) op++;
      const v = pScore(cnt, op);
      if (s === my) ms += v; else os += v;
    }
  }
  return ms - os;
}

// ── 한 수의 빠른 점수 (정렬용) ──
function moveScore(r: number, c: number, my: 'black' | 'white', opp: 'black' | 'white'): number {
  let atk = 0;
  B[r][c] = my;
  if (checkWin(r, c, my)) { B[r][c] = null; return 10000000; }
  for (const [dr, dc] of DIRS) { atk += pScore(...countLine(r, c, dr, dc, my)); }
  B[r][c] = null;
  let def = 0;
  B[r][c] = opp;
  if (checkWin(r, c, opp)) { B[r][c] = null; return 5000000; }
  for (const [dr, dc] of DIRS) { def += pScore(...countLine(r, c, dr, dc, opp)); }
  B[r][c] = null;
  return atk + def * 0.9 + (14 - Math.abs(r - 7) - Math.abs(c - 7)) * 8;
}

// ── 후보 생성 ──
function getCands(radius: number): Pos[] {
  const set = new Set<number>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (B[r][c] !== null) {
      for (let dr = -radius; dr <= radius; dr++) for (let dc = -radius; dc <= radius; dc++) {
        const nr = r + dr, nc = c + dc;
        if (ok(nr, nc) && B[nr][nc] === null) set.add(nr * N + nc);
      }
    }
  }
  if (set.size === 0) return [{ row: 7, col: 7 }];
  return Array.from(set).map(v => ({ row: Math.floor(v / N), col: v % N }));
}

// ── 미니맥스 ──
let deadline = 0, stopped = false;

function minimax(depth: number, a: number, b: number, isMax: boolean, my: 'black' | 'white', opp: 'black' | 'white'): number {
  if (Date.now() > deadline) { stopped = true; return 0; }
  if (depth <= 0) return evaluate(my, opp);

  const stone = isMax ? my : opp;
  const cands = getCands(2)
    .filter(s => stone !== 'black' || canPlace(s.row, s.col, 'black'))
    .map(s => ({ ...s, q: moveScore(s.row, s.col, my, opp) }))
    .sort((x, y) => y.q - x.q)
    .slice(0, 12);

  if (cands.length === 0) return evaluate(my, opp);

  // 깊은 레벨에서는 분기 축소 (성능 확보 → 더 깊이 탐색)
  const maxBranch = depth >= 6 ? 8 : depth >= 4 ? 10 : 12;
  if (cands.length > maxBranch) cands.length = maxBranch;

  if (isMax) {
    let best = -Infinity;
    for (const s of cands) {
      B[s.row][s.col] = stone;
      if (checkWin(s.row, s.col, stone)) { B[s.row][s.col] = null; return 9999999; }
      const v = minimax(depth - 1, a, b, false, my, opp);
      B[s.row][s.col] = null;
      if (stopped) return 0;
      if (v > best) best = v;
      if (v > a) a = v;
      if (a >= b) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const s of cands) {
      B[s.row][s.col] = stone;
      if (checkWin(s.row, s.col, stone)) { B[s.row][s.col] = null; return -9999999; }
      const v = minimax(depth - 1, a, b, true, my, opp);
      B[s.row][s.col] = null;
      if (stopped) return 0;
      if (v < best) best = v;
      if (v < b) b = v;
      if (a >= b) break;
    }
    return best;
  }
}

// ── AI ──
function getMove(board: Stone[][], difficulty: number, myStone: 'black' | 'white'): Pos | null {
  loadBoard(board);
  const opp: 'black' | 'white' = myStone === 'black' ? 'white' : 'black';
  if (!board.some(r => r.some(c => c !== null))) return { row: 7, col: 7 };

  const spots = getCands(2);

  // 즉시 승리
  for (const s of spots) {
    if (myStone === 'black' && !canPlace(s.row, s.col, 'black')) continue;
    B[s.row][s.col] = myStone; const w = checkWin(s.row, s.col, myStone); B[s.row][s.col] = null;
    if (w) return s;
  }
  // 즉시 차단
  for (const s of spots) {
    B[s.row][s.col] = opp; const w = checkWin(s.row, s.col, opp); B[s.row][s.col] = null;
    if (w) { if (myStone === 'black' && !canPlace(s.row, s.col, 'black')) continue; return s; }
  }

  // 초급: moveScore만
  if (difficulty === 1) {
    let best = -Infinity, bm = spots[0];
    for (const s of spots) {
      if (myStone === 'black' && !canPlace(s.row, s.col, 'black')) continue;
      const sc = moveScore(s.row, s.col, myStone, opp);
      if (sc > best) { best = sc; bm = s; }
    }
    return bm;
  }

  // 후보 정렬 (루트에서 한 번만)
  const scored = spots
    .filter(s => myStone !== 'black' || canPlace(s.row, s.col, 'black'))
    .map(s => ({ ...s, q: moveScore(s.row, s.col, myStone, opp) }))
    .sort((x, y) => y.q - x.q);

  const topN = scored.slice(0, 15);
  if (topN.length === 0) return spots[0];

  const t0 = Date.now();
  // 중급: depth 4 고정, 고급: 반복 심화 depth 2→4→6→8→10 (3초 제한)
  const TL = difficulty === 2 ? 1000 : 3000;
  const maxSearchDepth = difficulty === 2 ? 4 : 10;

  let bestMove = topN[0];

  for (let d = 2; d <= maxSearchDepth; d += 2) {
    if (Date.now() - t0 > TL - 300) break; // 마감 300ms 전에 새 반복 시작 안 함

    stopped = false;
    deadline = t0 + TL;

    // 이전 최선수를 맨 앞으로 (알파-베타 가지치기 효율 극대화)
    const idx = topN.findIndex(s => s.row === bestMove.row && s.col === bestMove.col);
    if (idx > 0) { const tmp = topN[0]; topN[0] = topN[idx]; topN[idx] = tmp; }

    let curBest = topN[0], curBestSc = -Infinity;

    for (const s of topN) {
      if (Date.now() > deadline) break;
      B[s.row][s.col] = myStone;
      if (checkWin(s.row, s.col, myStone)) { B[s.row][s.col] = null; return s; }
      const sc = minimax(d - 1, -Infinity, Infinity, false, myStone, opp);
      B[s.row][s.col] = null;
      if (stopped) break;
      if (sc > curBestSc) { curBestSc = sc; curBest = s; }
    }

    if (!stopped) bestMove = curBest;
  }

  return bestMove;
}

self.onmessage = (e: MessageEvent) => {
  const { board, difficulty, myStone } = e.data;
  self.postMessage({ move: getMove(board, difficulty, myStone) });
};
