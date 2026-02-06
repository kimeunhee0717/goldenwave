import React, { useState, useEffect, useRef } from 'react';
import { Crown, RotateCcw, Users, Bot, Lightbulb, Undo2 } from 'lucide-react';

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type PieceColor = 'white' | 'black';
type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';
type GameMode = 'pvp' | 'ai';
type AiLevel = 'easy' | 'normal' | 'hard';

interface Piece {
  type: PieceType;
  color: PieceColor;
}
type Board = (Piece | null)[][];

interface CastlingRights {
  whiteKing: boolean;
  whiteQueen: boolean;
  blackKing: boolean;
  blackQueen: boolean;
}

interface MoveRecord {
  from: [number, number];
  to: [number, number];
  piece: Piece;
  captured: Piece | null;
  promotion: PieceType | null;
  notation: string;
}

interface Snapshot {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  enPassant: [number, number] | null;
  status: GameStatus;
  captured: { white: Piece[]; black: Piece[] };
  lastMove: { from: [number, number]; to: [number, number] } | null;
  history: MoveRecord[];
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000,
};

const PIECE_NAMES: Record<PieceType, string> = {
  king: '킹', queen: '퀸', rook: '룩', bishop: '비숍', knight: '나이트', pawn: '폰',
};

const PST: Record<PieceType, number[][]> = {
  pawn: [
    [0,0,0,0,0,0,0,0],[50,50,50,50,50,50,50,50],[10,10,20,30,30,20,10,10],
    [5,5,10,25,25,10,5,5],[0,0,0,20,20,0,0,0],[5,-5,-10,0,0,-10,-5,5],
    [5,10,10,-20,-20,10,10,5],[0,0,0,0,0,0,0,0],
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],[-40,-20,0,0,0,0,-20,-40],
    [-30,0,10,15,15,10,0,-30],[-30,5,15,20,20,15,5,-30],
    [-30,0,15,20,20,15,0,-30],[-30,5,10,15,15,10,5,-30],
    [-40,-20,0,5,5,0,-20,-40],[-50,-40,-30,-30,-30,-30,-40,-50],
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
    [-10,0,10,10,10,10,0,-10],[-10,5,5,10,10,5,5,-10],
    [-10,0,5,10,10,5,0,-10],[-10,10,10,10,10,10,10,-10],
    [-10,5,0,0,0,0,5,-10],[-20,-10,-10,-10,-10,-10,-10,-20],
  ],
  rook: [
    [0,0,0,0,0,0,0,0],[5,10,10,10,10,10,10,5],[-5,0,0,0,0,0,0,-5],
    [-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],[-5,0,0,0,0,0,0,-5],
    [-5,0,0,0,0,0,0,-5],[0,0,0,5,5,0,0,0],
  ],
  queen: [
    [-20,-10,-10,-5,-5,-10,-10,-20],[-10,0,0,0,0,0,0,-10],
    [-10,0,5,5,5,5,0,-10],[-5,0,5,5,5,5,0,-5],
    [0,0,5,5,5,5,0,-5],[-10,5,5,5,5,5,0,-10],
    [-10,0,5,0,0,0,0,-10],[-20,-10,-10,-5,-5,-10,-10,-20],
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],[-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],[-10,-20,-20,-20,-20,-20,-20,-10],
    [20,20,0,0,0,0,20,20],[20,30,10,0,0,10,30,20],
  ],
};

const KNIGHT_OFFSETS: [number, number][] = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const KING_OFFSETS: [number, number][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
const BISHOP_DIRS: [number, number][] = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK_DIRS: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]];
const FILES = 'abcdefgh';
const RANKS = '87654321';

// ═══════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════
const opp = (c: PieceColor): PieceColor => (c === 'white' ? 'black' : 'white');
const inB = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
const cloneBoard = (b: Board): Board => b.map(row => row.map(cell => cell ? { ...cell } : null));

function createInitialBoard(): Board {
  const b: Board = Array.from({ length: 8 }, () => Array(8).fill(null));
  const rank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: rank[c], color: 'black' };
    b[1][c] = { type: 'pawn', color: 'black' };
    b[6][c] = { type: 'pawn', color: 'white' };
    b[7][c] = { type: rank[c], color: 'white' };
  }
  return b;
}

function findKing(board: Board, color: PieceColor): [number, number] {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.type === 'king' && board[r][c]?.color === color) return [r, c];
  return [-1, -1];
}

// ═══════════════════════════════════════════════════════
// Attack Detection
// ═══════════════════════════════════════════════════════
function isAttacked(board: Board, row: number, col: number, by: PieceColor): boolean {
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const r = row + dr, c = col + dc;
    if (inB(r, c) && board[r][c]?.color === by && board[r][c]?.type === 'knight') return true;
  }
  const pd = by === 'white' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const r = row + pd, c = col + dc;
    if (inB(r, c) && board[r][c]?.color === by && board[r][c]?.type === 'pawn') return true;
  }
  for (const [dr, dc] of KING_OFFSETS) {
    const r = row + dr, c = col + dc;
    if (inB(r, c) && board[r][c]?.color === by && board[r][c]?.type === 'king') return true;
  }
  for (const [dr, dc] of BISHOP_DIRS) {
    let r = row + dr, c = col + dc;
    while (inB(r, c)) {
      const p = board[r][c];
      if (p) { if (p.color === by && (p.type === 'bishop' || p.type === 'queen')) return true; break; }
      r += dr; c += dc;
    }
  }
  for (const [dr, dc] of ROOK_DIRS) {
    let r = row + dr, c = col + dc;
    while (inB(r, c)) {
      const p = board[r][c];
      if (p) { if (p.color === by && (p.type === 'rook' || p.type === 'queen')) return true; break; }
      r += dr; c += dc;
    }
  }
  return false;
}

const inCheck = (board: Board, color: PieceColor) => {
  const [kr, kc] = findKing(board, color);
  return isAttacked(board, kr, kc, opp(color));
};

// ═══════════════════════════════════════════════════════
// Move Generation
// ═══════════════════════════════════════════════════════
function pseudoMoves(board: Board, row: number, col: number, ep: [number, number] | null): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  const moves: [number, number][] = [];
  const add = (r: number, c: number) => {
    if (inB(r, c) && board[r][c]?.color !== piece.color) moves.push([r, c]);
  };
  const slide = (dirs: [number, number][]) => {
    for (const [dr, dc] of dirs) {
      let r = row + dr, c = col + dc;
      while (inB(r, c)) {
        if (!board[r][c]) { moves.push([r, c]); } else { if (board[r][c]!.color !== piece.color) moves.push([r, c]); break; }
        r += dr; c += dc;
      }
    }
  };

  switch (piece.type) {
    case 'pawn': {
      const d = piece.color === 'white' ? -1 : 1;
      const sr = piece.color === 'white' ? 6 : 1;
      if (inB(row + d, col) && !board[row + d][col]) {
        moves.push([row + d, col]);
        if (row === sr && !board[row + 2 * d][col]) moves.push([row + 2 * d, col]);
      }
      for (const dc of [-1, 1]) {
        const nr = row + d, nc = col + dc;
        if (!inB(nr, nc)) continue;
        if (board[nr][nc] && board[nr][nc]!.color !== piece.color) moves.push([nr, nc]);
        if (ep && ep[0] === nr && ep[1] === nc) moves.push([nr, nc]);
      }
      break;
    }
    case 'knight': for (const [dr, dc] of KNIGHT_OFFSETS) add(row + dr, col + dc); break;
    case 'bishop': slide(BISHOP_DIRS); break;
    case 'rook': slide(ROOK_DIRS); break;
    case 'queen': slide([...BISHOP_DIRS, ...ROOK_DIRS]); break;
    case 'king': for (const [dr, dc] of KING_OFFSETS) add(row + dr, col + dc); break;
  }
  return moves;
}

function legalMoves(board: Board, row: number, col: number, ep: [number, number] | null, cr: CastlingRights): [number, number][] {
  const piece = board[row][col];
  if (!piece) return [];
  let moves = pseudoMoves(board, row, col, ep);

  // Castling
  if (piece.type === 'king') {
    const br = piece.color === 'white' ? 7 : 0;
    if (row === br && col === 4) {
      const ks = piece.color === 'white' ? cr.whiteKing : cr.blackKing;
      if (ks && !board[br][5] && !board[br][6] &&
          !isAttacked(board, br, 4, opp(piece.color)) &&
          !isAttacked(board, br, 5, opp(piece.color)) &&
          !isAttacked(board, br, 6, opp(piece.color)))
        moves.push([br, 6]);
      const qs = piece.color === 'white' ? cr.whiteQueen : cr.blackQueen;
      if (qs && !board[br][1] && !board[br][2] && !board[br][3] &&
          !isAttacked(board, br, 4, opp(piece.color)) &&
          !isAttacked(board, br, 3, opp(piece.color)) &&
          !isAttacked(board, br, 2, opp(piece.color)))
        moves.push([br, 2]);
    }
  }

  // Filter: no self-check
  moves = moves.filter(([tr, tc]) => {
    const nb = cloneBoard(board);
    if (piece.type === 'pawn' && ep && tr === ep[0] && tc === ep[1]) {
      nb[piece.color === 'white' ? tr + 1 : tr - 1][tc] = null;
    }
    if (piece.type === 'king' && Math.abs(tc - col) === 2) {
      const br2 = piece.color === 'white' ? 7 : 0;
      if (tc === 6) { nb[br2][5] = nb[br2][7]; nb[br2][7] = null; }
      else { nb[br2][3] = nb[br2][0]; nb[br2][0] = null; }
    }
    nb[tr][tc] = nb[row][col];
    nb[row][col] = null;
    return !inCheck(nb, piece.color);
  });
  return moves;
}

function allLegalMoves(board: Board, color: PieceColor, ep: [number, number] | null, cr: CastlingRights) {
  const all: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color)
        for (const [tr, tc] of legalMoves(board, r, c, ep, cr))
          all.push({ from: [r, c], to: [tr, tc] });
  return all;
}

// ═══════════════════════════════════════════════════════
// Move Application
// ═══════════════════════════════════════════════════════
function applyMove(
  board: Board, from: [number, number], to: [number, number],
  color: PieceColor, ep: [number, number] | null, cr: CastlingRights,
  promo: PieceType | null = null
) {
  const nb = cloneBoard(board);
  const piece = nb[from[0]][from[1]]!;
  let captured = nb[to[0]][to[1]];

  // En passant capture
  if (piece.type === 'pawn' && ep && to[0] === ep[0] && to[1] === ep[1]) {
    const capRow = color === 'white' ? to[0] + 1 : to[0] - 1;
    captured = nb[capRow][to[1]];
    nb[capRow][to[1]] = null;
  }
  // Castling
  if (piece.type === 'king' && Math.abs(to[1] - from[1]) === 2) {
    const br = color === 'white' ? 7 : 0;
    if (to[1] === 6) { nb[br][5] = nb[br][7]; nb[br][7] = null; }
    else { nb[br][3] = nb[br][0]; nb[br][0] = null; }
  }
  // Move & promote
  const promoRow = color === 'white' ? 0 : 7;
  if (piece.type === 'pawn' && to[0] === promoRow)
    nb[to[0]][to[1]] = { type: promo || 'queen', color };
  else
    nb[to[0]][to[1]] = piece;
  nb[from[0]][from[1]] = null;

  // New en passant
  let newEp: [number, number] | null = null;
  if (piece.type === 'pawn' && Math.abs(to[0] - from[0]) === 2)
    newEp = [(from[0] + to[0]) / 2, from[1]];

  // Update castling
  const nc = { ...cr };
  if (piece.type === 'king') {
    if (color === 'white') { nc.whiteKing = false; nc.whiteQueen = false; }
    else { nc.blackKing = false; nc.blackQueen = false; }
  }
  if (piece.type === 'rook') {
    if (from[0] === 7 && from[1] === 0) nc.whiteQueen = false;
    if (from[0] === 7 && from[1] === 7) nc.whiteKing = false;
    if (from[0] === 0 && from[1] === 0) nc.blackQueen = false;
    if (from[0] === 0 && from[1] === 7) nc.blackKing = false;
  }
  if (to[0] === 0 && to[1] === 0) nc.blackQueen = false;
  if (to[0] === 0 && to[1] === 7) nc.blackKing = false;
  if (to[0] === 7 && to[1] === 0) nc.whiteQueen = false;
  if (to[0] === 7 && to[1] === 7) nc.whiteKing = false;

  return { board: nb, enPassant: newEp, castling: nc, captured };
}

// ═══════════════════════════════════════════════════════
// Notation
// ═══════════════════════════════════════════════════════
function notation(board: Board, from: [number, number], to: [number, number], promo: PieceType | null, resultBoard: Board, nextColor: PieceColor): string {
  const piece = board[from[0]][from[1]]!;
  const captured = board[to[0]][to[1]];
  const isEp = piece.type === 'pawn' && !captured && from[1] !== to[1];

  if (piece.type === 'king' && Math.abs(to[1] - from[1]) === 2)
    return to[1] === 6 ? 'O-O' : 'O-O-O';

  let n = '';
  const sym: Record<PieceType, string> = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: '' };
  if (piece.type === 'pawn') {
    if (from[1] !== to[1]) n += FILES[from[1]] + 'x';
    n += FILES[to[1]] + RANKS[to[0]];
    if (promo) n += '=' + sym[promo];
  } else {
    n += sym[piece.type];
    if (captured || isEp) n += 'x';
    n += FILES[to[1]] + RANKS[to[0]];
  }

  if (inCheck(resultBoard, nextColor)) {
    const moves = allLegalMoves(resultBoard, nextColor, null, { whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true });
    n += moves.length === 0 ? '#' : '+';
  }
  return n;
}

// ═══════════════════════════════════════════════════════
// AI (depth-2 greedy with PST)
// ═══════════════════════════════════════════════════════
function evaluate(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const row = p.color === 'white' ? r : 7 - r;
      const val = PIECE_VALUES[p.type] + PST[p.type][row][c];
      score += p.color === 'white' ? val : -val;
    }
  return score;
}

function getAiMove(board: Board, color: PieceColor, ep: [number, number] | null, cr: CastlingRights, level: AiLevel = 'normal') {
  const moves = allLegalMoves(board, color, ep, cr);
  if (moves.length === 0) return null;

  // Easy: random move
  if (level === 'easy') {
    const pick = moves[Math.floor(Math.random() * moves.length)];
    const piece = board[pick.from[0]][pick.from[1]]!;
    const promoRow = color === 'white' ? 0 : 7;
    const promo = piece.type === 'pawn' && pick.to[0] === promoRow ? 'queen' as PieceType : null;
    return { move: pick, score: 0, promo };
  }

  const scored = moves.map(move => {
    const piece = board[move.from[0]][move.from[1]]!;
    const promoRow = color === 'white' ? 0 : 7;
    const promo = piece.type === 'pawn' && move.to[0] === promoRow ? 'queen' as PieceType : null;
    const result = applyMove(board, move.from, move.to, color, ep, cr, promo);

    // Normal: depth 1 (greedy)
    if (level === 'normal') {
      return { move, score: evaluate(result.board), promo };
    }

    // Hard: depth 2 — consider opponent's best response
    const oppMoves = allLegalMoves(result.board, opp(color), result.enPassant, result.castling);
    let score: number;
    if (oppMoves.length === 0) {
      score = inCheck(result.board, opp(color))
        ? (color === 'white' ? 100000 : -100000)
        : 0;
    } else {
      const oppScores = oppMoves.map(om => {
        const rp = result.board[om.from[0]][om.from[1]];
        const oppPromoRow = opp(color) === 'white' ? 0 : 7;
        const oppPromo = rp?.type === 'pawn' && om.to[0] === oppPromoRow ? 'queen' as PieceType : null;
        const r2 = applyMove(result.board, om.from, om.to, opp(color), result.enPassant, result.castling, oppPromo);
        return evaluate(r2.board);
      });
      score = color === 'black'
        ? Math.max(...oppScores)
        : Math.min(...oppScores);
    }
    return { move, score, promo };
  });

  scored.sort((a, b) => color === 'black' ? a.score - b.score : b.score - a.score);
  // Hard: always pick the best, Normal: pick from top 3
  const topN = level === 'hard' ? 1 : Math.min(3, scored.length);
  return scored[Math.floor(Math.random() * topN)];
}

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════
export default function ChessGame() {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [castling, setCastling] = useState<CastlingRights>({ whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true });
  const [enPassant, setEnPassant] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [legal, setLegal] = useState<[number, number][]>([]);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [captured, setCaptured] = useState<{ white: Piece[]; black: Piece[] }>({ white: [], black: [] });
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [mode, setMode] = useState<GameMode>('ai');
  const [aiLevel, setAiLevel] = useState<AiLevel>('normal');
  const [promoPending, setPromoPending] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
  const [aiThinking, setAiThinking] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll move history (container only, not the page)
  useEffect(() => {
    const container = historyContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [history]);

  // Snapshot for undo
  const takeSnapshot = (): Snapshot => ({
    board: cloneBoard(board), turn, castling: { ...castling }, enPassant, status,
    captured: { white: [...captured.white], black: [...captured.black] },
    lastMove, history: [...history],
  });

  const executeMove = (fromR: number, fromC: number, toR: number, toC: number, promo: PieceType | null) => {
    const snap = takeSnapshot();
    const piece = board[fromR][fromC]!;
    const result = applyMove(board, [fromR, fromC], [toR, toC], turn, enPassant, castling, promo);
    const nextTurn = opp(turn);
    const nextMoves = allLegalMoves(result.board, nextTurn, result.enPassant, result.castling);
    const isCheck = inCheck(result.board, nextTurn);
    let newStatus: GameStatus = 'playing';
    if (nextMoves.length === 0) newStatus = isCheck ? 'checkmate' : 'stalemate';
    else if (isCheck) newStatus = 'check';

    const n = notation(board, [fromR, fromC], [toR, toC], promo, result.board, nextTurn);
    const move: MoveRecord = {
      from: [fromR, fromC], to: [toR, toC], piece,
      captured: result.captured, promotion: promo, notation: n,
    };

    setUndoStack(prev => [...prev, snap]);
    setBoard(result.board);
    setTurn(nextTurn);
    setCastling(result.castling);
    setEnPassant(result.enPassant);
    setStatus(newStatus);
    setSelected(null);
    setLegal([]);
    setLastMove({ from: [fromR, fromC], to: [toR, toC] });
    setHistory(prev => [...prev, move]);
    if (result.captured) {
      setCaptured(prev => ({
        ...prev,
        [turn]: [...prev[turn], result.captured!],
      }));
    }
    setPromoPending(null);
  };

  const handleClick = (row: number, col: number) => {
    if (status === 'checkmate' || status === 'stalemate') return;
    if (mode === 'ai' && turn === 'black') return;
    if (promoPending) return;

    const piece = board[row][col];
    if (selected) {
      if (piece && piece.color === turn) {
        setSelected([row, col]);
        setLegal(legalMoves(board, row, col, enPassant, castling));
        return;
      }
      const isLegal = legal.some(([r, c]) => r === row && c === col);
      if (isLegal) {
        const movingPiece = board[selected[0]][selected[1]]!;
        const promoRow = turn === 'white' ? 0 : 7;
        if (movingPiece.type === 'pawn' && row === promoRow) {
          setPromoPending({ from: selected, to: [row, col] });
          return;
        }
        executeMove(selected[0], selected[1], row, col, null);
      } else {
        setSelected(null);
        setLegal([]);
      }
      return;
    }
    if (piece && piece.color === turn) {
      setSelected([row, col]);
      setLegal(legalMoves(board, row, col, enPassant, castling));
    }
  };

  const handlePromotion = (type: PieceType) => {
    if (!promoPending) return;
    executeMove(promoPending.from[0], promoPending.from[1], promoPending.to[0], promoPending.to[1], type);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    let stack = [...undoStack];
    // In AI mode, undo 2 moves (player + AI)
    if (mode === 'ai' && stack.length >= 2 && turn === 'white') {
      stack.pop(); // AI's move
    }
    const snap = stack.pop()!;
    setBoard(snap.board);
    setTurn(snap.turn);
    setCastling(snap.castling);
    setEnPassant(snap.enPassant);
    setStatus(snap.status);
    setCaptured(snap.captured);
    setLastMove(snap.lastMove);
    setHistory(snap.history);
    setUndoStack(stack);
    setSelected(null);
    setLegal([]);
    setPromoPending(null);
    setAiThinking(false);
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setTurn('white');
    setCastling({ whiteKing: true, whiteQueen: true, blackKing: true, blackQueen: true });
    setEnPassant(null);
    setStatus('playing');
    setSelected(null);
    setLegal([]);
    setHistory([]);
    setCaptured({ white: [], black: [] });
    setLastMove(null);
    setUndoStack([]);
    setPromoPending(null);
    setAiThinking(false);
  };

  // AI move
  useEffect(() => {
    if (mode !== 'ai' || turn !== 'black') return;
    if (status === 'checkmate' || status === 'stalemate') return;

    setAiThinking(true);
    const timer = setTimeout(() => {
      const result = getAiMove(board, 'black', enPassant, castling, aiLevel);
      if (result) {
        executeMove(result.move.from[0], result.move.from[1], result.move.to[0], result.move.to[1], result.promo);
      }
      setAiThinking(false);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, status]);

  // Material advantage
  const materialScore = (() => {
    const w = captured.white.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
    const b = captured.black.reduce((s, p) => s + PIECE_VALUES[p.type], 0);
    return Math.round((w - b) / 100);
  })();

  const kingInCheck = (status === 'check' || status === 'checkmate') ? findKing(board, turn) : null;

  return (
    <div className="min-h-screen bg-oatmeal-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">체스 게임</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            무료로 즐기는 온라인 체스. AI와 대전하거나 친구와 함께 플레이하세요.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="bg-gradient-to-b from-espresso-950 to-oatmeal-100 py-6 sm:py-10 px-3 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Board Column */}
            <div className="lg:col-span-3 flex flex-col items-center">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => { setMode('pvp'); resetGame(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'pvp' ? 'bg-golden-100 text-espresso-800 shadow' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Users size={16} /> 2인 플레이
                </button>
                <button
                  onClick={() => { setMode('ai'); resetGame(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'ai' ? 'bg-golden-100 text-espresso-800 shadow' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <Bot size={16} /> AI 대전
                </button>
              </div>

              {/* AI Difficulty */}
              {mode === 'ai' && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-white/50">난이도</span>
                  {([['easy', '쉬움'], ['normal', '보통'], ['hard', '어려움']] as [AiLevel, string][]).map(([lv, label]) => (
                    <button
                      key={lv}
                      onClick={() => { setAiLevel(lv); resetGame(); }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                        aiLevel === lv
                          ? lv === 'easy' ? 'bg-thyme-500 text-white shadow' :
                            lv === 'normal' ? 'bg-golden-100 text-espresso-800 shadow' :
                            'bg-red-500 text-white shadow'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Captured by white (black's pieces) — shown on top */}
              <CapturedRow pieces={captured.white} label="흑" advantage={materialScore > 0 ? materialScore : 0} />

              {/* Board */}
              <div className="relative w-full" style={{ maxWidth: 480 }}>
                <div
                  className="grid grid-cols-8 border-2 rounded-lg overflow-hidden shadow-xl"
                  style={{ borderColor: '#7B6152' }}
                >
                  {Array.from({ length: 64 }, (_, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const isLight = (row + col) % 2 === 0;
                    const piece = board[row][col];
                    const isSel = selected && selected[0] === row && selected[1] === col;
                    const isLegalTarget = legal.some(([r, c]) => r === row && c === col);
                    const isLastFrom = lastMove && lastMove.from[0] === row && lastMove.from[1] === col;
                    const isLastTo = lastMove && lastMove.to[0] === row && lastMove.to[1] === col;
                    const isKingCheck = kingInCheck && kingInCheck[0] === row && kingInCheck[1] === col;
                    const labelColor = isLight ? 'rgba(181,136,99,0.9)' : 'rgba(240,217,181,0.9)';

                    return (
                      <div
                        key={i}
                        className="aspect-square flex items-center justify-center relative select-none cursor-pointer"
                        style={{
                          backgroundColor: isSel
                            ? '#F6D365'
                            : isKingCheck
                            ? '#E74C3C'
                            : isLastFrom || isLastTo
                            ? isLight ? '#F5F096' : '#BACA44'
                            : isLight ? '#F0D9B5' : '#B58863',
                        }}
                        onClick={() => handleClick(row, col)}
                      >
                        {/* Legal move indicator */}
                        {isLegalTarget && !piece && (
                          <div className="absolute w-[28%] h-[28%] rounded-full bg-black/20" />
                        )}
                        {isLegalTarget && piece && (
                          <div className="absolute inset-0 border-[3px] rounded-sm" style={{ borderColor: 'rgba(0,0,0,0.25)' }} />
                        )}
                        {/* Piece */}
                        {piece && (
                          <span
                            className="text-[clamp(1.8rem,7vw,3rem)] leading-none"
                            style={{
                              filter: piece.color === 'white'
                                ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                                : 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))',
                              color: piece.color === 'white' ? '#fff' : '#1a1a1a',
                              WebkitTextStroke: piece.color === 'white' ? '1px #555' : 'none',
                              paintOrder: piece.color === 'white' ? 'stroke fill' : 'normal',
                            }}
                          >
                            {PIECE_SYMBOLS[piece.color][piece.type]}
                          </span>
                        )}
                        {/* File label (bottom row) */}
                        {row === 7 && (
                          <span className="absolute bottom-[1px] right-[3px] text-[10px] font-semibold leading-none" style={{ color: labelColor }}>
                            {FILES[col]}
                          </span>
                        )}
                        {/* Rank label (left column) */}
                        {col === 0 && (
                          <span className="absolute top-[1px] left-[3px] text-[10px] font-semibold leading-none" style={{ color: labelColor }}>
                            {RANKS[row]}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Promotion Dialog */}
                {promoPending && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-lg">
                    <div className="bg-white rounded-xl p-4 shadow-2xl">
                      <p className="text-sm font-semibold mb-3 text-center text-espresso-800">프로모션 선택</p>
                      <div className="flex gap-2">
                        {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map(t => (
                          <button
                            key={t}
                            onClick={() => handlePromotion(t)}
                            className="w-14 h-14 flex flex-col items-center justify-center text-3xl hover:bg-golden-100 rounded-lg transition-colors border border-oatmeal-200"
                            title={PIECE_NAMES[t]}
                          >
                            <span>{PIECE_SYMBOLS[turn][t]}</span>
                            <span className="text-[9px] text-espresso-600 mt-0.5">{PIECE_NAMES[t]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Captured by black (white's pieces) — shown on bottom */}
              <CapturedRow pieces={captured.black} label="백" advantage={materialScore < 0 ? -materialScore : 0} />

              {/* Status Bar */}
              <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  status === 'checkmate' ? 'bg-red-100 text-red-700' :
                  status === 'stalemate' ? 'bg-gray-100 text-gray-700' :
                  status === 'check' ? 'bg-amber-100 text-amber-700' :
                  turn === 'white' ? 'bg-white text-espresso-800 border border-oatmeal-200' :
                  'bg-espresso-800 text-white'
                }`}>
                  {status === 'checkmate' ? `체크메이트! ${opp(turn) === 'white' ? '백' : '흑'} 승리` :
                   status === 'stalemate' ? '스테일메이트 — 무승부' :
                   status === 'check' ? `체크! ${turn === 'white' ? '백' : '흑'} 차례` :
                   aiThinking ? 'AI 생각 중...' :
                   `${turn === 'white' ? '백' : '흑'} 차례`}
                </div>
                <button
                  onClick={handleUndo}
                  disabled={undoStack.length === 0 || aiThinking}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-espresso-700 border border-oatmeal-200 hover:bg-oatmeal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Undo2 size={14} /> 되돌리기
                </button>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-espresso-700 border border-oatmeal-200 hover:bg-oatmeal-50 transition-colors"
                >
                  <RotateCcw size={14} /> 새 게임
                </button>
              </div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Game Info Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-oatmeal-200 shadow-sm">
                <h3 className="font-bold text-espresso-800 mb-3 text-base">게임 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-espresso-500">모드</span>
                    <span className="font-medium text-espresso-800">{mode === 'ai' ? `AI 대전 (${aiLevel === 'easy' ? '쉬움' : aiLevel === 'normal' ? '보통' : '어려움'})` : '2인 플레이'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-espresso-500">현재 차례</span>
                    <span className="font-medium text-espresso-800">{turn === 'white' ? '백 (White)' : '흑 (Black)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-espresso-500">수</span>
                    <span className="font-medium text-espresso-800">{Math.ceil(history.length / 2)}</span>
                  </div>
                  {materialScore !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-espresso-500">기물 우위</span>
                      <span className="font-medium text-espresso-800">
                        {materialScore > 0 ? `백 +${materialScore}` : `흑 +${-materialScore}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-espresso-500">상태</span>
                    <span className={`font-medium ${
                      status === 'checkmate' ? 'text-red-600' :
                      status === 'check' ? 'text-amber-600' :
                      status === 'stalemate' ? 'text-gray-600' :
                      'text-thyme-500'
                    }`}>
                      {status === 'checkmate' ? '체크메이트' :
                       status === 'check' ? '체크' :
                       status === 'stalemate' ? '무승부' :
                       '진행 중'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Move History */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-oatmeal-200 shadow-sm">
                <h3 className="font-bold text-espresso-800 mb-3 text-base">기보</h3>
                <div ref={historyContainerRef} className="max-h-72 overflow-y-auto font-mono text-sm">
                  {history.length === 0 ? (
                    <p className="text-espresso-400 text-center py-4 font-sans">기물을 움직여 게임을 시작하세요</p>
                  ) : (
                    <div className="space-y-1">
                      {Array.from({ length: Math.ceil(history.length / 2) }, (_, i) => {
                        const w = history[i * 2];
                        const b = history[i * 2 + 1];
                        return (
                          <div key={i} className="flex gap-2 px-2 py-0.5 rounded hover:bg-oatmeal-50">
                            <span className="text-espresso-400 w-7 text-right shrink-0">{i + 1}.</span>
                            <span className="text-espresso-800 w-16">{w?.notation}</span>
                            <span className="text-espresso-800 w-16">{b?.notation || ''}</span>
                          </div>
                        );
                      })}
                      <div ref={historyEndRef} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-golden-50 to-cream-100 py-10 sm:py-14 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="text-golden-600" size={22} />
            <h2 className="text-xl font-bold text-espresso-800">체스 규칙 & 팁</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '기물 이동', desc: '킹(1칸), 퀸(모든 방향), 룩(직선), 비숍(대각선), 나이트(L자), 폰(앞으로 1칸, 첫 수 2칸)' },
              { title: '체크 & 체크메이트', desc: '상대 킹을 공격하면 체크, 킹이 도망갈 곳이 없으면 체크메이트로 승리!' },
              { title: '캐슬링', desc: '킹과 룩이 한 번도 움직이지 않았다면, 킹을 2칸 옮기고 룩을 넘기는 특수 수' },
              { title: '앙파상', desc: '상대 폰이 2칸 전진했을 때, 옆에 있는 내 폰이 대각선으로 잡을 수 있는 특수 규칙' },
              { title: '프로모션', desc: '폰이 상대 진영 끝에 도달하면 퀸, 룩, 비숍, 나이트 중 하나로 승급' },
              { title: '초보자 팁', desc: '중앙을 장악하고, 기물을 빨리 전개하고, 킹을 캐슬링으로 안전하게 보호하세요' },
            ].map((tip, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-4 border border-golden-200/60">
                <h4 className="font-semibold text-espresso-800 mb-1.5 text-sm">{tip.title}</h4>
                <p className="text-espresso-600 text-sm leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Sub-component: Captured Pieces Row
// ═══════════════════════════════════════════════════════
function CapturedRow({ pieces, label, advantage }: { pieces: Piece[]; label: string; advantage: number }) {
  const sorted = [...pieces].sort((a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]);
  return (
    <div className="flex items-center gap-2 h-8 my-1 px-1 w-full" style={{ maxWidth: 480 }}>
      <span className="text-xs font-medium text-white/60 w-6 shrink-0">{label}</span>
      <div className="flex items-center gap-0 flex-wrap">
        {sorted.map((p, i) => (
          <span key={i} className="text-lg leading-none opacity-80" style={{
            color: p.color === 'white' ? '#fff' : '#1a1a1a',
            WebkitTextStroke: p.color === 'white' ? '0.8px #555' : 'none',
            paintOrder: p.color === 'white' ? 'stroke fill' : 'normal',
          }}>
            {PIECE_SYMBOLS[p.color][p.type]}
          </span>
        ))}
      </div>
      {advantage > 0 && <span className="text-xs text-white/50 ml-1">+{advantage}</span>}
    </div>
  );
}
