// ============================================================================
// 오목 AI Worker — 위치 기반 평가 + 미니맥스 depth 4 + 간결 VCF
// ============================================================================

type Stone = 'black' | 'white' | null;
type Difficulty = 1 | 2 | 3;
type Pos = { row: number; col: number };

const N = 15;
const DIRS: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

// ─── 금수 ─────────────────────────────────────────────────────────
function checkWin(b: Stone[][], r: number, c: number, s: Stone): boolean {
  if (!s) return false;
  for (const [dr, dc] of DIRS) {
    let cnt = 1;
    for (const d of [1, -1]) {
      let nr = r + dr * d, nc = c + dc * d;
      while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; }
    }
    if (cnt === 5) return true;
  }
  return false;
}

function canPlace(b: Stone[][], r: number, c: number, s: 'black' | 'white'): boolean {
  if (b[r][c] !== null) return false;
  if (s === 'white') return true;
  const t = b.map(x => [...x]); t[r][c] = s;
  // 장목
  for (const [dr, dc] of DIRS) {
    let cnt = 1;
    for (const d of [1, -1]) { let nr = r + dr * d, nc = c + dc * d; while (nr >= 0 && nr < N && nc >= 0 && nc < N && t[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; } }
    if (cnt > 5) return false;
  }
  // 쌍삼
  let ot = 0;
  for (const [dr, dc] of DIRS) { if (isOpenThree(t, r, c, dr, dc, s)) ot++; }
  if (ot >= 2) return false;
  // 쌍사
  let fc = 0;
  for (const [dr, dc] of DIRS) { if (countLine(t, r, c, dr, dc, s).cnt === 4) fc++; }
  if (fc >= 2) return false;
  return true;
}

function isOpenThree(b: Stone[][], r: number, c: number, dr: number, dc: number, s: Stone): boolean {
  if (!s) return false;
  const stones: { r: number; c: number }[] = [{ r, c }];
  for (const d of [1, -1]) { let nr = r + dr * d, nc = c + dc * d; while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === s) { stones.push({ r: nr, c: nc }); nr += dr * d; nc += dc * d; } }
  if (stones.length !== 3) return false;
  stones.sort((a, b2) => (a.r - b2.r) * dr + (a.c - b2.c) * dc);
  const f = stones[0], l = stones[2];
  const br2 = f.r - dr, bc = f.c - dc, ar = l.r + dr, ac = l.c + dc;
  return br2 >= 0 && br2 < N && bc >= 0 && bc < N && b[br2][bc] === null &&
         ar >= 0 && ar < N && ac >= 0 && ac < N && b[ar][ac] === null;
}

// ─── 라인 분석 (빠른 버전) ────────────────────────────────────────
function countLine(b: Stone[][], r: number, c: number, dr: number, dc: number, s: 'black' | 'white'): { cnt: number; open: number } {
  let cnt = 1, open = 0;
  for (const d of [1, -1]) {
    let nr = r + dr * d, nc = c + dc * d;
    while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === s) { cnt++; nr += dr * d; nc += dc * d; }
    if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === null) open++;
  }
  return { cnt, open };
}

// 갭 패턴 (X_XX, XX_X 등) — 한 방향에서 빈칸 1개 건너 같은 돌 연결
function countGap(b: Stone[][], r: number, c: number, dr: number, dc: number, s: 'black' | 'white'): number {
  let best = 0;
  for (const d of [1, -1]) {
    let nr = r + dr * d, nc = c + dc * d;
    // 연속 돌 끝까지
    let consecutive = 1;
    while (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === s) { consecutive++; nr += dr * d; nc += dc * d; }
    // 빈칸 1개?
    if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === null) {
      const gnr = nr + dr * d, gnc = nc + dc * d;
      if (gnr >= 0 && gnr < N && gnc >= 0 && gnc < N && b[gnr][gnc] === s) {
        let extra = 0;
        let er = gnr, ec = gnc;
        while (er >= 0 && er < N && ec >= 0 && ec < N && b[er][ec] === s) { extra++; er += dr * d; ec += dc * d; }
        best = Math.max(best, consecutive + extra);
      }
    }
  }
  return best;
}

// ─── 위치 기반 점수 (한 수의 공격/방어 가치) ──────────────────────
function scoreMoveFor(b: Stone[][], r: number, c: number, s: 'black' | 'white'): number {
  let sc = 0;
  for (const [dr, dc] of DIRS) {
    const { cnt, open } = countLine(b, r, c, dr, dc, s);
    if (cnt >= 5) return 1000000;
    if (cnt === 4) { sc += open === 2 ? 100000 : open === 1 ? 12000 : 0; }
    else if (cnt === 3) { sc += open === 2 ? 8000 : open === 1 ? 800 : 0; }
    else if (cnt === 2) { sc += open === 2 ? 400 : open === 1 ? 50 : 0; }
    else if (cnt === 1) { sc += open === 2 ? 20 : open === 1 ? 5 : 0; }

    // 갭 패턴 보너스
    const gap = countGap(b, r, c, dr, dc, s);
    if (gap >= 4) sc += 9000;
    else if (gap === 3 && open >= 1) sc += 1000;
  }
  return sc;
}

// 한 위치에 돌 놓았을 때 공격+방어 통합 점수
function evalMove(board: Stone[][], r: number, c: number, my: 'black' | 'white', opp: 'black' | 'white'): number {
  const b1 = board.map(x => [...x]); b1[r][c] = my;
  const atk = scoreMoveFor(b1, r, c, my);
  const b2 = board.map(x => [...x]); b2[r][c] = opp;
  const def = scoreMoveFor(b2, r, c, opp);
  const d = Math.abs(r - 7) + Math.abs(c - 7);
  return atk + def * 1.05 + (14 - d) * 3;
}

// ─── 후보 추출 ───────────────────────────────────────────────────
function getCands(b: Stone[][], radius: number): Pos[] {
  const set = new Set<number>();
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (b[r][c] !== null) {
      for (let dr = -radius; dr <= radius; dr++) for (let dc = -radius; dc <= radius; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && b[nr][nc] === null) set.add(nr * N + nc);
      }
    }
  }
  if (set.size === 0) return [{ row: 7, col: 7 }];
  return Array.from(set).map(v => ({ row: Math.floor(v / N), col: v % N }));
}

// ─── VCF (간결 버전, depth 4) ────────────────────────────────────
function vcf(board: Stone[][], stone: 'black' | 'white', depth: number): Pos | null {
  if (depth <= 0) return null;
  const opp: 'black' | 'white' = stone === 'black' ? 'white' : 'black';
  const cands = getCands(board, 2);

  for (const s of cands) {
    if (stone === 'black' && !canPlace(board, s.row, s.col, 'black')) continue;

    const b = board.map(x => [...x]);
    b[s.row][s.col] = stone;

    if (checkWin(b, s.row, s.col, stone)) return s;

    // 4를 만드는 수?
    let fourDir: [number, number] | null = null;
    for (const [dr, dc] of DIRS) {
      if (countLine(b, s.row, s.col, dr, dc, stone).cnt === 4) { fourDir = [dr, dc]; break; }
    }
    if (!fourDir) continue;

    // 상대 방어 위치 (4의 양끝 빈칸)
    const blocks: Pos[] = [];
    const [dr, dc] = fourDir;
    let r = s.row, c = s.col;
    while (r + dr >= 0 && r + dr < N && c + dc >= 0 && c + dc < N && b[r + dr][c + dc] === stone) { r += dr; c += dc; }
    if (r + dr >= 0 && r + dr < N && c + dc >= 0 && c + dc < N && b[r + dr][c + dc] === null) blocks.push({ row: r + dr, col: c + dc });
    r = s.row; c = s.col;
    while (r - dr >= 0 && r - dr < N && c - dc >= 0 && c - dc < N && b[r - dr][c - dc] === stone) { r -= dr; c -= dc; }
    if (r - dr >= 0 && r - dr < N && c - dc >= 0 && c - dc < N && b[r - dr][c - dc] === null) blocks.push({ row: r - dr, col: c - dc });

    if (blocks.length === 0) continue;

    // 모든 방어에 대해 재귀 VCF 가능?
    let allWin = true;
    for (const bk of blocks) {
      const b2 = b.map(x => [...x]);
      b2[bk.row][bk.col] = opp;
      if (!vcf(b2, stone, depth - 1)) { allWin = false; break; }
    }
    if (allWin) return s;
  }
  return null;
}

// ─── 미니맥스 (위치 기반 평가, 빠름) ─────────────────────────────
function minimaxEval(
  board: Stone[][], depth: number, isMax: boolean,
  alpha: number, beta: number,
  my: 'black' | 'white', opp: 'black' | 'white'
): number {
  const stone = isMax ? my : opp;
  const cands = getCands(board, 1);

  // 후보 빠른 정렬
  const scored = cands
    .filter(s => stone !== 'black' || canPlace(board, s.row, s.col, 'black'))
    .map(s => {
      const b = board.map(x => [...x]); b[s.row][s.col] = stone;
      return { ...s, q: scoreMoveFor(b, s.row, s.col, stone) };
    })
    .sort((a, b) => b.q - a.q)
    .slice(0, depth >= 3 ? 8 : 6); // 상위 depth에선 더 넓게

  if (scored.length === 0) return 0;

  if (depth <= 1) {
    // 리프: 최고 수의 공격-방어 차이
    const best = scored[0];
    const b = board.map(x => [...x]); b[best.row][best.col] = stone;
    const atkVal = scoreMoveFor(b, best.row, best.col, my);
    const b2 = board.map(x => [...x]); b2[best.row][best.col] = opp;
    const defVal = scoreMoveFor(b2, best.row, best.col, opp);
    return isMax ? atkVal - defVal * 1.1 : defVal * 1.1 - atkVal;
  }

  if (isMax) {
    let best = -Infinity;
    for (const s of scored) {
      const b = board.map(x => [...x]); b[s.row][s.col] = stone;
      if (checkWin(b, s.row, s.col, stone)) return 9999999;
      const val = minimaxEval(b, depth - 1, false, alpha, beta, my, opp);
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const s of scored) {
      const b = board.map(x => [...x]); b[s.row][s.col] = stone;
      if (checkWin(b, s.row, s.col, stone)) return -9999999;
      const val = minimaxEval(b, depth - 1, true, alpha, beta, my, opp);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

// ─── AI 메인 ─────────────────────────────────────────────────────
function getMove(board: Stone[][], difficulty: Difficulty, myStone: 'black' | 'white'): Pos | null {
  const opp: 'black' | 'white' = myStone === 'black' ? 'white' : 'black';
  const hasStone = board.some(r => r.some(c => c !== null));
  if (!hasStone) return { row: 7, col: 7 };

  if (difficulty === 1) return easyMove(board, myStone, opp);
  if (difficulty === 2) return mediumMove(board, myStone, opp);
  return hardMove(board, myStone, opp);
}

function easyMove(b: Stone[][], my: 'black' | 'white', opp: 'black' | 'white'): Pos {
  const spots = getCands(b, 2);
  for (const s of spots) { const t = b.map(x => [...x]); t[s.row][s.col] = my; if (checkWin(t, s.row, s.col, my)) return s; }
  for (const s of spots) { const t = b.map(x => [...x]); t[s.row][s.col] = opp; if (checkWin(t, s.row, s.col, opp)) return s; }
  return spots[Math.floor(Math.random() * spots.length)];
}

function mediumMove(board: Stone[][], my: 'black' | 'white', opp: 'black' | 'white'): Pos {
  const spots = getCands(board, 2);
  let best = -Infinity, bestMove = spots[0];
  for (const s of spots) {
    if (my === 'black' && !canPlace(board, s.row, s.col, 'black')) continue;
    const sc = evalMove(board, s.row, s.col, my, opp);
    if (sc > best) { best = sc; bestMove = s; }
  }
  return bestMove;
}

function hardMove(board: Stone[][], my: 'black' | 'white', opp: 'black' | 'white'): Pos {
  const spots = getCands(board, 2);

  // 1. 즉시 승리
  for (const s of spots) {
    if (my === 'black' && !canPlace(board, s.row, s.col, 'black')) continue;
    const b = board.map(x => [...x]); b[s.row][s.col] = my;
    if (checkWin(b, s.row, s.col, my)) return s;
  }

  // 2. 즉시 방어
  for (const s of spots) {
    const b = board.map(x => [...x]); b[s.row][s.col] = opp;
    if (checkWin(b, s.row, s.col, opp)) return s;
  }

  // 3. VCF (내 강제 승리 탐색, depth 4)
  const myVcf = vcf(board, my, 4);
  if (myVcf) return myVcf;

  // 4. 상대 VCF 차단 (depth 3)
  const oppVcf = vcf(board, opp, 3);
  if (oppVcf) return oppVcf;

  // 5. 후보 정렬 → 미니맥스 depth 4
  const scored = spots
    .filter(s => my !== 'black' || canPlace(board, s.row, s.col, 'black'))
    .map(s => ({ ...s, q: evalMove(board, s.row, s.col, my, opp) }))
    .sort((a, b) => b.q - a.q);

  const topN = scored.slice(0, Math.min(10, scored.length));
  if (topN.length === 0) return spots[0];

  let bestScore = -Infinity, bestMove = topN[0];
  for (const s of topN) {
    const b = board.map(x => [...x]); b[s.row][s.col] = my;
    const sc = minimaxEval(b, 4, false, -Infinity, Infinity, my, opp);
    if (sc > bestScore) { bestScore = sc; bestMove = s; }
  }
  return bestMove;
}

// ─── Worker 핸들러 ───────────────────────────────────────────────
self.onmessage = (e: MessageEvent) => {
  const { board, difficulty, myStone } = e.data;
  const move = getMove(board, difficulty, myStone);
  self.postMessage({ move });
};
