import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, RotateCcw, Trophy, Settings, User, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 오목 (Gomoku) - 15×15 보드, 3-3/4-4 금수, 입체 돌
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
// 게임 로직
// ============================================================================
class GomokuRules {
  // 8방향
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
      
      if (count === 5) return true;
    }
    return false;
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
    let stones: {r: number, c: number}[] = [{r: row, c: col}];
    
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
    let stones: {r: number, c: number}[] = [{r: row, c: col}];
    
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
// AI
// ============================================================================
class GomokuAI {
  private difficulty: Difficulty;
  private myStone: 'black' | 'white';
  private opponentStone: 'black' | 'white';

  constructor(difficulty: Difficulty, stone: 'black' | 'white') {
    this.difficulty = difficulty;
    this.myStone = stone;
    this.opponentStone = stone === 'black' ? 'white' : 'black';
  }

  getMove(board: Stone[][]): { row: number; col: number } | null {
    const emptySpots: { row: number; col: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === null) emptySpots.push({ row: r, col: c });
      }
    }
    
    if (emptySpots.length === 0) return null;

    switch (this.difficulty) {
      case 1: return this.randomMove(emptySpots);
      case 2: return this.strategicMove(board, emptySpots);
      case 3: return this.advancedMove(board, emptySpots);
      default: return this.randomMove(emptySpots);
    }
  }

  private randomMove(spots: { row: number; col: number }[]): { row: number; col: number } {
    return spots[Math.floor(Math.random() * spots.length)];
  }

  private strategicMove(board: Stone[][], spots: { row: number; col: number }[]): { row: number; col: number } {
    // 1. 승리 수 체크
    for (const spot of spots) {
      const testBoard = board.map(r => [...r]);
      testBoard[spot.row][spot.col] = this.myStone;
      if (GomokuRules.checkWin(testBoard, spot.row, spot.col, this.myStone)) {
        return spot;
      }
    }

    // 2. 상대 승리 방어
    for (const spot of spots) {
      const testBoard = board.map(r => [...r]);
      testBoard[spot.row][spot.col] = this.opponentStone;
      if (GomokuRules.checkWin(testBoard, spot.row, spot.col, this.opponentStone)) {
        return spot;
      }
    }

    // 3. 4목 만들기
    for (const spot of spots) {
      if (this.myStone === 'black' && !GomokuRules.canPlace(board, spot.row, spot.col, 'black')) continue;
      const testBoard = board.map(r => [...r]);
      testBoard[spot.row][spot.col] = this.myStone;
      if (GomokuRules.checkWin(testBoard, spot.row, spot.col, this.myStone)) {
        return spot;
      }
    }

    // 4. 중앙 또는 돌 주변에 두기
    const center = Math.floor(BOARD_SIZE / 2);
    const nearStones = spots.filter(s => {
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const r = s.row + dr, c = s.col + dc;
          if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] !== null) {
            return true;
          }
        }
      }
      return false;
    });

    if (nearStones.length > 0) {
      return nearStones[Math.floor(Math.random() * nearStones.length)];
    }

    return spots[Math.floor(Math.random() * spots.length)];
  }

  private advancedMove(board: Stone[][], spots: { row: number; col: number }[]): { row: number; col: number } {
    let bestScore = -Infinity;
    let bestMove = spots[0];

    for (const spot of spots) {
      if (this.myStone === 'black' && !GomokuRules.canPlace(board, spot.row, spot.col, 'black')) continue;
      
      const score = this.evaluatePosition(board, spot.row, spot.col);
      if (score > bestScore) {
        bestScore = score;
        bestMove = spot;
      }
    }

    return bestMove;
  }

  private evaluatePosition(board: Stone[][], row: number, col: number): number {
    let score = 0;
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = this.myStone;

    // 승리 수
    if (GomokuRules.checkWin(testBoard, row, col, this.myStone)) return 100000;

    // 4목
    for (const [dr, dc] of GomokuRules.directions) {
      if (GomokuRules.isFour(testBoard, row, col, dr, dc, this.myStone)) score += 10000;
    }

    // 열린 3목
    for (const [dr, dc] of GomokuRules.directions) {
      if (GomokuRules.isOpenThree(testBoard, row, col, dr, dc, this.myStone)) score += 1000;
    }

    // 중앙 가산점
    const center = Math.floor(BOARD_SIZE / 2);
    const dist = Math.abs(row - center) + Math.abs(col - center);
    score += (14 - dist) * 10;

    return score;
  }
}

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
  const [showSettings, setShowSettings] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [moves, setMoves] = useState<{row: number, col: number, stone: 'black' | 'white'}[]>([]);
  const [invalidMove, setInvalidMove] = useState<{row: number, col: number} | null>(null);

  const ai = useMemo(() => new GomokuAI(difficulty, 'white'), [difficulty]);

  const handlePlaceStone = useCallback((row: number, col: number, isAI = false) => {
    if (board[row][col] !== null || winner) return;
    if (!isAI && gameMode === 'ai' && currentStone === 'white') return;

    // 돌 금수 체크
    if (currentStone === 'black' && !GomokuRules.canPlace(board, row, col, 'black')) {
      setInvalidMove({ row, col });
      setTimeout(() => setInvalidMove(null), 1000);
      return;
    }

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentStone;
    
    setBoard(newBoard);
    setMoves(prev => [...prev, { row, col, stone: currentStone }]);

    // 승리 체크
    if (GomokuRules.checkWin(newBoard, row, col, currentStone)) {
      setWinner(currentStone);
      return;
    }

    // 무승부 체크
    if (moves.length + 1 >= BOARD_SIZE * BOARD_SIZE) {
      setWinner('draw');
      return;
    }

    setCurrentStone(prev => prev === 'black' ? 'white' : 'black');
  }, [board, currentStone, winner, gameMode, moves.length]);

  const reset = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentStone('black');
    setWinner(null);
    setMoves([]);
    setInvalidMove(null);
  };

  // AI 턴 처리
  useEffect(() => {
    if (gameMode === 'ai' && currentStone === 'white' && !winner) {
      setIsThinking(true);
      setTimeout(() => {
        const move = ai.getMove(board);
        if (move) {
          handlePlaceStone(move.row, move.col, true);
        }
        setIsThinking(false);
      }, 800);
    }
  }, [currentStone, gameMode, board, winner, ai, handlePlaceStone]);

  const undo = () => {
    if (moves.length === 0) return;
    const newBoard = board.map(r => [...r]);
    const lastMove = moves[moves.length - 1];
    newBoard[lastMove.row][lastMove.col] = null;
    setBoard(newBoard);
    setMoves(prev => prev.slice(0, -1));
    setCurrentStone(lastMove.stone);
    setWinner(null);
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
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">설정</span>
            </button>
          </div>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">게임 모드</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => { setGameMode('pvp'); reset(); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'pvp' ? 'bg-white shadow text-stone-800' : 'text-gray-600'}`}
                  >
                    <User className="w-4 h-4 inline mr-1" />2인
                  </button>
                  <button 
                    onClick={() => { setGameMode('ai'); reset(); }}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'ai' ? 'bg-white shadow text-stone-800' : 'text-gray-600'}`}
                  >
                    <Bot className="w-4 h-4 inline mr-1" />AI
                  </button>
                </div>
              </div>
              
              {gameMode === 'ai' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">AI 난이도</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)}
                    className="w-full px-3 py-1.5 bg-white border rounded-lg text-sm"
                  >
                    <option value={1}>초급 (랜덤)</option>
                    <option value={2}>중급 (전략)</option>
                    <option value={3}>고급 (고수)</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              <p className="font-semibold mb-1">게임 규칙</p>
              <ul className="text-xs space-y-0.5 text-amber-700">
                <li>• 가로/세로/대각선으로 5개 연결하면 승리</li>
                <li>• 흑돌은 <strong>3-3 금수</strong> (동시에 두 개의 열린 3 만들기 금지)</li>
                <li>• 흑돌은 <strong>4-4 금수</strong> (동시에 두 개의 4 만들기 금지)</li>
                <li>• 흑돌은 <strong>장목(6목+)</strong> 금지</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
                  <span className={`font-semibold ${currentStone === 'black' ? 'text-stone-900' : 'text-gray-400'}`}>흑돌</span>
                </div>

                <div className="flex items-center gap-2">
                  {winner && winner !== 'draw' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold">
                      <Trophy className="w-5 h-5" />
                      {winner === 'black' ? '흑돌' : '백돌'} 승리!
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
                  <span className={`font-semibold ${currentStone === 'white' ? 'text-gray-700' : 'text-gray-400'}`}>백돌</span>
                  <div className={`w-4 h-4 rounded-full border-2 border-gray-300 ${currentStone === 'white' ? 'bg-white shadow-lg' : 'bg-gray-200'}`} />
                </div>
              </div>

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
                <button onClick={undo} disabled={moves.length === 0} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-xl font-medium transition">
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
                  <span className="text-gray-600">총 수</span>
                  <span className="font-bold">{moves.length}수</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">현재 차례</span>
                  <span className={`font-bold ${currentStone === 'black' ? 'text-stone-900' : 'text-gray-600'}`}>
                    {currentStone === 'black' ? '흑돌' : '백돌'}
                  </span>
                </div>
                {gameMode === 'ai' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">AI 난이도</span>
                    <span className="font-bold">
                      {difficulty === 1 ? '초급' : difficulty === 2 ? '중급' : '고급'}
                    </span>
                  </div>
                )}
              </div>
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
