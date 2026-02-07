import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, RotateCcw, Trophy, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 오목 (Gomoku) - 15x15 보드, 3-3/4-4 금수, 입체 돌
// ============================================================================

type Stone = 'black' | 'white' | null;
type GameMode = 'pvp' | 'ai';
type Difficulty = 1 | 2 | 3;

const BOARD_SIZE = 15;
const CELL_SIZE = 32;
const PADDING = 24;

// 화점 위치 (중앙 + 4모서리)
const STAR_POINTS = [
  { row: 3, col: 3 }, { row: 3, col: 11 },
  { row: 7, col: 7 },
  { row: 11, col: 3 }, { row: 11, col: 11 }
];

// ============================================================================
// 사운드 시스템 (파일 로딩 방식)
// ============================================================================
const soundCache: Record<string, HTMLAudioElement> = {};

function playSound(name: string) {
  try {
    // 캐시된 오디오가 있으면 클론해서 재생 (동시 재생 지원)
    if (!soundCache[name]) {
      soundCache[name] = new Audio(`/sounds/${name}.mp3`);
    }
    const audio = soundCache[name].cloneNode() as HTMLAudioElement;
    audio.volume = 0.7;
    audio.play().catch(() => { /* 자동재생 차단 시 무시 */ });
  } catch { /* 오디오 미지원 시 무시 */ }
}

function playStoneSound() { playSound('stone'); }
function playForbiddenSound() { playSound('forbidden'); }
function playVictoryFanfare() { playSound('victory'); }

function initAudio() {
  // 사용자 인터랙션 시 첫 사운드 프리로드
  try {
    ['stone', 'forbidden', 'victory'].forEach(name => {
      if (!soundCache[name]) {
        soundCache[name] = new Audio(`/sounds/${name}.mp3`);
        soundCache[name].load();
      }
    });
  } catch { /* ignore */ }
}

// ============================================================================
// 게임 로직
// ============================================================================
class GomokuRules {
  // 4방향
  static directions = [
    [0, 1],   // 가로
    [1, 0],   // 세로
    [1, 1],   // 대각선 ↘
    [1, -1],  // 대각선 ↙
  ];

  // 돌 놓기 가능 여부 체크
  static canPlace(board: Stone[][], row: number, col: number, stone: 'black' | 'white'): boolean {
    if (board[row][col] !== null) return false;
    if (stone === 'white') return true; // 백은 금수 없음

    // 흑돌만 금수 체크
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = stone;

    if (this.checkOverline(testBoard, row, col)) return false; // 장목
    if (this.checkDoubleThree(testBoard, row, col)) return false; // 3-3 금수
    if (this.checkDoubleFour(testBoard, row, col)) return false; // 4-4 금수

    return true;
  }

  // 금수 종류 반환 (표시용)
  static getForbiddenType(board: Stone[][], row: number, col: number): string | null {
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = 'black';

    if (this.checkOverline(testBoard, row, col)) return '장목';
    if (this.checkDoubleThree(testBoard, row, col)) return '3-3 금수';
    if (this.checkDoubleFour(testBoard, row, col)) return '4-4 금수';
    return null;
  }

  // 5목 체크
  static checkWin(board: Stone[][], row: number, col: number, stone: 'black' | 'white'): boolean {
    for (const [dr, dc] of this.directions) {
      let count = 1;

      // 양방향 체크
      for (const dir of [1, -1]) {
        let r = row + dr * dir;
        let c = col + dc * dir;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
          count++;
          r += dr * dir;
          c += dc * dir;
        }
      }

      // 흑: 정확히 5목만 승리 (6목+ = 장목 금수)
      // 백: 5목 이상이면 모두 승리
      if (stone === 'black' ? count === 5 : count >= 5) return true;
    }
    return false;
  }

  // 승리 라인 좌표 반환
  static getWinLine(board: Stone[][], row: number, col: number, stone: 'black' | 'white'): {row: number, col: number}[] | null {
    for (const [dr, dc] of this.directions) {
      const line: {row: number, col: number}[] = [{row, col}];

      for (const dir of [1, -1]) {
        let r = row + dr * dir;
        let c = col + dc * dir;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
          line.push({row: r, col: c});
          r += dr * dir;
          c += dc * dir;
        }
      }

      // 흑: 정확히 5, 백: 5 이상
      if (stone === 'black' ? line.length === 5 : line.length >= 5) return line;
    }
    return null;
  }

  // 장목(6목+) 체크
  static checkOverline(board: Stone[][], row: number, col: number): boolean {
    const stone = board[row][col];
    if (!stone) return false;

    for (const [dr, dc] of this.directions) {
      let count = 1;
      for (const dir of [1, -1]) {
        let r = row + dr * dir;
        let c = col + dc * dir;
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
          count++;
          r += dr * dir;
          c += dc * dir;
        }
      }
      if (count > 5) return true;
    }
    return false;
  }

  // 3-3 금수 (쌍삼) 체크
  static checkDoubleThree(board: Stone[][], row: number, col: number): boolean {
    const stone = board[row][col];
    if (!stone) return false;

    let openThreeCount = 0;

    for (const [dr, dc] of this.directions) {
      if (this.isOpenThree(board, row, col, dr, dc, stone)) {
        openThreeCount++;
      }
    }

    return openThreeCount >= 2;
  }

  // 열린 3 체크
  static isOpenThree(board: Stone[][], row: number, col: number, dr: number, dc: number, stone: 'black' | 'white'): boolean {
    // 해당 방향으로 돌 개수 세기
    const stones: {r: number, c: number}[] = [{r: row, c: col}];

    for (const dir of [1, -1]) {
      let r = row + dr * dir;
      let c = col + dc * dir;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
        stones.push({r, c});
        r += dr * dir;
        c += dc * dir;
      }
    }

    if (stones.length !== 3) return false;

    // 양쪽 끝이 비어있는지 체크
    stones.sort((a, b) => (a.r - b.r) * dr + (a.c - b.c) * dc);
    const first = stones[0];
    const last = stones[stones.length - 1];

    const beforeR = first.r - dr;
    const beforeC = first.c - dc;
    const afterR = last.r + dr;
    const afterC = last.c + dc;

    const beforeEmpty = beforeR >= 0 && beforeR < BOARD_SIZE && beforeC >= 0 && beforeC < BOARD_SIZE && board[beforeR][beforeC] === null;
    const afterEmpty = afterR >= 0 && afterR < BOARD_SIZE && afterC >= 0 && afterC < BOARD_SIZE && board[afterR][afterC] === null;

    return beforeEmpty && afterEmpty;
  }

  // 4-4 금수 (쌍사) 체크
  static checkDoubleFour(board: Stone[][], row: number, col: number): boolean {
    const stone = board[row][col];
    if (!stone) return false;

    let fourCount = 0;

    for (const [dr, dc] of this.directions) {
      if (this.isFour(board, row, col, dr, dc, stone)) {
        fourCount++;
      }
    }

    return fourCount >= 2;
  }

  // 4 체크 (열린4 또는 닫힌4)
  static isFour(board: Stone[][], row: number, col: number, dr: number, dc: number, stone: 'black' | 'white'): boolean {
    const stones: {r: number, c: number}[] = [{r: row, c: col}];

    for (const dir of [1, -1]) {
      let r = row + dr * dir;
      let c = col + dc * dir;
      while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
        stones.push({r, c});
        r += dr * dir;
        c += dc * dir;
      }
    }

    return stones.length === 4;
  }
}

// ============================================================================
// AI — Web Worker로 별도 스레드에서 실행 (UI 멈춤 방지)
// ============================================================================
import GomokuWorker from '../../workers/gomokuAI.worker?worker';

// ============================================================================
// 메인 컴포넌트
// ============================================================================
export default function GomokuGame() {
  const [board, setBoard] = useState<Stone[][]>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentStone, setCurrentStone] = useState<'black' | 'white'>('black');
  const [winner, setWinner] = useState<'black' | 'white' | 'draw' | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [playerColor, setPlayerColor] = useState<'black' | 'white'>('black');
  const aiColor: 'black' | 'white' = playerColor === 'black' ? 'white' : 'black';
  const [isThinking, setIsThinking] = useState(false);
  const [moves, setMoves] = useState<{row: number, col: number, stone: 'black' | 'white'}[]>([]);
  const [invalidMove, setInvalidMove] = useState<{row: number, col: number} | null>(null);
  const [winLine, setWinLine] = useState<{row: number, col: number}[] | null>(null);
  const [forbiddenMsg, setForbiddenMsg] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);

  const workerRef = useRef<Worker | null>(null);

  // Worker 생성/재생성
  useEffect(() => {
    workerRef.current = new GomokuWorker();
    return () => { workerRef.current?.terminate(); };
  }, []);

  const handlePlaceStone = useCallback((row: number, col: number, isAI = false) => {
    if (!isAI && isThinking) return; // AI 생각 중 사용자 클릭만 무시
    if (board[row][col] !== null || winner) return;
    if (!isAI && gameMode === 'ai' && currentStone === aiColor) return;

    // 첫 클릭 시 오디오 초기화
    if (!isAI) initAudio();

    // 돌 금수 체크
    if (currentStone === 'black' && !GomokuRules.canPlace(board, row, col, 'black')) {
      setInvalidMove({ row, col });
      const type = GomokuRules.getForbiddenType(board, row, col);
      setForbiddenMsg(type ? `금수입니다! (${type})` : '금수입니다!');
      if (soundRef.current) playForbiddenSound();
      setTimeout(() => { setInvalidMove(null); setForbiddenMsg(null); }, 2000);
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentStone;

    setBoard(newBoard);
    setMoves(prev => [...prev, { row, col, stone: currentStone }]);

    // 착수 사운드
    if (soundRef.current) playStoneSound();

    // 승리 체크
    if (GomokuRules.checkWin(newBoard, row, col, currentStone)) {
      const line = GomokuRules.getWinLine(newBoard, row, col, currentStone);
      setWinLine(line);
      setWinner(currentStone);
      if (soundRef.current) setTimeout(() => playVictoryFanfare(), 200);
      return;
    }

    // 무승부 체크
    if (moves.length + 1 >= BOARD_SIZE * BOARD_SIZE) {
      setWinner('draw');
      return;
    }

    setCurrentStone(prev => prev === 'black' ? 'white' : 'black');
  }, [board, currentStone, winner, gameMode, moves.length, isThinking, aiColor]);

  const reset = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentStone('black');
    setWinner(null);
    setMoves([]);
    setInvalidMove(null);
    setWinLine(null);
    setForbiddenMsg(null);
  };

  // handlePlaceStone을 ref로 유지 (useEffect 의존성에서 제외)
  const placeStoneRef = useRef(handlePlaceStone);
  useEffect(() => { placeStoneRef.current = handlePlaceStone; }, [handlePlaceStone]);

  // AI 턴 처리 (Web Worker) — ref 가드로 중복 발송 방지
  const aiPendingRef = useRef(false);

  useEffect(() => {
    if (gameMode !== 'ai' || currentStone !== aiColor || winner) return;
    if (aiPendingRef.current) return; // ref로 중복 방지 (의존성 안 탐)
    if (!workerRef.current) return;

    aiPendingRef.current = true;
    setIsThinking(true);
    const worker = workerRef.current;
    let cancelled = false;

    const handler = (e: MessageEvent) => {
      worker.removeEventListener('message', handler);
      if (cancelled) return;
      const { move } = e.data;
      if (move) {
        placeStoneRef.current(move.row, move.col, true);
      }
      aiPendingRef.current = false;
      setIsThinking(false);
    };
    worker.addEventListener('message', handler);
    worker.postMessage({ board, difficulty, myStone: aiColor });

    return () => {
      cancelled = true;
      worker.removeEventListener('message', handler);
      aiPendingRef.current = false;
      setIsThinking(false);
    };
  }, [currentStone, gameMode, winner, board, difficulty, aiColor]);

  const undo = () => {
    if (moves.length === 0 || isThinking) return;

    if (gameMode === 'ai' && moves.length >= 2) {
      // AI 수 + 내 수 2개 동시 취소
      const newBoard = board.map(r => [...r]);
      const last2 = moves.slice(-2);
      last2.forEach(m => { newBoard[m.row][m.col] = null; });
      setBoard(newBoard);
      setMoves(prev => prev.slice(0, -2));
      setCurrentStone(playerColor); // 항상 내 차례로
    } else {
      // PvP: 1수 취소
      const newBoard = board.map(r => [...r]);
      const lastMove = moves[moves.length - 1];
      newBoard[lastMove.row][lastMove.col] = null;
      setBoard(newBoard);
      setMoves(prev => prev.slice(0, -1));
      setCurrentStone(lastMove.stone);
    }
    setWinner(null);
    setWinLine(null);
  };

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
              <h1 className="text-2xl font-bold">오목</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* 사운드 토글 */}
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

      {/* 게임 모드 & AI 난이도 선택 (항상 표시) */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* 게임 모드 */}
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

            {/* AI 설정 (AI 모드일 때만 표시) */}
            {gameMode === 'ai' && (
              <>
                {/* 내 돌 색상 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">내 돌</span>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => { setPlayerColor('black'); reset(); }}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${playerColor === 'black' ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <span className="w-3 h-3 rounded-full bg-stone-900 inline-block" />흑
                    </button>
                    <button
                      onClick={() => { setPlayerColor('white'); reset(); }}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition ${playerColor === 'white' ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <span className="w-3 h-3 rounded-full bg-white border border-gray-300 inline-block" />백
                    </button>
                  </div>
                </div>

                {/* 난이도 */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">난이도</span>
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    {([1, 2, 3] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        onClick={() => { setDifficulty(d); reset(); }}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${difficulty === d ? 'bg-white shadow text-stone-800' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {d === 1 ? '초급' : d === 2 ? '중급' : '고급'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
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
                  <div className={`w-4 h-4 rounded-full ${currentStone === 'black' ? 'bg-stone-900 shadow-lg' : 'bg-stone-300'}`} />
                  <span className={`font-semibold ${currentStone === 'black' ? 'text-stone-900' : 'text-gray-400'}`}>
                    {gameMode === 'ai' && aiColor === 'black' ? 'AI' : '흑돌'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {winner && winner !== 'draw' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold">
                      <Trophy className="w-5 h-5" />
                      {gameMode === 'ai'
                        ? (winner === playerColor ? '승리!' : 'AI 승리!')
                        : (winner === 'black' ? '흑돌' : '백돌') + ' 승리!'}
                    </div>
                  )}
                  {winner === 'draw' && (
                    <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold">
                      무승부
                    </div>
                  )}
                  {isThinking && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${currentStone === 'white' ? 'text-gray-700' : 'text-gray-400'}`}>
                    {gameMode === 'ai' && aiColor === 'white' ? 'AI' : '백돌'}
                  </span>
                  <div className={`w-4 h-4 rounded-full border-2 border-gray-300 ${currentStone === 'white' ? 'bg-white shadow-lg' : 'bg-gray-200'}`} />
                </div>
              </div>

              {/* 금수 토스트 메시지 */}
              {forbiddenMsg && (
                <div className="flex justify-center mb-2">
                  <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-semibold animate-pulse">
                    {forbiddenMsg}
                  </div>
                </div>
              )}

              {/* SVG 보드 */}
              <div className="flex justify-center">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-md select-none">
                  <defs>
                    <linearGradient id="boardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f5e6c8" />
                      <stop offset="50%" stopColor="#e8d4a0" />
                      <stop offset="100%" stopColor="#d4b896" />
                    </linearGradient>
                    {/* 흑돌 그라데이션 */}
                    <radialGradient id="blackStone" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#4a4a4a" />
                      <stop offset="40%" stopColor="#1a1a1a" />
                      <stop offset="100%" stopColor="#000000" />
                    </radialGradient>
                    {/* 백돌 그라데이션 */}
                    <radialGradient id="whiteStone" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#f0f0f0" />
                      <stop offset="100%" stopColor="#d0d0d0" />
                    </radialGradient>
                    {/* 그림자 필터 */}
                    <filter id="stoneShadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.4"/>
                    </filter>
                  </defs>

                  {/* 보드 배경 */}
                  <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#boardGrad)" rx="8" />

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

                  {/* 승리 라인 하이라이트 */}
                  {winLine && winLine.map((p, i) => (
                    <circle
                      key={`win-${i}`}
                      cx={getX(p.col)}
                      cy={getY(p.row)}
                      r="14"
                      fill="#fbbf24"
                      opacity="0.4"
                    />
                  ))}

                  {/* 금수 표시 */}
                  {invalidMove && (
                    <g>
                      <circle
                        cx={getX(invalidMove.col)}
                        cy={getY(invalidMove.row)}
                        r="12"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3"
                      />
                      <line x1={getX(invalidMove.col) - 8} y1={getY(invalidMove.row) - 8} x2={getX(invalidMove.col) + 8} y2={getY(invalidMove.row) + 8} stroke="#ef4444" strokeWidth="3" />
                      <line x1={getX(invalidMove.col) + 8} y1={getY(invalidMove.row) - 8} x2={getX(invalidMove.col) - 8} y2={getY(invalidMove.row) + 8} stroke="#ef4444" strokeWidth="3" />
                    </g>
                  )}

                  {/* 돌 */}
                  {board.map((row, r) =>
                    row.map((stone, c) => {
                      if (!stone) return null;
                      return (
                        <g key={`stone-${r}-${c}`} filter="url(#stoneShadow)">
                          <circle
                            cx={getX(c)}
                            cy={getY(r)}
                            r="13"
                            fill={stone === 'black' ? 'url(#blackStone)' : 'url(#whiteStone)'}
                            stroke={stone === 'white' ? '#ccc' : 'none'}
                            strokeWidth="1"
                          />
                          {/* 하이라이트 */}
                          <circle
                            cx={getX(c) - 4}
                            cy={getY(r) - 4}
                            r="4"
                            fill="white"
                            opacity={stone === 'black' ? '0.3' : '0.6'}
                          />
                        </g>
                      );
                    })
                  )}

                  {/* 마지막 수 표시 */}
                  {moves.length > 0 && (
                    <g>
                      {(() => {
                        const last = moves[moves.length - 1];
                        return (
                          <circle
                            cx={getX(last.col)}
                            cy={getY(last.row)}
                            r="16"
                            fill="none"
                            stroke={last.stone === 'black' ? '#fff' : '#000'}
                            strokeWidth="2"
                            opacity="0.5"
                          />
                        );
                      })()}
                    </g>
                  )}
                </svg>
              </div>

              {/* 컨트롤 */}
              <div className="flex justify-center gap-3 mt-4">
                <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition">
                  <RotateCcw className="w-4 h-4" />
                  새 게임
                </button>
                <button onClick={undo} disabled={moves.length === 0 || isThinking} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl font-medium transition">
                  무르기
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 게임 정보 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">게임 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">모드</span>
                  <span className="font-bold">{gameMode === 'ai' ? `AI ${difficulty === 1 ? '초급' : difficulty === 2 ? '중급' : '고급'} (나:${playerColor === 'black' ? '흑' : '백'})` : '2인 대전'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">총 수</span>
                  <span className="font-bold">{moves.length}수</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">현재 차례</span>
                  <span className={`font-bold ${currentStone === 'black' ? 'text-stone-900' : 'text-gray-600'}`}>
                    {gameMode === 'ai'
                      ? (currentStone === aiColor ? 'AI 차례' : '내 차례')
                      : (currentStone === 'black' ? '흑돌' : '백돌')}
                  </span>
                </div>
              </div>
            </div>

            {/* 게임 규칙 */}
            <div className="bg-amber-50 rounded-xl shadow-md p-4">
              <h3 className="font-bold text-amber-800 mb-2 text-sm">게임 규칙</h3>
              <ul className="text-xs space-y-0.5 text-amber-700">
                <li>• 5개 연결하면 승리</li>
                <li>• 흑: 3-3 / 4-4 / 장목 금수</li>
              </ul>
            </div>

            {/* 최근 수 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">최근 수</h3>
              <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                {moves.length === 0 ? (
                  <p className="text-gray-400 text-xs">아직 수가 없습니다</p>
                ) : (
                  moves.slice(-10).map((m, i) => {
                    const actualIndex = moves.length - 10 + i;
                    return (
                      <div key={actualIndex} className={`flex items-center gap-2 p-1.5 rounded ${m.stone === 'black' ? 'bg-stone-100' : 'bg-gray-50'}`}>
                        <span className="text-xs text-gray-400 w-8">{actualIndex + 1}.</span>
                        <div className={`w-3 h-3 rounded-full ${m.stone === 'black' ? 'bg-stone-900' : 'bg-white border border-gray-300'}`} />
                        <span className="text-xs font-mono">
                          {String.fromCharCode(97 + m.col)}{BOARD_SIZE - m.row}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
