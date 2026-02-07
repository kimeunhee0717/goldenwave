// ============================================================================
// 바둑 AI Worker — MCTS + 고속 시뮬레이션 (flat Int8Array)
// 13×13, 중국식 계가, 덤 6.5
// ============================================================================

const N = 13;
const KOMI = 6.5;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

type Board = number[][];
type Point = [number, number];

const DR = [0, 0, 1, -1];
const DC = [1, -1, 0, 0];

function cloneBoard(b: Board): Board { return b.map(r => r.slice()); }
function opp(c: number): number { return 3 - c; }
function inB(r: number, c: number): boolean { return r >= 0 && r < N && c >= 0 && c < N; }

// ====================== 2D 보드 연산 (MCTS 트리용) ======================

function getGroup(board: Board, r: number, c: number): { stones: Point[]; liberties: Set<string> } {
  const color = board[r][c];
  if (color === EMPTY) return { stones: [], liberties: new Set() };
  const visited = new Set<string>();
  const stones: Point[] = [];
  const liberties = new Set<string>();
  const stack: Point[] = [[r, c]];
  while (stack.length > 0) {
    const [cr, cc] = stack.pop()!;
    const key = `${cr},${cc}`;
    if (visited.has(key)) continue;
    visited.add(key);
    stones.push([cr, cc]);
    for (let d = 0; d < 4; d++) {
      const nr = cr + DR[d], nc = cc + DC[d];
      if (!inB(nr, nc)) continue;
      if (board[nr][nc] === EMPTY) liberties.add(`${nr},${nc}`);
      else if (board[nr][nc] === color && !visited.has(`${nr},${nc}`)) stack.push([nr, nc]);
    }
  }
  return { stones, liberties };
}

function placeStone2D(board: Board, r: number, c: number, color: number): { captured: Point[]; valid: boolean } {
  if (!inB(r, c) || board[r][c] !== EMPTY) return { captured: [], valid: false };
  board[r][c] = color;
  const o = opp(color);
  const captured: Point[] = [];
  for (let d = 0; d < 4; d++) {
    const nr = r + DR[d], nc = c + DC[d];
    if (inB(nr, nc) && board[nr][nc] === o) {
      const g = getGroup(board, nr, nc);
      if (g.liberties.size === 0) {
        for (const [sr, sc] of g.stones) { board[sr][sc] = EMPTY; captured.push([sr, sc]); }
      }
    }
  }
  const my = getGroup(board, r, c);
  if (my.liberties.size === 0) {
    board[r][c] = EMPTY;
    for (const [sr, sc] of captured) board[sr][sc] = o;
    return { captured: [], valid: false };
  }
  return { captured, valid: true };
}

function boardHash(board: Board): string {
  let h = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) h += board[r][c];
  return h;
}

function getValidMoves(board: Board, color: number, koHash: string | null): Point[] {
  const moves: Point[] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c] !== EMPTY) continue;
      const tb = cloneBoard(board);
      const res = placeStone2D(tb, r, c, color);
      if (!res.valid) continue;
      if (koHash && boardHash(tb) === koHash) continue;
      moves.push([r, c]);
    }
  }
  return moves;
}

function chineseScore(board: Board): { black: number; white: number } {
  const vis = Array.from({ length: N }, () => new Array(N).fill(false));
  let bs = 0, ws = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (board[r][c] === BLACK) bs++; else if (board[r][c] === WHITE) ws++;
  }
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (board[r][c] !== EMPTY || vis[r][c]) continue;
    const reg: Point[] = []; let tb = false, tw = false;
    const stk: Point[] = [[r, c]];
    while (stk.length > 0) {
      const [cr, cc] = stk.pop()!;
      if (vis[cr][cc]) continue; vis[cr][cc] = true; reg.push([cr, cc]);
      for (let d = 0; d < 4; d++) {
        const nr = cr + DR[d], nc = cc + DC[d];
        if (!inB(nr, nc)) continue;
        if (board[nr][nc] === BLACK) tb = true;
        else if (board[nr][nc] === WHITE) tw = true;
        else if (!vis[nr][nc]) stk.push([nr, nc]);
      }
    }
    if (tb && !tw) bs += reg.length;
    else if (tw && !tb) ws += reg.length;
  }
  return { black: bs, white: ws + KOMI };
}

// ====================== Flat Int8Array 연산 (고속 시뮬레이션용) ======================

function hasLibertyF(sim: Int8Array, pos: number): boolean {
  const color = sim[pos];
  const vis = new Uint8Array(N * N);
  const stk = [pos];
  while (stk.length > 0) {
    const p = stk.pop()!;
    if (vis[p]) continue; vis[p] = 1;
    const r = (p / N) | 0, c = p % N;
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d], nc = c + DC[d];
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        const np = nr * N + nc;
        if (sim[np] === EMPTY) return true;
        if (sim[np] === color && !vis[np]) stk.push(np);
      }
    }
  }
  return false;
}

function removeGroupF(sim: Int8Array, pos: number): number {
  const color = sim[pos];
  const vis = new Uint8Array(N * N);
  const stk = [pos]; let cnt = 0;
  while (stk.length > 0) {
    const p = stk.pop()!;
    if (vis[p]) continue; vis[p] = 1;
    sim[p] = EMPTY; cnt++;
    const r = (p / N) | 0, c = p % N;
    for (let d = 0; d < 4; d++) {
      const nr = r + DR[d], nc = c + DC[d];
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        const np = nr * N + nc;
        if (sim[np] === color && !vis[np]) stk.push(np);
      }
    }
  }
  return cnt;
}

function scoreFlatBlackWin(sim: Int8Array): boolean {
  const vis = new Uint8Array(N * N);
  let bs = 0, ws = 0;
  for (let i = 0; i < N * N; i++) { if (sim[i] === BLACK) bs++; else if (sim[i] === WHITE) ws++; }
  for (let i = 0; i < N * N; i++) {
    if (sim[i] !== EMPTY || vis[i]) continue;
    let sz = 0, tb = false, tw = false;
    const stk = [i];
    while (stk.length > 0) {
      const p = stk.pop()!;
      if (vis[p]) continue; vis[p] = 1; sz++;
      const r = (p / N) | 0, c = p % N;
      for (let d = 0; d < 4; d++) {
        const nr = r + DR[d], nc = c + DC[d];
        if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
          const np = nr * N + nc;
          if (sim[np] === BLACK) tb = true;
          else if (sim[np] === WHITE) tw = true;
          else if (!vis[np]) stk.push(np);
        }
      }
    }
    if (tb && !tw) bs += sz;
    else if (tw && !tb) ws += sz;
  }
  return bs > ws + KOMI;
}

// 고속 랜덤 플레이아웃 — getValidMoves 호출 없이 직접 시도
function fastSimulate(board: Board, startColor: number): number {
  const sim = new Int8Array(N * N);
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      sim[r * N + c] = board[r][c];

  let color = startColor;
  let passes = 0;
  let moves = 0;
  const empties: number[] = [];

  while (passes < 2 && moves < 250) {
    // 빈 셀 수집
    empties.length = 0;
    for (let i = 0; i < N * N; i++) if (sim[i] === EMPTY) empties.push(i);

    if (empties.length === 0) { passes++; color = 3 - color; moves++; continue; }

    let placed = false;
    const o = 3 - color;

    // Fisher-Yates 셔플 후 순차 시도
    for (let t = empties.length - 1; t >= 0; t--) {
      const j = Math.floor(Math.random() * (t + 1));
      const tmp = empties[t]; empties[t] = empties[j]; empties[j] = tmp;

      const pos = empties[t];
      const r = (pos / N) | 0, c = pos % N;

      // 자기 집 메우기 방지: 사방이 모두 자기 돌이면 스킵
      let allOwn = true;
      for (let d = 0; d < 4; d++) {
        const nr = r + DR[d], nc = c + DC[d];
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && sim[nr * N + nc] !== color) {
          allOwn = false; break;
        }
      }
      if (allOwn) continue;

      // 착수
      sim[pos] = color;
      let cap = 0;

      // 상대 돌 따먹기
      for (let d = 0; d < 4; d++) {
        const nr = r + DR[d], nc = c + DC[d];
        if (nr >= 0 && nr < N && nc >= 0 && nc < N && sim[nr * N + nc] === o) {
          if (!hasLibertyF(sim, nr * N + nc)) {
            cap += removeGroupF(sim, nr * N + nc);
          }
        }
      }

      // 자살수 체크
      if (cap === 0 && !hasLibertyF(sim, pos)) {
        sim[pos] = EMPTY;
        continue;
      }

      placed = true; passes = 0;
      break;
    }

    if (!placed) passes++;
    color = 3 - color;
    moves++;
  }

  return scoreFlatBlackWin(sim) ? 1 : 0;
}

// ====================== MCTS ======================

class MCTSNode {
  move: Point | null;
  color: number;
  parent: MCTSNode | null;
  children: MCTSNode[] = [];
  visits = 0;
  wins = 0;
  untriedMoves: Point[];

  constructor(move: Point | null, color: number, parent: MCTSNode | null, untriedMoves: Point[]) {
    this.move = move;
    this.color = color;
    this.parent = parent;
    this.untriedMoves = untriedMoves;
  }

  ucb1(ep: number): number {
    if (this.visits === 0) return Infinity;
    return (this.wins / this.visits) + ep * Math.sqrt(Math.log(this.parent!.visits) / this.visits);
  }

  bestChild(ep: number): MCTSNode {
    let best = this.children[0], bestV = -Infinity;
    for (const ch of this.children) {
      const v = ch.ucb1(ep);
      if (v > bestV) { bestV = v; best = ch; }
    }
    return best;
  }
}

function mctsSearch(board: Board, color: number, koHash: string | null, timeMs: number): Point | null {
  // 첫 수: 즉시 화점 착수
  let stoneCount = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (board[r][c] !== EMPTY) stoneCount++;
  if (stoneCount === 0) return [6, 6];
  if (stoneCount === 1) {
    const stars: Point[] = [[3, 3], [3, 9], [9, 3], [9, 9], [6, 6]];
    for (const sp of stars) if (board[sp[0]][sp[1]] === EMPTY) return sp;
  }

  const validMoves = getValidMoves(board, color, koHash);
  if (validMoves.length === 0) return null;
  if (validMoves.length === 1) return validMoves[0];

  const root = new MCTSNode(null, opp(color), null, [...validMoves]);
  const t0 = Date.now();
  let iters = 0;

  while (true) {
    // 매 반복마다 시간 체크
    if (iters > 0 && iters % 5 === 0 && Date.now() - t0 >= timeMs) break;

    let node = root;
    const simBoard = cloneBoard(board);
    let simColor = color;
    let simKo = koHash;

    // Selection
    while (node.untriedMoves.length === 0 && node.children.length > 0) {
      node = node.bestChild(1.41);
      if (node.move) {
        const ph = boardHash(simBoard);
        placeStone2D(simBoard, node.move[0], node.move[1], simColor);
        simKo = ph;
        simColor = opp(simColor);
      }
    }

    // Expansion (lazy validation)
    if (node.untriedMoves.length > 0) {
      let move: Point | null = null;
      while (node.untriedMoves.length > 0) {
        const idx = Math.floor(Math.random() * node.untriedMoves.length);
        const cand = node.untriedMoves.splice(idx, 1)[0];
        const tb = cloneBoard(simBoard);
        const res = placeStone2D(tb, cand[0], cand[1], simColor);
        if (!res.valid) continue;
        if (simKo && boardHash(tb) === simKo) continue;
        move = cand;
        break;
      }

      if (move) {
        const ph = boardHash(simBoard);
        placeStone2D(simBoard, move[0], move[1], simColor);
        simKo = ph;

        // 자식 노드: 빈 셀 목록만 (lazy — getValidMoves 안 함)
        const childMoves: Point[] = [];
        for (let r = 0; r < N; r++)
          for (let c = 0; c < N; c++)
            if (simBoard[r][c] === EMPTY) childMoves.push([r, c]);

        const child = new MCTSNode(move, simColor, node, childMoves);
        node.children.push(child);
        node = child;
        simColor = opp(simColor);
      }
    }

    // Simulation (고속)
    const result = fastSimulate(simBoard, simColor);

    // Backpropagation
    let n: MCTSNode | null = node;
    while (n !== null) {
      n.visits++;
      if (n.color === BLACK && result === 1) n.wins++;
      else if (n.color === WHITE && result === 0) n.wins++;
      n = n.parent;
    }

    iters++;
  }

  // 방문 횟수 최대인 자식 선택
  let bestChild: MCTSNode | null = null, bestVis = -1;
  for (const ch of root.children) {
    if (ch.visits > bestVis) { bestVis = ch.visits; bestChild = ch; }
  }

  const elapsed = Date.now() - t0;
  const winRate = bestChild ? (bestChild.wins / bestChild.visits * 100).toFixed(1) : '0';
  console.log(`[MCTS] ${iters} iterations in ${elapsed}ms | best: (${bestChild?.move}) visits=${bestVis} winRate=${winRate}% | children=${root.children.length}`);

  return bestChild?.move ?? null;
}

// ====================== 영역 계산 ======================

function calculateTerritory(board: Board): number[][] {
  const terr: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
  const vis = Array.from({ length: N }, () => new Array(N).fill(false));
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if (board[r][c] !== EMPTY || vis[r][c]) continue;
    const reg: Point[] = []; let tb = false, tw = false;
    const stk: Point[] = [[r, c]];
    while (stk.length > 0) {
      const [cr, cc] = stk.pop()!;
      if (vis[cr][cc]) continue; vis[cr][cc] = true; reg.push([cr, cc]);
      for (let d = 0; d < 4; d++) {
        const nr = cr + DR[d], nc = cc + DC[d];
        if (!inB(nr, nc)) continue;
        if (board[nr][nc] === BLACK) tb = true;
        else if (board[nr][nc] === WHITE) tw = true;
        else if (!vis[nr][nc]) stk.push([nr, nc]);
      }
    }
    let owner = 0;
    if (tb && !tw) owner = BLACK; else if (tw && !tb) owner = WHITE;
    for (const [pr, pc] of reg) terr[pr][pc] = owner;
  }
  return terr;
}

// ====================== Worker 핸들러 ======================

self.onmessage = (e: MessageEvent) => {
  const { type, board, color, koHash, thinkingTime } = e.data;
  if (type === 'findMove') {
    const move = mctsSearch(board, color, koHash, thinkingTime);
    postMessage({ type: 'move', move });
  }
  if (type === 'score') {
    postMessage({ type: 'score', score: chineseScore(board) });
  }
  if (type === 'getTerritory') {
    postMessage({ type: 'territory', territory: calculateTerritory(board), score: chineseScore(board) });
  }
};
