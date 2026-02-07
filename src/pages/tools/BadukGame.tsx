import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw, Flag, User, Bot, Volume2, VolumeX, SkipForward } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 바둑 (Baduk / Go) — 13×13, MCTS AI, 중국식 계가, 덤 6.5
// ============================================================================

const BOARD_SIZE = 13;
const CELL_SIZE = 32;
const PADDING = 24;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;
const KOMI = 6.5;

type GameMode = 'pvp' | 'ai';
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Point = [number, number];

const DIFFICULTY_TIME: Record<Difficulty, number> = {
  beginner: 200,
  intermediate: 500,
  advanced: 1500,
  expert: 3000,
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
  expert: '최고수',
};

// 화점(星) 위치 (13×13, 0-indexed)
const STAR_POINTS = [
  { row: 3, col: 3 }, { row: 3, col: 9 },
  { row: 6, col: 6 },
  { row: 9, col: 3 }, { row: 9, col: 9 },
];

const DIRS: Point[] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

// ============================================================================
// 사운드
// ============================================================================
const soundCache: Record<string, HTMLAudioElement> = {};

function playSound(name: string) {
  try {
    if (!soundCache[name]) {
      soundCache[name] = new Audio(`/sounds/${name}.mp3`);
    }
    const audio = soundCache[name].cloneNode() as HTMLAudioElement;
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {}
}

function initAudio() {
  try {
    ['stone', 'capture', 'victory'].forEach(name => {
      if (!soundCache[name]) {
        soundCache[name] = new Audio(`/sounds/${name}.mp3`);
        soundCache[name].load();
      }
    });
  } catch {}
}

// ============================================================================
// 바둑 규칙
// ============================================================================

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

function getGroup(board: number[][], r: number, c: number): { stones: Point[]; liberties: Set<string> } {
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
    for (const [dr, dc] of DIRS) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (!inBounds(nr, nc)) continue;
      if (board[nr][nc] === EMPTY) liberties.add(`${nr},${nc}`);
      else if (board[nr][nc] === color && !visited.has(`${nr},${nc}`)) stack.push([nr, nc]);
    }
  }
  return { stones, liberties };
}

function boardToHash(board: number[][]): string {
  let h = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      h += board[r][c];
    }
  }
  return h;
}

function tryPlaceStone(board: number[][], r: number, c: number, color: number, koHash: string | null): {
  newBoard: number[][];
  captured: Point[];
  valid: boolean;
  newHash: string;
} {
  if (!inBounds(r, c) || board[r][c] !== EMPTY) return { newBoard: board, captured: [], valid: false, newHash: '' };

  const newBoard = board.map(row => row.slice());
  newBoard[r][c] = color;
  const opp = color === BLACK ? WHITE : BLACK;
  const captured: Point[] = [];

  for (const [dr, dc] of DIRS) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && newBoard[nr][nc] === opp) {
      const group = getGroup(newBoard, nr, nc);
      if (group.liberties.size === 0) {
        for (const [sr, sc] of group.stones) {
          newBoard[sr][sc] = EMPTY;
          captured.push([sr, sc]);
        }
      }
    }
  }

  const myGroup = getGroup(newBoard, r, c);
  if (myGroup.liberties.size === 0) {
    return { newBoard: board, captured: [], valid: false, newHash: '' };
  }

  const newHash = boardToHash(newBoard);
  if (koHash && newHash === koHash) {
    return { newBoard: board, captured: [], valid: false, newHash: '' };
  }

  return { newBoard, captured, valid: true, newHash };
}

function chineseScore(board: number[][]): { black: number; white: number } {
  const visited = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(false));
  let blackScore = 0;
  let whiteScore = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === BLACK) blackScore++;
      else if (board[r][c] === WHITE) whiteScore++;
    }
  }

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY || visited[r][c]) continue;
      const region: Point[] = [];
      let touchesBlack = false;
      let touchesWhite = false;
      const stack: Point[] = [[r, c]];
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!;
        if (visited[cr][cc]) continue;
        visited[cr][cc] = true;
        region.push([cr, cc]);
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inBounds(nr, nc)) continue;
          if (board[nr][nc] === BLACK) touchesBlack = true;
          else if (board[nr][nc] === WHITE) touchesWhite = true;
          else if (!visited[nr][nc]) stack.push([nr, nc]);
        }
      }
      if (touchesBlack && !touchesWhite) blackScore += region.length;
      else if (touchesWhite && !touchesBlack) whiteScore += region.length;
    }
  }

  return { black: blackScore, white: whiteScore + KOMI };
}

function calculateTerritory(board: number[][]): number[][] {
  const territory: number[][] = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(0));
  const visited = Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(false));

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== EMPTY || visited[r][c]) continue;
      const region: Point[] = [];
      let touchesBlack = false;
      let touchesWhite = false;
      const stack: Point[] = [[r, c]];
      while (stack.length > 0) {
        const [cr, cc] = stack.pop()!;
        if (visited[cr][cc]) continue;
        visited[cr][cc] = true;
        region.push([cr, cc]);
        for (const [dr, dc] of DIRS) {
          const nr = cr + dr;
          const nc = cc + dc;
          if (!inBounds(nr, nc)) continue;
          if (board[nr][nc] === BLACK) touchesBlack = true;
          else if (board[nr][nc] === WHITE) touchesWhite = true;
          else if (!visited[nr][nc]) stack.push([nr, nc]);
        }
      }
      let owner = 0;
      if (touchesBlack && !touchesWhite) owner = BLACK;
      else if (touchesWhite && !touchesBlack) owner = WHITE;
      for (const [pr, pc] of region) {
        territory[pr][pc] = owner;
      }
    }
  }
  return territory;
}

// ============================================================================
// Worker import
// ============================================================================
import BadukWorker from '../../workers/badukAI.worker?worker';

// ============================================================================
// 컴포넌트
// ============================================================================

export default function BadukGame() {
  const [board, setBoard] = useState<number[][]>(() =>
    Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(EMPTY))
  );
  const [currentPlayer, setCurrentPlayer] = useState<number>(BLACK);
  const [koHash, setKoHash] = useState<string | null>(null);
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [lastMove, setLastMove] = useState<Point | null>(null);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<{ black: number; white: number } | null>(null);
  const [territory, setTerritory] = useState<number[][] | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [soundOn, setSoundOn] = useState(true);
  const [moveCount, setMoveCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [resigned, setResigned] = useState(false);
  const [history, setHistory] = useState<{
    board: number[][];
    currentPlayer: number;
    koHash: string | null;
    captures: { black: number; white: number };
    lastMove: Point | null;
    consecutivePasses: number;
    moveCount: number;
  }[]>([]);

  const soundRef = useRef(true);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  const workerRef = useRef<Worker | null>(null);

  // Worker 생성
  useEffect(() => {
    workerRef.current = new BadukWorker();
    return () => { workerRef.current?.terminate(); };
  }, []);

  // 돌 놓기 (사용자 + AI 공용)
  const handlePlaceStone = useCallback((row: number, col: number, isAI = false) => {
    if (!isAI && isThinking) return;
    if (gameOver) return;
    if (!isAI && gameMode === 'ai' && currentPlayer === WHITE) return;
    if (!isAI) initAudio();

    const result = tryPlaceStone(board, row, col, currentPlayer, koHash);
    if (!result.valid) return;

    // 히스토리 저장
    setHistory(prev => [...prev, {
      board: board.map(r => r.slice()),
      currentPlayer,
      koHash,
      captures: { ...captures },
      lastMove,
      consecutivePasses,
      moveCount,
    }]);

    const newKoHash = result.captured.length === 1 ? boardToHash(board) : null;

    setBoard(result.newBoard);
    setLastMove([row, col]);
    setKoHash(newKoHash);
    setConsecutivePasses(0);
    setMoveCount(prev => prev + 1);

    if (result.captured.length > 0) {
      if (soundRef.current) playSound('capture');
      const key = currentPlayer === BLACK ? 'black' : 'white';
      setCaptures(prev => ({ ...prev, [key]: prev[key as 'black' | 'white'] + result.captured.length }));
    } else {
      if (soundRef.current) playSound('stone');
    }

    setCurrentPlayer(currentPlayer === BLACK ? WHITE : BLACK);
  }, [board, currentPlayer, koHash, gameOver, isThinking, gameMode, captures, lastMove, consecutivePasses, moveCount]);

  // handlePlaceStone을 ref로 유지 (오목 패턴)
  const placeStoneRef = useRef(handlePlaceStone);
  useEffect(() => { placeStoneRef.current = handlePlaceStone; }, [handlePlaceStone]);

  // 패스
  const handlePass = useCallback((isAI = false) => {
    if (gameOver || (isThinking && !isAI)) return;

    setConsecutivePasses(prev => {
      const newPasses = prev + 1;
      if (newPasses >= 2) {
        // 계가
        const score = chineseScore(board);
        const terr = calculateTerritory(board);
        setTerritory(terr);
        setFinalScore(score);
        setGameOver(true);
        if (score.black > score.white) {
          setWinner(`흑 승 (${score.black.toFixed(1)} vs ${score.white.toFixed(1)})`);
        } else {
          setWinner(`백 승 (${score.white.toFixed(1)} vs ${score.black.toFixed(1)})`);
        }
        setShowResult(true);
        if (soundRef.current) playSound('victory');
      }
      return newPasses;
    });

    setMoveCount(prev => prev + 1);
    setCurrentPlayer(prev => prev === BLACK ? WHITE : BLACK);
  }, [gameOver, isThinking, board]);

  const handlePassRef = useRef(handlePass);
  useEffect(() => { handlePassRef.current = handlePass; }, [handlePass]);

  // AI 턴 처리 (오목과 동일한 useEffect + ref 패턴)
  const aiPendingRef = useRef(false);

  useEffect(() => {
    if (gameMode !== 'ai' || currentPlayer !== WHITE || gameOver) return;
    if (aiPendingRef.current) return;
    if (!workerRef.current) return;

    aiPendingRef.current = true;
    setIsThinking(true);
    const worker = workerRef.current;
    let cancelled = false;

    const handler = (e: MessageEvent) => {
      worker.removeEventListener('message', handler);
      if (cancelled) return;
      const { type, move } = e.data;
      if (type === 'move') {
        if (move) {
          placeStoneRef.current(move[0], move[1], true);
        } else {
          // AI 패스
          handlePassRef.current(true);
        }
      }
      aiPendingRef.current = false;
      setIsThinking(false);
    };

    worker.addEventListener('message', handler);
    worker.postMessage({
      type: 'findMove',
      board,
      color: WHITE,
      koHash,
      thinkingTime: DIFFICULTY_TIME[difficulty],
    });

    return () => {
      cancelled = true;
      worker.removeEventListener('message', handler);
      aiPendingRef.current = false;
      setIsThinking(false);
    };
  }, [currentPlayer, gameMode, gameOver, board, koHash, difficulty]);

  // 항복
  const handleResign = useCallback(() => {
    if (gameOver || isThinking) return;
    setGameOver(true);
    setResigned(true);
    const resignColor = currentPlayer === BLACK ? '흑' : '백';
    const winColor = currentPlayer === BLACK ? '백' : '흑';
    setWinner(`${winColor} 승 (${resignColor} 항복)`);
    setShowResult(true);
    if (soundRef.current) playSound('victory');
  }, [gameOver, isThinking, currentPlayer]);

  // 무르기
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameOver || isThinking) return;
    const stepsBack = gameMode === 'ai' && history.length >= 2 ? 2 : 1;
    const targetIdx = Math.max(0, history.length - stepsBack);
    const state = history[targetIdx];

    setBoard(state.board);
    setCurrentPlayer(state.currentPlayer);
    setKoHash(state.koHash);
    setCaptures(state.captures);
    setLastMove(state.lastMove);
    setConsecutivePasses(state.consecutivePasses);
    setMoveCount(state.moveCount);
    setHistory(prev => prev.slice(0, targetIdx));
  }, [history, gameOver, gameMode, isThinking]);

  // 새 게임
  const reset = useCallback(() => {
    setBoard(Array.from({ length: BOARD_SIZE }, () => new Array(BOARD_SIZE).fill(EMPTY)));
    setCurrentPlayer(BLACK);
    setKoHash(null);
    setCaptures({ black: 0, white: 0 });
    setLastMove(null);
    setConsecutivePasses(0);
    setGameOver(false);
    setWinner(null);
    setFinalScore(null);
    setTerritory(null);
    setIsThinking(false);
    setMoveCount(0);
    setShowResult(false);
    setResigned(false);
    setHistory([]);
    aiPendingRef.current = false;
  }, []);

  // SVG 좌표 헬퍼
  const WIDTH = PADDING * 2 + (BOARD_SIZE - 1) * CELL_SIZE;
  const HEIGHT = WIDTH;
  const getX = (c: number) => PADDING + c * CELL_SIZE;
  const getY = (r: number) => PADDING + r * CELL_SIZE;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tools" className="text-white/70 hover:text-white transition">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">바둑 13×13</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundOn(s => !s)}
                className="px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition flex items-center gap-1"
                title={soundOn ? '소리 끄기' : '소리 켜기'}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 게임 모드 & 난이도 선택 */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">모드</span>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => { setGameMode('pvp'); reset(); }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'pvp' ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <User className="w-3.5 h-3.5" />2인
                </button>
                <button
                  onClick={() => { setGameMode('ai'); reset(); }}
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'ai' ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Bot className="w-3.5 h-3.5" />AI
                </button>
              </div>
            </div>

            {gameMode === 'ai' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">난이도</span>
                <div className="flex bg-gray-100 rounded-lg p-0.5">
                  {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map(d => (
                    <button
                      key={d}
                      onClick={() => { setDifficulty(d); reset(); }}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${difficulty === d ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 게임 영역 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 보드 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* 상태바 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${currentPlayer === BLACK ? 'bg-stone-900 shadow-lg' : 'bg-stone-300'}`} />
                  <span className={`font-semibold ${currentPlayer === BLACK ? 'text-stone-900' : 'text-gray-400'}`}>
                    {gameMode === 'ai' ? '나 (흑)' : '흑돌'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {gameOver && winner && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold text-sm">
                      {winner}
                    </div>
                  )}
                  {isThinking && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '75ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${currentPlayer === WHITE ? 'text-gray-700' : 'text-gray-400'}`}>
                    {gameMode === 'ai' ? 'AI (백)' : '백돌'}
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 border-gray-300 ${currentPlayer === WHITE ? 'bg-white shadow-lg' : 'bg-gray-200'}`} />
                </div>
              </div>

              {/* SVG 보드 (오목과 동일한 렌더링) */}
              <div className="flex justify-center">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-md select-none">
                  <defs>
                    <linearGradient id="badukBoardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f5e6c8" />
                      <stop offset="50%" stopColor="#e8d4a0" />
                      <stop offset="100%" stopColor="#d4b896" />
                    </linearGradient>
                    <radialGradient id="badukBlackStone" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#4a4a4a" />
                      <stop offset="40%" stopColor="#1a1a1a" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                    <radialGradient id="badukWhiteStone" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f0f0f0" />
                      <stop offset="100%" stopColor="#d0d0d0" />
                    </radialGradient>
                    <filter id="badukStoneShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4"/>
                    </filter>
                  </defs>

                  {/* 보드 배경 */}
                  <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#badukBoardGrad)" rx="8" />

                  {/* 격자선 */}
                  <g stroke="#5c3d1e" strokeWidth="1" opacity="0.8">
                    {Array.from({ length: BOARD_SIZE }).map((_, i) => (
                      <g key={`lines-${i}`}>
                        <line x1={getX(0)} y1={getY(i)} x2={getX(BOARD_SIZE - 1)} y2={getY(i)} />
                        <line x1={getX(i)} y1={getY(0)} x2={getX(i)} y2={getY(BOARD_SIZE - 1)} />
                      </g>
                    ))}
                  </g>

                  {/* 화점 */}
                  <g fill="#5c3d1e">
                    {STAR_POINTS.map((p, i) => (
                      <circle key={`star-${i}`} cx={getX(p.col)} cy={getY(p.row)} r="3" />
                    ))}
                  </g>

                  {/* 영역 시각화 (게임 종료 시) */}
                  {gameOver && territory && Array.from({ length: BOARD_SIZE }).map((_, r) =>
                    Array.from({ length: BOARD_SIZE }).map((_, c) => {
                      if (board[r][c] !== EMPTY || territory[r][c] === 0) return null;
                      return (
                        <rect
                          key={`terr-${r}-${c}`}
                          x={getX(c) - 6}
                          y={getY(r) - 6}
                          width={12}
                          height={12}
                          fill={territory[r][c] === BLACK ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.6)'}
                          stroke={territory[r][c] === WHITE ? 'rgba(0,0,0,0.3)' : 'none'}
                          strokeWidth="0.5"
                        />
                      );
                    })
                  )}

                  {/* 교차점 클릭 영역 */}
                  {Array.from({ length: BOARD_SIZE }).map((_, r) =>
                    Array.from({ length: BOARD_SIZE }).map((_, c) => (
                      <circle
                        key={`hit-${r}-${c}`}
                        cx={getX(c)}
                        cy={getY(r)}
                        r="15"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => handlePlaceStone(r, c)}
                      />
                    ))
                  )}

                  {/* 돌 */}
                  {board.map((row, r) =>
                    row.map((stone, c) => {
                      if (stone === EMPTY) return null;
                      return (
                        <g key={`stone-${r}-${c}`} filter="url(#badukStoneShadow)">
                          <circle
                            cx={getX(c)}
                            cy={getY(r)}
                            r="13"
                            fill={stone === BLACK ? 'url(#badukBlackStone)' : 'url(#badukWhiteStone)'}
                            stroke={stone === WHITE ? '#ccc' : 'none'}
                            strokeWidth="1"
                          />
                          {/* 하이라이트 */}
                          <circle
                            cx={getX(c) - 4}
                            cy={getY(r) - 4}
                            r="4"
                            fill="white"
                            opacity={stone === BLACK ? '0.3' : '0.6'}
                          />
                        </g>
                      );
                    })
                  )}

                  {/* 마지막 수 표시 */}
                  {lastMove && (
                    <circle
                      cx={getX(lastMove[1])}
                      cy={getY(lastMove[0])}
                      r="16"
                      fill="none"
                      stroke={board[lastMove[0]][lastMove[1]] === BLACK ? '#fff' : '#000'}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}
                </svg>
              </div>

              {/* 컨트롤 */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  onClick={() => { initAudio(); handlePass(); }}
                  disabled={gameOver || isThinking}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <SkipForward className="w-4 h-4" /> 패스
                </button>
                <button
                  onClick={handleUndo}
                  disabled={gameOver || isThinking || history.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" /> 무르기
                </button>
                <button
                  onClick={handleResign}
                  disabled={gameOver || isThinking}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Flag className="w-4 h-4" /> 항복
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium text-sm transition"
                >
                  새 게임
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 점수판 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">점수판</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-stone-900 inline-block" />
                    <span className="text-sm font-medium text-stone-700">흑 {gameMode === 'ai' ? '(나)' : ''}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">잡은 돌: <span className="font-bold text-stone-800">{captures.black}</span></div>
                    {finalScore && <div className="text-sm font-bold text-stone-900">{finalScore.black.toFixed(1)}점</div>}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white border-2 border-gray-300 inline-block" />
                    <span className="text-sm font-medium text-stone-700">백 {gameMode === 'ai' ? '(AI)' : ''}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">잡은 돌: <span className="font-bold text-stone-800">{captures.white}</span></div>
                    {finalScore && <div className="text-sm font-bold text-stone-900">{finalScore.white.toFixed(1)}점</div>}
                  </div>
                </div>
                <div className="text-center text-xs text-gray-400 pt-1">
                  중국식 계가 · 덤 6.5 (백 유리)
                </div>
              </div>
            </div>

            {/* 게임 정보 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">게임 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">모드</span>
                  <span className="font-bold">{gameMode === 'ai' ? `AI ${DIFFICULTY_LABELS[difficulty]}` : '2인 대전'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 수</span>
                  <span className="font-bold">{moveCount}수</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">현재 차례</span>
                  <span className={`font-bold ${currentPlayer === BLACK ? 'text-stone-900' : 'text-gray-600'}`}>
                    {gameOver ? '종료' : isThinking ? 'AI 사고 중...' : currentPlayer === BLACK ? (gameMode === 'ai' ? '내 차례' : '흑돌') : (gameMode === 'ai' ? 'AI 차례' : '백돌')}
                  </span>
                </div>
              </div>
            </div>

            {/* 바둑 규칙 */}
            <div className="bg-amber-50 rounded-xl shadow-md p-4">
              <h3 className="font-bold text-amber-800 mb-2 text-sm">바둑 규칙</h3>
              <ul className="text-xs space-y-1 text-amber-700">
                <li>• 흑 먼저, 교대 착수</li>
                <li>• 활로를 모두 막으면 따먹기</li>
                <li>• 자살수 금지</li>
                <li>• 패(Ko): 직전 상태 반복 금지</li>
                <li>• 양쪽 패스 → 계가 (게임 종료)</li>
                <li>• 중국식: 돌 + 집 = 점수</li>
                <li>• 백에게 덤 6.5점 추가</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowResult(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">
              {resigned ? '\u{1F3F3}\u{FE0F}' : finalScore && finalScore.black > finalScore.white ? '\u26AB' : '\u26AA'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">게임 종료</h2>
            <p className="text-lg text-gray-600 mb-6">{winner}</p>

            {!resigned && finalScore && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full bg-stone-900 inline-block" />
                    <span className="text-sm font-medium text-gray-600">흑</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">{finalScore.black.toFixed(1)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="w-3 h-3 rounded-full bg-white border border-gray-400 inline-block" />
                    <span className="text-sm font-medium text-gray-600">백</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">{finalScore.white.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">(덤 6.5 포함)</div>
                </div>
              </div>
            )}

            <button
              onClick={() => { setShowResult(false); reset(); }}
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-medium transition"
            >
              새 게임
            </button>
            <button
              onClick={() => setShowResult(false)}
              className="w-full py-2 mt-2 text-gray-500 hover:text-gray-700 text-sm transition"
            >
              보드 확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
