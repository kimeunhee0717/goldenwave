import React, { useState, useEffect, useCallback } from 'react';
import { Target, RotateCcw, Lightbulb, Undo2, Clock } from 'lucide-react';
import SEOHead from '@/components/common/SEOHead'

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════
interface PegPosition {
  row: number;
  col: number;
}

interface Move {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  midRow: number;
  midCol: number;
}

// ═══════════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════════
const BOARD_SIZE = 7;

// 십자가 보드 유효 위치 정의 (영국식)
const VALID_POSITIONS: [number, number][] = [
  [0, 2], [0, 3], [0, 4],
  [1, 2], [1, 3], [1, 4],
  [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
  [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
  [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
  [5, 2], [5, 3], [5, 4],
  [6, 2], [6, 3], [6, 4]
];

const DIRECTIONS = [
  { dr: -2, dc: 0, midR: -1, midC: 0 }, // 위
  { dr: 2, dc: 0, midR: 1, midC: 0 },   // 아래
  { dr: 0, dc: -2, midR: 0, midC: -1 }, // 왼쪽
  { dr: 0, dc: 2, midR: 0, midC: 1 }    // 오른쪽
];

// ═══════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════
export default function PegSolitaireGame() {
  const [board, setBoard] = useState<number[][]>([]);
  const [selectedPeg, setSelectedPeg] = useState<PegPosition | null>(null);
  const [validMoves, setValidMoves] = useState<PegPosition[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showModal, setShowModal] = useState(false);
  const [hintPeg, setHintPeg] = useState<PegPosition | null>(null);

  // Initialize board
  const initBoard = useCallback(() => {
    const newBoard: number[][] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        const isValid = VALID_POSITIONS.some(pos => pos[0] === row && pos[1] === col);
        if (isValid) {
          // 중앙(3,3)은 비어있고, 나머지는 페그로 채움
          newBoard[row][col] = (row === 3 && col === 3) ? 0 : 1;
        } else {
          // 유효하지 않은 위치는 -1로 표시
          newBoard[row][col] = -1;
        }
      }
    }
    return newBoard;
  }, []);

  // Start new game
  const newGame = useCallback(() => {
    setBoard(initBoard());
    setSelectedPeg(null);
    setValidMoves([]);
    setMoveHistory([]);
    setMoveCount(0);
    setTime(0);
    setIsGameActive(true);
    setGameStatus('playing');
    setShowModal(false);
    setHintPeg(null);
  }, [initBoard]);

  // Initialize on mount
  useEffect(() => {
    newGame();
  }, [newGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isGameActive) {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGameActive]);

  // Count pegs
  const countPegs = useCallback(() => {
    let count = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row]?.[col] === 1) count++;
      }
    }
    return count;
  }, [board]);

  // Get valid moves for a peg
  const getValidMoves = useCallback((row: number, col: number): Move[] => {
    const moves: Move[] = [];
    
    DIRECTIONS.forEach(dir => {
      const toRow = row + dir.dr;
      const toCol = col + dir.dc;
      const midRow = row + dir.midR;
      const midCol = col + dir.midC;
      
      // 보드 범위 체크
      if (toRow < 0 || toRow >= BOARD_SIZE || toCol < 0 || toCol >= BOARD_SIZE) return;
      
      // 이동 가능 조건:
      // 1. 도착지가 비어있음 (0)
      // 2. 중간에 페그가 있음 (1)
      if (board[toRow]?.[toCol] === 0 && board[midRow]?.[midCol] === 1) {
        moves.push({ toRow, toCol, midRow, midCol, fromRow: row, fromCol: col });
      }
    });
    
    return moves;
  }, [board]);

  // Check if any valid move exists
  const hasAnyValidMove = useCallback(() => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row]?.[col] === 1) {
          const moves = getValidMoves(row, col);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }, [board, getValidMoves]);

  // Check game end
  useEffect(() => {
    if (!isGameActive || board.length === 0) return;
    
    const pegsLeft = countPegs();
    
    // 승리: 1개의 페그만 남음
    if (pegsLeft === 1) {
      setGameStatus('won');
      setIsGameActive(false);
      setShowModal(true);
      return;
    }
    
    // 패배: 더 이상 이동할 수 없음
    if (!hasAnyValidMove()) {
      setGameStatus('lost');
      setIsGameActive(false);
      setShowModal(true);
    }
  }, [board, isGameActive, countPegs, hasAnyValidMove]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!isGameActive) return;
    
    // 유효하지 않은 위치 클릭 무시
    if (board[row]?.[col] === -1) return;
    
    // 페그가 있는 위치 클릭
    if (board[row][col] === 1) {
      if (selectedPeg && selectedPeg.row === row && selectedPeg.col === col) {
        // 같은 페그 다시 클릭하면 선택 해제
        setSelectedPeg(null);
        setValidMoves([]);
      } else {
        // 새 페그 선택
        setSelectedPeg({ row, col });
        const moves = getValidMoves(row, col);
        setValidMoves(moves.map(m => ({ row: m.toRow, col: m.toCol })));
      }
    } 
    // 빈 구멍 클릭
    else if (board[row][col] === 0) {
      if (selectedPeg) {
        // 선택된 페그가 있으면 이동 시도
        tryMove(selectedPeg.row, selectedPeg.col, row, col);
      }
    }
  };

  // Try to move peg
  const tryMove = (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
    const moves = getValidMoves(fromRow, fromCol);
    const move = moves.find(m => m.toRow === toRow && m.toCol === toCol);
    
    if (!move) return; // 유효하지 않은 이동
    
    // 이동 히스토리 저장
    setMoveHistory(prev => [...prev, move]);
    
    // 보드 상태 업데이트
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[fromRow][fromCol] = 0; // 출발지 비우기
      newBoard[toRow][toCol] = 1;     // 도착지에 페그 놓기
      newBoard[move.midRow][move.midCol] = 0; // 중간 페그 제거
      return newBoard;
    });
    
    // 선택 해제
    setSelectedPeg(null);
    setValidMoves([]);
    
    // 이동 횟수 증가
    setMoveCount(prev => prev + 1);
  };

  // Undo move
  const undoMove = () => {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    
    // 보드 상태 복원
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[lastMove.fromRow][lastMove.fromCol] = 1; // 출발지 복구
      newBoard[lastMove.toRow][lastMove.toCol] = 0;     // 도착지 비우기
      newBoard[lastMove.midRow][lastMove.midCol] = 1;   // 중간 페그 복구
      return newBoard;
    });
    
    // 히스토리에서 제거
    setMoveHistory(prev => prev.slice(0, -1));
    
    // 이동 횟수 감소
    setMoveCount(prev => prev - 1);
    
    // 선택 해제
    setSelectedPeg(null);
    setValidMoves([]);
    
    // 게임 상태 복원
    if (!isGameActive) {
      setIsGameActive(true);
      setGameStatus('playing');
      setShowModal(false);
    }
  };

  // Show hint
  const showHint = () => {
    if (!isGameActive) return;
    
    // 가능한 모든 이동 찾기
    const allMoves: Move[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row]?.[col] === 1) {
          const moves = getValidMoves(row, col);
          moves.forEach(move => {
            allMoves.push({ ...move, fromRow: row, fromCol: col });
          });
        }
      }
    }
    
    if (allMoves.length === 0) return;
    
    // 랜덤하게 이동 선택
    const hintMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    
    // 출발지 페그 표시
    setHintPeg({ row: hintMove.fromRow, col: hintMove.fromCol });
    
    // 1.5초 후 힌트 제거
    setTimeout(() => {
      setHintPeg(null);
    }, 1500);
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if cell is valid move target
  const isValidMoveTarget = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col);
  };

  const pegsLeft = countPegs();

  return (
    <div className="min-h-screen bg-oatmeal-50">
      <SEOHead
        title="페그 솔리테어"
        description="혼자 즐기는 클래식 보드게임 페그 솔리테어입니다. 점프하여 핀을 제거하고 마지막 하나만 남겨보세요."
        url="/tools/peg-solitaire"
      />
      {/* Hero */}
      <div className="bg-gradient-to-r from-espresso-800 to-espresso-950 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-golden-100 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-espresso-800" />
            </div>
            <span className="text-golden-200 text-sm font-medium tracking-wider uppercase">
              부자타임 도구
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">페그 솔리테어</h1>
          <p className="text-oatmeal-300 text-base sm:text-lg max-w-xl mx-auto">
            클래식한 두뇌 게임! 페그를 뛰어넘어 마지막까지 최소한의 페그만 남기세요.
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="bg-gradient-to-b from-espresso-950 to-oatmeal-100 py-6 sm:py-10 px-3 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Game Column */}
            <div className="lg:col-span-3 flex flex-col items-center">
              {/* Timer */}
              <div className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock size={18} className="text-golden-200" />
                <span className="text-white font-mono text-lg">{formatTime(time)}</span>
              </div>

              {/* Game Board */}
              <div className="relative">
                <div 
                  className="grid gap-2 p-5 rounded-2xl shadow-2xl"
                  style={{ 
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                    background: 'linear-gradient(145deg, #16213e, #1a1a2e)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {board.map((row, rowIndex) => (
                    row.map((cell, colIndex) => {
                      const isSelected = selectedPeg?.row === rowIndex && selectedPeg?.col === colIndex;
                      const isValidTarget = isValidMoveTarget(rowIndex, colIndex);
                      const isHint = hintPeg?.row === rowIndex && hintPeg?.col === colIndex;
                      const isInvalid = cell === -1;
                      const hasPeg = cell === 1;
                      
                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer transition-all duration-200
                            ${isInvalid ? 'bg-transparent pointer-events-none' : ''}
                            ${!isInvalid && !hasPeg && !isSelected ? 'bg-[#0f3460]' : ''}
                            ${hasPeg && !isSelected ? 'bg-gradient-to-br from-[#e94560] to-[#b91c3c]' : ''}
                            ${isSelected ? 'bg-gradient-to-br from-[#f39c12] to-[#d68910] ring-4 ring-[#f39c12] scale-110 z-10' : ''}
                            ${isValidTarget ? 'ring-2 ring-[#27ae60] animate-pulse' : ''}
                            ${isHint ? 'animate-pulse' : ''}
                          `}
                          style={{
                            boxShadow: hasPeg && !isSelected 
                              ? '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 -2px 5px rgba(0, 0, 0, 0.2), inset 0 2px 5px rgba(255, 255, 255, 0.2)'
                              : !isInvalid 
                                ? 'inset 0 3px 8px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(255, 255, 255, 0.1)'
                                : 'none'
                          }}
                        />
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Info Panel */}
              <div className="flex gap-6 mt-6 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl">
                <div className="text-center">
                  <span className="block text-xs text-white/70 mb-1">남은 페그</span>
                  <span className="block text-2xl font-bold text-[#f39c12]">{pegsLeft}</span>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <span className="block text-xs text-white/70 mb-1">이동 횟수</span>
                  <span className="block text-2xl font-bold text-[#f39c12]">{moveCount}</span>
                </div>
                <div className="w-px bg-white/20" />
                <div className="text-center">
                  <span className="block text-xs text-white/70 mb-1">목표</span>
                  <span className="block text-2xl font-bold text-[#27ae60]">1</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={undoMove}
                  disabled={moveHistory.length === 0}
                  className="flex flex-col items-center gap-1 px-5 py-3 bg-gradient-to-br from-[#e94560] to-[#b91c3c] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <Undo2 size={20} />
                  <span className="text-xs font-medium">되돌리기</span>
                </button>
                <button
                  onClick={showHint}
                  disabled={!isGameActive}
                  className="flex flex-col items-center gap-1 px-5 py-3 bg-gradient-to-br from-[#e94560] to-[#b91c3c] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lightbulb size={20} />
                  <span className="text-xs font-medium">힌트</span>
                </button>
                <button
                  onClick={newGame}
                  className="flex flex-col items-center gap-1 px-5 py-3 bg-gradient-to-br from-[#e94560] to-[#b91c3c] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <RotateCcw size={20} />
                  <span className="text-xs font-medium">새 게임</span>
                </button>
              </div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Game Status Card */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-oatmeal-200 shadow-sm">
                <h3 className="font-bold text-espresso-800 mb-3 text-base">게임 상태</h3>
                <div className="space-y-3">
                  <div className={`px-4 py-3 rounded-lg text-center font-semibold ${
                    gameStatus === 'won' ? 'bg-green-100 text-green-700' :
                    gameStatus === 'lost' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {gameStatus === 'won' ? '🏆 승리!' :
                     gameStatus === 'lost' ? '😢 게임 오버' :
                     '게임 진행 중'}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-espresso-500">남은 페그</span>
                    <span className="font-medium text-espresso-800">{pegsLeft}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-espresso-500">이동 횟수</span>
                    <span className="font-medium text-espresso-800">{moveCount}회</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-espresso-500">진행 시간</span>
                    <span className="font-medium text-espresso-800">{formatTime(time)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-oatmeal-200 shadow-sm">
                <h3 className="font-bold text-espresso-800 mb-3 text-base">진행률</h3>
                <div className="relative h-4 bg-oatmeal-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#e94560] to-[#f39c12] transition-all duration-500"
                    style={{ width: `${((32 - pegsLeft) / 31) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-espresso-500">
                  <span>32개</span>
                  <span>목표: 1개</span>
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
            <h2 className="text-xl font-bold text-espresso-800">페그 솔리테어 팁</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '게임 규칙', desc: '페그를 인접한 페그 위로 뛰어넘어 빈 구멍으로 이동합니다. 뛰어넘은 페그는 제거됩니다.' },
              { title: '승리 조건', desc: '보드에 1개의 페그만 남기면 완벽한 승리! 가능한 한 적은 페그를 남기는 것이 목표입니다.' },
              { title: '전략적 사고', desc: '모서리와 가장자리의 페그는 이동하기 어려우므로 먼저 제거하는 전략을 생각해보세요.' },
              { title: '되돌리기 활용', desc: '잘못된 이동을 했다면 되돌리기 버튼으로 이전 상태로 돌아갈 수 있습니다.' },
              { title: '힌트 기능', desc: '막힌다면 힌트 버튼을 눌러 가능한 이동을 확인하세요. 연습 후에는 스스로 풀어보세요!' },
              { title: '인내심', desc: '페그 솔리테어는 인내심이 필요한 게임입니다. 여러 번 시도하며 최적의 해결책을 찾아보세요.' },
            ].map((tip, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-4 border border-golden-200/60">
                <h4 className="font-semibold text-espresso-800 mb-1.5 text-sm">{tip.title}</h4>
                <p className="text-espresso-600 text-sm leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#16213e] to-[#1a1a2e] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">
              {gameStatus === 'won' ? '🏆' : '😢'}
            </div>
            <h2 className="text-2xl font-bold text-[#f39c12] mb-2">
              {gameStatus === 'won' ? '축하합니다!' : '게임 오버'}
            </h2>
            <p className="text-white/90 mb-6">
              {gameStatus === 'won' 
                ? '완벽한 플레이! 모든 페그를 제거했습니다.' 
                : `더 이상 이동할 수 없습니다. ${pegsLeft}개의 페그가 남았습니다.`}
            </p>
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <span className="block text-xs text-white/60 mb-1">시간</span>
                  <span className="block text-lg font-bold text-white">{formatTime(time)}</span>
                </div>
                <div className="text-center">
                  <span className="block text-xs text-white/60 mb-1">이동</span>
                  <span className="block text-lg font-bold text-white">{moveCount}</span>
                </div>
              </div>
            </div>
            <button
              onClick={newGame}
              className="w-full py-3 bg-gradient-to-r from-[#e94560] to-[#b91c3c] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              다시 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
