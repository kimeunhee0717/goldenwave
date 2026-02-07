import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, RotateCcw, Trophy, Lightbulb, Timer, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 스도쿠 (Sudoku) - Phase 1 완료, Phase 2-1 진행중
// ============================================================================

const BOARD_SIZE = 9;
const BOX_SIZE = 3;
const CELL_SIZE = 48;

// 난이도 설정
const DIFFICULTY = {
  easy: { name: '쉬움', clues: 40, color: 'bg-green-100 text-green-800' },
  medium: { name: '중간', clues: 32, color: 'bg-yellow-100 text-yellow-800' },
  hard: { name: '어려움', clues: 26, color: 'bg-orange-100 text-orange-800' },
  expert: { name: '전문가', clues: 23, color: 'bg-red-100 text-red-800' },
};

// 스도쿠 셀 타입
interface Cell {
  value: number | null;
  isFixed: boolean;
  isValid: boolean;
  isHinted: boolean;
  notes: number[];
}

// 퍼즐 생성 결과 타입
interface PuzzleResult {
  puzzle: Cell[][];
  solution: number[][];
}

// ============================================================================
// 스도쿠 생성 알고리즘 (Phase 3)
// ============================================================================
class SudokuGenerator {
  // 빈 보드 생성
  static createEmptyBoard(): Cell[][] {
    return Array(BOARD_SIZE).fill(null).map(() =>
      Array(BOARD_SIZE).fill(null).map(() => ({
        value: null,
        isFixed: false,
        isValid: true,
        isHinted: false,
        notes: [],
      }))
    );
  }

  // 보드가 유효한지 체크
  static isValid(board: number[][], row: number, col: number, num: number): boolean {
    // 행 체크
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (c !== col && board[row][c] === num) return false;
    }
    
    // 열 체크
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (r !== row && board[r][col] === num) return false;
    }
    
    // 3x3 박스 체크
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let r = boxRow; r < boxRow + BOX_SIZE; r++) {
      for (let c = boxCol; c < boxCol + BOX_SIZE; c++) {
        if ((r !== row || c !== col) && board[r][c] === num) return false;
      }
    }
    
    return true;
  }

  // 완성된 보드 생성 (백트래킹)
  static generateCompleteBoard(): number[][] {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    const fillBoard = (pos: number): boolean => {
      if (pos === BOARD_SIZE * BOARD_SIZE) return true;
      
      const row = Math.floor(pos / BOARD_SIZE);
      const col = pos % BOARD_SIZE;
      
      // 1-9 랜덤 순서
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      
      for (const num of numbers) {
        if (this.isValid(board, row, col, num)) {
          board[row][col] = num;
          if (fillBoard(pos + 1)) return true;
          board[row][col] = 0;
        }
      }
      
      return false;
    };
    
    fillBoard(0);
    return board;
  }

  // 퍼즐 생성 (빈칸 제거)
  static generatePuzzle(clues: number): PuzzleResult {
    const solution = this.generateCompleteBoard();
    const board = this.createEmptyBoard();

    // 정답 복사
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c].value = solution[r][c];
        board[r][c].isFixed = true;
      }
    }

    // 빈칸 제거 (대칭적으로)
    const cellsToRemove = 81 - clues;
    let removed = 0;

    while (removed < cellsToRemove) {
      const r1 = Math.floor(Math.random() * BOARD_SIZE);
      const c1 = Math.floor(Math.random() * BOARD_SIZE);
      const r2 = 8 - r1;
      const c2 = 8 - c1;

      // 중앙 셀 (4,4)인 경우: 대칭점이 자기 자신
      if (r1 === 4 && c1 === 4) {
        if (board[r1][c1].value !== null) {
          board[r1][c1].value = null;
          board[r1][c1].isFixed = false;
          removed += 1;
        }
      } else if (board[r1][c1].value !== null && board[r2][c2].value !== null) {
        board[r1][c1].value = null;
        board[r1][c1].isFixed = false;
        board[r2][c2].value = null;
        board[r2][c2].isFixed = false;
        removed += 2;
      }
    }

    return { puzzle: board, solution };
  }

  // 전체 보드 유효성 재검증 (모든 비고정 셀)
  static validateBoard(board: Cell[][]): void {
    const numBoard = board.map(r => r.map(c => c.value || 0));
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[r][c].isFixed && board[r][c].value !== null) {
          board[r][c].isValid = this.isValid(numBoard, r, c, board[r][c].value!);
        }
      }
    }
  }
}

// ============================================================================
// 메인 컴포넌트 - Phase 2-1: 9×9 격자 디자인
// ============================================================================
// 초기 퍼즐 한 번만 생성 (board/solution 일치 보장)
const initialPuzzle = SudokuGenerator.generatePuzzle(DIFFICULTY.medium.clues);

export default function SudokuGame() {
  const [board, setBoard] = useState<Cell[][]>(initialPuzzle.puzzle);
  const [solution, setSolution] = useState<number[][]>(initialPuzzle.solution);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY>('medium');
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hints, setHints] = useState(3);
  const [noteMode, setNoteMode] = useState(false);
  const hasLoaded = useRef(false);

  // 게임 불러오기 (저장 데이터가 있으면 복원)
  useEffect(() => {
    const saved = localStorage.getItem('sudoku-game');
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        if (gameState.board && gameState.solution && !gameState.isComplete) {
          setBoard(gameState.board);
          setSolution(gameState.solution);
          setTimer(gameState.timer || 0);
          setDifficulty(gameState.difficulty || 'medium');
          setHints(gameState.hints ?? 3);
          setNoteMode(gameState.noteMode || false);
          hasLoaded.current = true;
          return;
        }
      } catch (e) {
        console.error('Failed to load saved game:', e);
      }
    }
    // 저장 데이터 없으면 새 게임 생성
    const { puzzle, solution: sol } = SudokuGenerator.generatePuzzle(DIFFICULTY.medium.clues);
    setBoard(puzzle);
    setSolution(sol);
    hasLoaded.current = true;
  }, []);

  // 타이머
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  // 자동 저장 (localStorage) — 버그 6 수정: 로드 완료 전에는 저장하지 않음
  useEffect(() => {
    if (!hasLoaded.current) return;
    const gameState = {
      board,
      solution,
      timer,
      difficulty,
      hints,
      isComplete,
      noteMode,
    };
    localStorage.setItem('sudoku-game', JSON.stringify(gameState));
  }, [board, solution, timer, difficulty, hints, isComplete, noteMode]);

  // 새 게임 시작 — 버그 1, 3 수정: solution은 퍼즐에서 추출, 난이도는 매개변수로 받음
  const startNewGame = useCallback((diff: keyof typeof DIFFICULTY) => {
    const { puzzle, solution: sol } = SudokuGenerator.generatePuzzle(DIFFICULTY[diff].clues);
    setBoard(puzzle);
    setSolution(sol);
    setDifficulty(diff);
    setTimer(0);
    setIsComplete(false);
    setHints(3);
    setSelectedCell(null);
    setNoteMode(false);
  }, []);

  // 현재 난이도로 새 게임
  const newGame = useCallback(() => {
    startNewGame(difficulty);
  }, [difficulty, startNewGame]);

  // 셀 선택 — 버그 9 수정: 고정 셀도 선택 가능 (하이라이트용)
  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  // 숫자 입력 — 버그 4, 7, 10, 11, 13 수정
  const inputNumber = useCallback((num: number | null) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (board[row][col].isFixed || board[row][col].isHinted) return;

    const newBoard = board.map(r => r.map(c => ({ ...c })));

    if (noteMode && num !== null) {
      // 메모 모드
      const notes = newBoard[row][col].notes;
      if (notes.includes(num)) {
        newBoard[row][col].notes = notes.filter(n => n !== num);
      } else {
        newBoard[row][col].notes = [...notes, num].sort();
      }
    } else {
      // 일반 입력
      newBoard[row][col].value = num;
      newBoard[row][col].notes = [];

      // 지울 때 isValid 초기화 (버그 11)
      if (num === null) {
        newBoard[row][col].isValid = true;
      }

      // 전체 보드 재검증 (버그 4, 10)
      SudokuGenerator.validateBoard(newBoard);
    }

    setBoard(newBoard);
    checkComplete(newBoard);
  }, [selectedCell, board, noteMode]);

  // 완료 체크 — 버그 7 수정: validateBoard 이후이므로 isValid가 정확함
  const checkComplete = (currentBoard: Cell[][]) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c].value === null) return;
        if (!currentBoard[r][c].isValid) return;
      }
    }
    setIsComplete(true);
  };

  // 힌트 사용 — 버그 1 수정: 올바른 solution 사용
  const useHint = useCallback(() => {
    if (hints <= 0 || !solution.length) return;

    // 빈칸 또는 오답인 비고정 셀 찾기
    const emptyCells: {row: number, col: number}[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!board[r][c].isFixed && !board[r][c].isHinted && board[r][c].value !== solution[r][c]) {
          emptyCells.push({ row: r, col: c });
        }
      }
    }

    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      const newBoard = board.map(r => r.map(c => ({ ...c })));
      newBoard[randomCell.row][randomCell.col].value = solution[randomCell.row][randomCell.col];
      newBoard[randomCell.row][randomCell.col].isValid = true;
      newBoard[randomCell.row][randomCell.col].isHinted = true;
      newBoard[randomCell.row][randomCell.col].notes = [];

      // 힌트 후 전체 재검증
      SudokuGenerator.validateBoard(newBoard);

      setBoard(newBoard);
      setHints(h => h - 1);
      setSelectedCell(randomCell);
      checkComplete(newBoard);
    }
  }, [hints, solution, board]);

  // 키보드 입력 — 버그 8 수정
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 숫자 입력 (1-9)
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        inputNumber(parseInt(e.key));
        return;
      }

      // 지우기
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        inputNumber(null);
        return;
      }

      // 메모 토글
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setNoteMode(prev => !prev);
        return;
      }

      // 방향키
      if (e.key.startsWith('Arrow') && selectedCell) {
        e.preventDefault();
        let { row, col } = selectedCell;
        if (e.key === 'ArrowUp' && row > 0) row--;
        else if (e.key === 'ArrowDown' && row < 8) row++;
        else if (e.key === 'ArrowLeft' && col > 0) col--;
        else if (e.key === 'ArrowRight' && col < 8) col++;
        setSelectedCell({ row, col });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputNumber, selectedCell]);

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 동일 숫자 하이라이트
  const isHighlighted = (row: number, col: number) => {
    if (!selectedCell) return false;
    const selectedValue = board[selectedCell.row][selectedCell.col].value;
    if (!selectedValue) return false;
    return board[row][col].value === selectedValue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-indigo-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tools" className="text-white/70 hover:text-white transition">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">스도쿠</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                <Timer className="w-4 h-4" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 게임 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 보드 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* 상단 컨트롤 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">난이도:</span>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      startNewGame(e.target.value as keyof typeof DIFFICULTY);
                    }}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium"
                  >
                    {Object.entries(DIFFICULTY).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">힌트:</span>
                  <span className="font-bold text-amber-600">{hints}</span>
                </div>
              </div>

              {/* 9×9 스도쿠 보드 - Phase 2-1 */}
              <div className="flex justify-center mb-6">
                <div 
                  className="grid gap-0 bg-gray-800 p-1 rounded-lg"
                  style={{ 
                    gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                  }}
                >
                  {board.map((row, r) => 
                    row.map((cell, c) => {
                      // 3×3 박스 경계선 처리
                      const isRightBorder = (c + 1) % 3 === 0 && c !== 8;
                      const isBottomBorder = (r + 1) % 3 === 0 && r !== 8;
                      
                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => selectCell(r, c)}
                          className={`
                            relative flex items-center justify-center text-xl font-bold transition-all
                            ${cell.isFixed
                              ? 'bg-gray-100 text-gray-900'
                              : cell.isHinted
                                ? 'bg-green-50 text-green-700'
                                : cell.value
                                  ? cell.isValid
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-red-50 text-red-600'
                                  : 'bg-white text-gray-700'
                            }
                            ${selectedCell?.row === r && selectedCell?.col === c
                              ? 'ring-2 ring-indigo-500 z-10'
                              : ''
                            }
                            ${isHighlighted(r, c) && !(selectedCell?.row === r && selectedCell?.col === c) ? 'bg-yellow-100' : ''}
                          `}
                          style={{
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                            border: '1px solid #d1d5db',
                            borderRight: isRightBorder ? '3px solid #1e293b' : undefined,
                            borderBottom: isBottomBorder ? '3px solid #1e293b' : undefined,
                          }}
                        >
                          {cell.value || ''}
                          
                          {/* 메모 노트 */}
                          {!cell.value && cell.notes.length > 0 && (
                            <div className="absolute inset-0 grid grid-cols-3 gap-0 p-0.5">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <div 
                                  key={n} 
                                  className={`text-[8px] flex items-center justify-center ${cell.notes.includes(n) ? 'text-gray-400' : 'text-transparent'}`}
                                >
                                  {n}
                                </div>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 숫자 입력 패드 - Phase 2-3 */}
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => inputNumber(num)}
                    className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-bold text-lg transition"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* 하단 컨트롤 */}
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => inputNumber(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
                >
                  <Trash2 className="w-4 h-4" />
                  지우기
                </button>
                
                <button 
                  onClick={() => setNoteMode(!noteMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    noteMode 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  메모 {noteMode ? 'ON' : 'OFF'}
                </button>
                
                <button 
                  onClick={useHint}
                  disabled={hints <= 0}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-700 rounded-lg font-medium transition"
                >
                  <Lightbulb className="w-4 h-4" />
                  힌트
                </button>
                
                <button 
                  onClick={newGame}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  새 게임
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 게임 정보 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">게임 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">시간</span>
                  <span className="font-mono font-bold">{formatTime(timer)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">난이도</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${DIFFICULTY[difficulty].color}`}>
                    {DIFFICULTY[difficulty].name}
                  </span>
                </div>
              </div>
            </div>

            {/* 규칙 설명 */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">게임 규칙</h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li>• 각 행에 1-9까지 숫자 한 번씩</li>
                <li>• 각 열에 1-9까지 숫자 한 번씩</li>
                <li>• 3×3 박스에 1-9까지 숫자 한 번씩</li>
                <li>• 회색 숫자는 고정 (문제)</li>
                <li>• 파란색은 사용자 입력</li>
                <li>• 초록색은 힌트로 채워진 셀</li>
                <li>• 빨간색은 오류 표시</li>
              </ul>
              <h3 className="font-bold text-gray-800 mt-4 mb-2">키보드 단축키</h3>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li>• <kbd className="px-1 bg-gray-200 rounded text-[10px]">1-9</kbd> 숫자 입력</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded text-[10px]">Del</kbd> 지우기</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded text-[10px]">←↑↓→</kbd> 셀 이동</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded text-[10px]">N</kbd> 메모 토글</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 완료 모달 */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">축하합니다!</h2>
            <p className="text-gray-600 mb-4">
              {DIFFICULTY[difficulty].name} 난이도를<br />
              {formatTime(timer)}에 완료했습니다!
            </p>
            <button 
              onClick={newGame}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition"
            >
              새 게임 시작
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
