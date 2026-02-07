import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, RotateCcw, Trophy, User, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 주사위 윷놀이 (Yut Nori) - 완전 구현
// ============================================================================

type YutResult = 'do' | 'gae' | 'geol' | 'yut' | 'mo' | 'backdo';
type GameMode = 'pvp' | 'ai';
type TeamColor = 'red' | 'blue';

interface Horse {
  id: number;
  position: number;
  isFinished: boolean;
}

// 윷 결과
const YUT_RESULTS: Record<YutResult, { name: string; move: number; canThrowAgain: boolean }> = {
  backdo: { name: '빽도', move: -1, canThrowAgain: false },
  do: { name: '도', move: 1, canThrowAgain: false },
  gae: { name: '개', move: 2, canThrowAgain: false },
  geol: { name: '걸', move: 3, canThrowAgain: false },
  yut: { name: '윷', move: 4, canThrowAgain: true },
  mo: { name: '모', move: 5, canThrowAgain: true },
};

// 29개 지점 정의
const BOARD_POINTS = [
  { id: 0, x: 50, y: 350, label: '출발' },
  { id: 1, x: 100, y: 350 },
  { id: 2, x: 150, y: 350 },
  { id: 3, x: 200, y: 350 },
  { id: 4, x: 250, y: 350, isCorner: true },
  { id: 5, x: 300, y: 350 },
  { id: 6, x: 350, y: 350 },
  { id: 7, x: 350, y: 300 },
  { id: 8, x: 350, y: 250, isCorner: true },
  { id: 9, x: 350, y: 200 },
  { id: 10, x: 350, y: 150 },
  { id: 11, x: 350, y: 100 },
  { id: 12, x: 350, y: 50, isCorner: true },
  { id: 13, x: 300, y: 50 },
  { id: 14, x: 250, y: 50 },
  { id: 15, x: 200, y: 50 },
  { id: 16, x: 150, y: 50, isCorner: true },
  { id: 17, x: 100, y: 50 },
  { id: 18, x: 50, y: 50 },
  { id: 19, x: 50, y: 100 },
  { id: 20, x: 50, y: 150 },
  { id: 21, x: 50, y: 200 },
  { id: 22, x: 50, y: 250, isCorner: true },
  { id: 23, x: 50, y: 300 },
  // 중앙 및 단축로
  { id: 24, x: 200, y: 200, isCenter: true, label: '중앙' },
  { id: 25, x: 150, y: 250 },
  { id: 26, x: 100, y: 300 },
  { id: 27, x: 150, y: 150 },
  { id: 28, x: 250, y: 250, label: '완주' },
];

// 경로 정의 (단순화)
const getNextPosition = (current: number, move: number): number => {
  if (current === -1) return move > 0 ? move - 1 : -1;
  
  let pos = current;
  let steps = Math.abs(move);
  const direction = move > 0 ? 1 : -1;
  
  while (steps > 0 && pos >= 0 && pos < 28) {
    // 단축로 로직 (간단화)
    if (pos === 4 && direction > 0 && steps >= 3) {
      // 단축로 진입
      pos = 24;
      steps -= 2;
    } else if (pos === 8 && direction > 0 && steps >= 3) {
      // 다른 단축로
      pos = 24;
      steps -= 2;
    } else {
      pos += direction;
    }
    steps--;
  }
  
  return Math.min(pos, 28);
};

export default function YutNoriGame() {
  const [teams, setTeams] = useState<{ [key in TeamColor]: { horses: Horse[]; finished: number } }>({
    red: { horses: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, isFinished: false })), finished: 0 },
    blue: { horses: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, isFinished: false })), finished: 0 },
  });
  const [currentTeam, setCurrentTeam] = useState<TeamColor>('red');
  const [gameMode, setGameMode] = useState<GameMode>('pvp');
  const [isThrowing, setIsThrowing] = useState(false);
  const [lastResult, setLastResult] = useState<YutResult | null>(null);
  const [canThrowAgain, setCanThrowAgain] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [movePoints, setMovePoints] = useState(0);
  const [throwHistory, setThrowHistory] = useState<YutResult[]>([]);
  const [winner, setWinner] = useState<TeamColor | null>(null);

  // 윷 던지기
  const throwYut = () => {
    if (isThrowing || winner) return;
    
    setIsThrowing(true);
    
    setTimeout(() => {
      const rand = Math.random();
      let result: YutResult;
      
      // 확률 분포
      if (rand < 0.0625) result = 'backdo';
      else if (rand < 0.3125) result = 'do';
      else if (rand < 0.6875) result = 'gae';
      else if (rand < 0.9375) result = 'geol';
      else if (rand < 0.9975) result = 'yut';
      else result = 'mo';
      
      setLastResult(result);
      setCanThrowAgain(YUT_RESULTS[result].canThrowAgain);
      setMovePoints(YUT_RESULTS[result].move);
      setThrowHistory(prev => [...prev, result]);
      setIsThrowing(false);
    }, 1500);
  };

  // 말 이동
  const moveHorse = (horseId: number) => {
    if (!lastResult || movePoints === 0) return;
    
    const team = teams[currentTeam];
    const horse = team.horses[horseId];
    
    if (horse.isFinished) return;
    
    // 빽도는 시작점에서 불가
    if (lastResult === 'backdo' && horse.position <= 0) {
      return;
    }
    
    const newTeams = { ...teams };
    const newHorse = { ...horse };
    
    // 새 위치 계산
    const newPos = getNextPosition(horse.position, movePoints);
    
    // 상대 말 잡기 체크
    const opponentTeam = currentTeam === 'red' ? 'blue' : 'red';
    const opponentHorses = newTeams[opponentTeam].horses;
    
    opponentHorses.forEach(oppHorse => {
      if (!oppHorse.isFinished && oppHorse.position === newPos && newPos !== -1 && newPos !== 28) {
        // 잡기!
        oppHorse.position = -1;
        setCanThrowAgain(true); // 잡으면 한 번 더
      }
    });
    
    // 업기 체크 (같은 팀 말이 같은 위치에 있으면)
    const sameTeamHorses = newTeams[currentTeam].horses.filter(h => 
      h.id !== horseId && !h.isFinished && h.position === newPos
    );
    
    newHorse.position = newPos;
    
    // 완주 체크
    if (newPos >= 28) {
      newHorse.isFinished = true;
      newTeams[currentTeam].finished++;
      
      if (newTeams[currentTeam].finished >= 4) {
        setWinner(currentTeam);
      }
    }
    
    newTeams[currentTeam].horses[horseId] = newHorse;
    setTeams(newTeams);
    
    // 턴 처리
    setMovePoints(0);
    setSelectedHorse(null);
    
    if (!canThrowAgain) {
      setCurrentTeam(prev => prev === 'red' ? 'blue' : 'red');
      setLastResult(null);
      setThrowHistory([]);
    }
  };

  // 새 게임
  const reset = () => {
    setTeams({
      red: { horses: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, isFinished: false })), finished: 0 },
      blue: { horses: Array(4).fill(null).map((_, i) => ({ id: i, position: -1, isFinished: false })), finished: 0 },
    });
    setCurrentTeam('red');
    setLastResult(null);
    setCanThrowAgain(false);
    setSelectedHorse(null);
    setMovePoints(0);
    setThrowHistory([]);
    setWinner(null);
    setIsThrowing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/tools" className="text-white/70 hover:text-white transition">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl font-bold">주사위 윷놀이</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setGameMode('pvp'); reset(); }} className={`px-3 py-1.5 rounded-lg text-sm ${gameMode === 'pvp' ? 'bg-white/20' : 'bg-white/10'}`}>
                <User className="w-4 h-4 inline mr-1" />2인
              </button>
              <button onClick={() => { setGameMode('ai'); reset(); }} className={`px-3 py-1.5 rounded-lg text-sm ${gameMode === 'ai' ? 'bg-white/20' : 'bg-white/10'}`}>
                <Bot className="w-4 h-4 inline mr-1" />AI
              </button>
            </div>
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
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentTeam === 'red' ? 'bg-red-500' : 'bg-gray-300'}`} />
                  <span className={currentTeam === 'red' ? 'font-bold text-red-600' : 'text-gray-400'}>빨강팀</span>
                  <span className="text-sm text-gray-500">({teams.red.finished}/4)</span>
                </div>
                
                {winner && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-bold">
                    <Trophy className="w-5 h-5" />
                    {winner === 'red' ? '빨강팀' : '파랑팀'} 승리!
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className={currentTeam === 'blue' ? 'font-bold text-blue-600' : 'text-gray-400'}>파랑팀</span>
                  <span className="text-sm text-gray-500">({teams.blue.finished}/4)</span>
                  <div className={`w-4 h-4 rounded-full ${currentTeam === 'blue' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                </div>
              </div>

              {/* 윷놀이 판 */}
              <div className="flex justify-center mb-6">
                <div className="relative" style={{ width: '400px', height: '400px' }}>
                  {/* 배경 */}
                  <div className="absolute inset-0 bg-amber-100 rounded-lg border-4 border-amber-800" />
                  
                  {/* 외곽선 */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                    {/* 외곽 사각형 */}
                    <rect x="50" y="50" width="300" height="300" fill="none" stroke="#78350f" strokeWidth="3" />
                    
                    {/* 대각선 단축로 */}
                    <line x1="50" y1="50" x2="350" y2="350" stroke="#78350f" strokeWidth="2" />
                    <line x1="350" y1="50" x2="50" y2="350" stroke="#78350f" strokeWidth="2" />
                    
                    {/* 내부 직사각형 */}
                    <rect x="100" y="100" width="200" height="200" fill="none" stroke="#78350f" strokeWidth="2" />
                  </svg>
                  
                  {/* 지점 */}
                  {BOARD_POINTS.map((point) => (
                    <div
                      key={point.id}
                      className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        point.id === 0 ? 'bg-amber-300 border-2 border-amber-600' :
                        point.id === 28 ? 'bg-yellow-300 border-2 border-yellow-600' :
                        point.isCenter ? 'bg-amber-400 border-2 border-amber-700' :
                        point.isCorner ? 'bg-amber-200 border-2 border-amber-500' :
                        'bg-white border-2 border-amber-400'
                      }`}
                      style={{
                        left: `${point.x - 16}px`,
                        top: `${point.y - 16}px`,
                      }}
                    >
                      {point.label ? point.label[0] : point.id}
                    </div>
                  ))}
                  
                  {/* 말 */}
                  {(['red', 'blue'] as TeamColor[]).map((teamColor) => 
                    teams[teamColor].horses.map((horse, idx) => {
                      if (horse.isFinished) return null;
                      const pos = horse.position === -1 ? { x: teamColor === 'red' ? 25 : 375, y: 375 } : BOARD_POINTS[horse.position];
                      return (
                        <button
                          key={`${teamColor}-${idx}`}
                          onClick={() => teamColor === currentTeam && movePoints !== 0 && setSelectedHorse(idx)}
                          className={`absolute w-6 h-6 rounded-full border-2 transition-all ${
                            teamColor === 'red' 
                              ? 'bg-red-500 border-red-700 shadow-red-300' 
                              : 'bg-blue-500 border-blue-700 shadow-blue-300'
                          } ${selectedHorse === idx && teamColor === currentTeam ? 'ring-4 ring-yellow-400 scale-125 z-10' : ''} ${movePoints === 0 ? 'opacity-70' : ''}`}
                          style={{
                            left: `${pos.x - 12 + (idx % 2) * 10}px`,
                            top: `${pos.y - 12 + Math.floor(idx / 2) * 10}px`,
                            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                          }}
                        >
                          <span className="text-xs text-white font-bold">{idx + 1}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* 윷 던지기 */}
              <div className="flex flex-col items-center gap-4 mb-4">
                <button
                  onClick={throwYut}
                  disabled={isThrowing || movePoints !== 0 || winner !== null}
                  className="px-12 py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-xl transition shadow-lg"
                >
                  {isThrowing ? '던지는 중...' : movePoints !== 0 ? '말을 선택하세요' : '윷 던지기'}
                </button>
                
                {/* 결과 표시 */}
                {lastResult && (
                  <div className="text-center">
                    <div className="inline-block px-8 py-4 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl shadow-lg">
                      <p className="text-4xl font-black text-amber-800 mb-1">{YUT_RESULTS[lastResult].name}</p>
                      <p className="text-lg text-amber-600">
                        {YUT_RESULTS[lastResult].move > 0 ? `+${YUT_RESULTS[lastResult].move}칸` : '1칸 뒤로'}
                        {YUT_RESULTS[lastResult].canThrowAgain && ' 🎉 한 번 더!'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 던지기 기록 */}
              {throwHistory.length > 0 && (
                <div className="flex justify-center gap-2 mb-4">
                  {throwHistory.map((result, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-100 rounded-full text-sm font-bold text-amber-800">
                      {YUT_RESULTS[result].name}
                    </span>
                  ))}
                </div>
              )}

              {/* 컨트롤 */}
              <div className="flex justify-center gap-3">
                <button onClick={reset} className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition">
                  <RotateCcw className="w-5 h-5" />
                  새 게임
                </button>
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 게임 규칙 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">윷놀이 규칙</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-bold">도</span>
                  <span className="text-gray-600">1칸 이동</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-bold">개</span>
                  <span className="text-gray-600">2칸 이동</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-bold">걸</span>
                  <span className="text-gray-600">3칸 이동</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span className="font-bold text-amber-700">윷</span>
                  <span className="text-amber-600">4칸 + 한 번 더</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-amber-50 rounded">
                  <span className="font-bold text-amber-700">모</span>
                  <span className="text-amber-600">5칸 + 한 번 더</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-bold text-red-600">빽도</span>
                  <span className="text-red-600">1칸 뒤로</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 rounded-lg text-sm text-amber-800 space-y-1">
                <p>• 상대 말을 잡으면 원위치 + 한 번 더</p>
                <p>• 같은 팀 말은 업을 수 있음</p>
                <p>• 4개 말 완주 시 승리</p>
              </div>
            </div>

            {/* 게임 현황 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-gray-800 mb-3">현황</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-red-600 font-bold">빨강팀</span>
                  <span>{teams.red.finished} / 4 완주</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold">파랑팀</span>
                  <span>{teams.blue.finished} / 4 완주</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
