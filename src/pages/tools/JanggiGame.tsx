import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, RotateCcw, Undo2, Trophy, Settings, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router-dom';

// ============================================================================
// 한국장기 - 완전 재설계 v3 (세련된 디자인 + 위치교환)
// ============================================================================

// 나무 위에 기물 놓는 "탁" 소리 (Web Audio API)
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
// 첫 클릭 시 AudioContext 활성화 (브라우저 정책 대응)
function initAudio() {
  try { getAudioCtx(); } catch { /* ignore */ }
}

function playMoveSound(isCapture = false) {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // 짧은 임팩트 톤 (나무 두드리는 소리)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isCapture ? 220 : 300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(isCapture ? 0.4 : 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // 노이즈 버스트 (나무 질감)
    const bufLen = Math.floor(ctx.sampleRate * 0.06);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buf;
    filter.type = 'bandpass';
    filter.frequency.value = isCapture ? 1500 : 2000;
    filter.Q.value = 1;
    noiseGain.gain.setValueAtTime(isCapture ? 0.3 : 0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.08);
  } catch { /* 오디오 미지원 시 무시 */ }
}

// 고가치 기물(차) 잡을 때 "텅" 소리
function playHeavyCaptureSound() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // 낮은 임팩트 (텅)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    // 무거운 노이즈
    const bufLen = Math.floor(ctx.sampleRate * 0.1);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
    const noise = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buf;
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.15);
  } catch { /* 오디오 미지원 시 무시 */ }
}

// 승리 빵빠레 (Victory Fanfare)
function playVictoryFanfare() {
  try {
    const ctx = getAudioCtx();
    const now = ctx.currentTime;

    // 빵빠레 멜로디: C-E-G-C(높은) 아르페지오
    const notes = [
      { freq: 523.25, start: 0, dur: 0.15 },     // C5
      { freq: 659.25, start: 0.12, dur: 0.15 },   // E5
      { freq: 783.99, start: 0.24, dur: 0.15 },   // G5
      { freq: 1046.50, start: 0.36, dur: 0.4 },   // C6 (길게)
      // 화음 (최종)
      { freq: 523.25, start: 0.5, dur: 0.5 },     // C5
      { freq: 659.25, start: 0.5, dur: 0.5 },     // E5
      { freq: 783.99, start: 0.5, dur: 0.5 },     // G5
      { freq: 1046.50, start: 0.5, dur: 0.6 },    // C6
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.2, now + start + 0.03);
      gain.gain.setValueAtTime(0.2, now + start + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    });

    // 심벌 느낌 노이즈
    const bufLen = Math.floor(ctx.sampleRate * 0.3);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen) * 0.5;
    const noise = ctx.createBufferSource();
    const nGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    noise.buffer = buf;
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    nGain.gain.setValueAtTime(0, now + 0.5);
    nGain.gain.linearRampToValueAtTime(0.08, now + 0.53);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now + 0.5);
    noise.stop(now + 1.0);
  } catch { /* 오디오 미지원 시 무시 */ }
}

// "장군!" TTS 사운드
function playCheckSound() {
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('장군');
      u.lang = 'ko-KR';
      u.rate = 1.3;
      u.pitch = 1.1;
      u.volume = 0.7;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    }
  } catch { /* TTS 미지원 시 무시 */ }
}

type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier';
type Team = 'cho' | 'han';
type Difficulty = 1 | 2 | 3 | 4;
type GameMode = 'pvp' | 'ai';
type Formation = 'msms' | 'mssm' | 'smms' | 'smsm';

const FORMATIONS: Record<Formation, [PieceType, PieceType, PieceType, PieceType]> = {
  msms: ['horse', 'elephant', 'horse', 'elephant'],
  mssm: ['horse', 'elephant', 'elephant', 'horse'],
  smms: ['elephant', 'horse', 'horse', 'elephant'],
  smsm: ['elephant', 'horse', 'elephant', 'horse'],
};

const FORMATION_NAMES: Record<Formation, string> = {
  msms: '마상마상',
  mssm: '마상상마',
  smms: '상마마상',
  smsm: '상마상마',
};

const FORMATION_DESC: Record<Formation, string> = {
  msms: '바깥 마, 안쪽 상',
  mssm: '왼쪽 마상, 오른쪽 상마',
  smms: '왼쪽 상마, 오른쪽 마상',
  smsm: '바깥 상, 안쪽 마',
};

interface Piece {
  type: PieceType;
  team: Team;
  label: string;
  id: string;
}

interface Position { row: number; col: number; }

const BOARD_ROWS = 10;
const BOARD_COLS = 9;
const CELL_SIZE = 48;
const PADDING = 32;

const LABELS: Record<Team, Record<PieceType, string>> = {
  cho: { king: '楚', advisor: '士', elephant: '象', horse: '馬', chariot: '車', cannon: '包', soldier: '卒' },
  han: { king: '漢', advisor: '士', elephant: '象', horse: '馬', chariot: '車', cannon: '包', soldier: '兵' },
};

const VALUES: Record<PieceType, number> = {
  king: 99999, chariot: 13, cannon: 7, horse: 5, elephant: 3, advisor: 3, soldier: 2,
};

function createBoard(choFormation: Formation = 'mssm', hanFormation: Formation = 'mssm'): (Piece | null)[][] {
  const b = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));
  let id = 0;
  const p = (t: PieceType, tm: Team): Piece => ({ type: t, team: tm, label: LABELS[tm][t], id: `${tm}_${t}_${id++}` });

  // 초나라 (위쪽)
  const cF = FORMATIONS[choFormation];
  b[0] = [p('chariot','cho'), p(cF[0],'cho'), p(cF[1],'cho'), p('advisor','cho'), null, p('advisor','cho'), p(cF[2],'cho'), p(cF[3],'cho'), p('chariot','cho')];
  b[1][4] = p('king','cho');
  b[2][1] = p('cannon','cho'); b[2][7] = p('cannon','cho');
  [0,2,4,6,8].forEach(c => b[3][c] = p('soldier','cho'));

  // 한나라 (아래쪽)
  const hF = FORMATIONS[hanFormation];
  b[9] = [p('chariot','han'), p(hF[0],'han'), p(hF[1],'han'), p('advisor','han'), null, p('advisor','han'), p(hF[2],'han'), p(hF[3],'han'), p('chariot','han')];
  b[8][4] = p('king','han');
  b[7][1] = p('cannon','han'); b[7][7] = p('cannon','han');
  [0,2,4,6,8].forEach(c => b[6][c] = p('soldier','han'));

  return b;
}

class Rules {
  static valid(r: number, c: number) { return r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS; }
  static palace(r: number, c: number, t: Team) { return t === 'cho' ? (r <= 2 && c >= 3 && c <= 5) : (r >= 7 && c >= 3 && c <= 5); }
  static inAnyPalace(r: number, c: number) { return this.palace(r,c,'cho') || this.palace(r,c,'han'); }

  // 궁성 내 대각선 연결 가능 여부 (꼭짓점↔중심만)
  private static readonly PALACE_DIAG_PAIRS: [number,number,number,number][] = [
    // 초 궁성
    [0,3, 1,4], [1,4, 2,5], [0,5, 1,4], [1,4, 2,3],
    // 한 궁성
    [7,3, 8,4], [8,4, 9,5], [7,5, 8,4], [8,4, 9,3],
  ];

  static canPalaceDiagonal(r1: number, c1: number, r2: number, c2: number): boolean {
    return this.PALACE_DIAG_PAIRS.some(([a,b,c,d]) =>
      (r1===a && c1===b && r2===c && c2===d) || (r1===c && c1===d && r2===a && c2===b)
    );
  }

  static moves(b: (Piece | null)[][], p: Position): Position[] {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    let m: Position[] = [];
    switch (pc.type) {
      case 'chariot': m = this.chariot(b, p); break;
      case 'cannon': m = this.cannon(b, p); break;
      case 'horse': m = this.horse(b, p); break;
      case 'elephant': m = this.elephant(b, p); break;
      case 'advisor': m = this.advisor(b, p); break;
      case 'king': m = this.king(b, p); break;
      case 'soldier': m = this.soldier(b, p); break;
    }
    return m.filter(t => !this.suicide(b, p, t, pc.team));
  }

  private static chariot(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[] = [], t = pc.team;
    // 직선 방향
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => {
      let r = p.row+dr, c = p.col+dc;
      while (this.valid(r,c)) {
        const x = b[r][c];
        if (!x) m.push({row:r,col:c});
        else { if (x.team!==t) m.push({row:r,col:c}); break; }
        r+=dr; c+=dc;
      }
    });
    // 궁성 내 대각선 방향
    if (this.inAnyPalace(p.row, p.col)) {
      [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => {
        let r = p.row+dr, c = p.col+dc;
        while (this.valid(r,c) && this.canPalaceDiagonal(r-dr,c-dc,r,c)) {
          const x = b[r][c];
          if (!x) m.push({row:r,col:c});
          else { if (x.team!==t) m.push({row:r,col:c}); break; }
          r+=dr; c+=dc;
        }
      });
    }
    return m;
  }

  private static cannon(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[] = [], t = pc.team;
    // 직선 방향
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc]) => {
      let r = p.row+dr, c = p.col+dc, jmp = false;
      while (this.valid(r,c)) {
        const x = b[r][c];
        if (!jmp) {
          // 포는 기물을 반드시 하나 넘어야 이동 가능 (포는 넘을 수 없음)
          if (x) { if (x.type === 'cannon') break; jmp = true; }
        } else {
          if (!x) m.push({row:r,col:c});
          else { if (x.type !== 'cannon' && x.team !== t) m.push({row:r,col:c}); break; }
        }
        r+=dr; c+=dc;
      }
    });
    // 궁성 내 대각선 방향
    this.cannonPalaceDiag(b, p, t, m);
    return m;
  }

  private static cannonPalaceDiag(b: (Piece | null)[][], p: Position, t: Team, m: Position[]) {
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc]) => {
      let r = p.row+dr, c = p.col+dc, jmp = false;
      while (this.valid(r,c) && this.canPalaceDiagonal(r-dr,c-dc,r,c)) {
        const x = b[r][c];
        if (!jmp) {
          if (x) { if (x.type === 'cannon') break; jmp = true; }
        } else {
          if (!x) m.push({row:r,col:c});
          else { if (x.type !== 'cannon' && x.team !== t) m.push({row:r,col:c}); break; }
        }
        r+=dr; c+=dc;
      }
    });
  }

  private static horse(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[] = [], t = pc.team;
    [[[1,0],[2,1]],[[1,0],[2,-1]],[[-1,0],[-2,1]],[[-1,0],[-2,-1]],[[0,1],[1,2]],[[0,1],[-1,2]],[[0,-1],[1,-2]],[[0,-1],[-1,-2]]].forEach(([[br,bc],[lr,lc]]) => {
      const brr=p.row+br, bcc=p.col+bc, lrr=p.row+lr, lcc=p.col+lc;
      if (this.valid(brr,bcc) && !b[brr][bcc] && this.valid(lrr,lcc)) {
        const x=b[lrr][lcc]; if (!x || x.team!==t) m.push({row:lrr,col:lcc});
      }
    });
    return m;
  }

  private static elephant(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[]=[], t=pc.team;
    // 8방향: [목적지dr,dc], [중간1 dr,dc], [중간2 dr,dc]
    const moves: [number,number,number,number,number,number][] = [
      [-3,-2, -1,0, -2,-1], [-3,+2, -1,0, -2,+1],
      [+3,-2, +1,0, +2,-1], [+3,+2, +1,0, +2,+1],
      [-2,-3, 0,-1, -1,-2], [-2,+3, 0,+1, -1,+2],
      [+2,-3, 0,-1, +1,-2], [+2,+3, 0,+1, +1,+2],
    ];
    moves.forEach(([dr,dc, b1r,b1c, b2r,b2c]) => {
      const mr=p.row+b1r, mc=p.col+b1c;
      const mr2=p.row+b2r, mc2=p.col+b2c;
      const tr=p.row+dr, tc=p.col+dc;
      if (this.valid(mr,mc) && !b[mr][mc] && this.valid(mr2,mc2) && !b[mr2][mc2] && this.valid(tr,tc)) {
        const x=b[tr][tc]; if (!x||x.team!==t) m.push({row:tr,col:tc});
      }
    });
    return m;
  }

  private static advisor(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[]=[], t=pc.team;
    // 직선 이동 (상하좌우) - 궁성 내
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{
      const r=p.row+dr,c=p.col+dc;
      if (this.valid(r,c) && this.palace(r,c,t)) { const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c}); }
    });
    // 대각선 이동 - 궁성 내 대각선 연결된 위치만
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
      const r=p.row+dr,c=p.col+dc;
      if (this.valid(r,c) && this.palace(r,c,t) && this.canPalaceDiagonal(p.row,p.col,r,c)) {
        const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c});
      }
    });
    return m;
  }

  private static king(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[]=[], t=pc.team;
    // 직선 이동 (상하좌우) - 궁성 내
    [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dr,dc])=>{
      const r=p.row+dr,c=p.col+dc;
      if (this.valid(r,c) && this.palace(r,c,t)) { const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c}); }
    });
    // 대각선 이동 - 궁성 내 대각선 연결된 위치만 (중심↔꼭짓점)
    [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([dr,dc])=>{
      const r=p.row+dr,c=p.col+dc;
      if (this.valid(r,c) && this.palace(r,c,t) && this.canPalaceDiagonal(p.row,p.col,r,c)) {
        const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c});
      }
    });
    return m;
  }

  private static soldier(b: (Piece | null)[][], p: Position) {
    const pc = b[p.row][p.col];
    if (!pc) return [];
    const m: Position[]=[], t=pc.team, f=t==='cho'?1:-1;
    // 기본 이동: 전진 + 좌우
    [[f,0],[0,1],[0,-1]].forEach(([dr,dc])=>{
      const r=p.row+dr,c=p.col+dc;
      if (this.valid(r,c)) { const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c}); }
    });
    // 적 궁성 내 전진 방향 대각선
    const enemyTeam = t === 'cho' ? 'han' : 'cho';
    if (this.palace(p.row, p.col, enemyTeam)) {
      [[f,1],[f,-1]].forEach(([dr,dc])=>{
        const r=p.row+dr,c=p.col+dc;
        if (this.valid(r,c) && this.canPalaceDiagonal(p.row,p.col,r,c)) {
          const x=b[r][c]; if(!x||x.team!==t) m.push({row:r,col:c});
        }
      });
    }
    return m;
  }

  private static suicide(b: (Piece | null)[][], f: Position, t: Position, tm: Team) {
    const nb=b.map(r=>[...r]); nb[t.row][t.col]=nb[f.row][f.col]; nb[f.row][f.col]=null;
    return this.check(nb,tm);
  }

  static findKing(b: (Piece | null)[][], t: Team) {
    for (let r=0;r<BOARD_ROWS;r++) for (let c=0;c<BOARD_COLS;c++) if (b[r][c]?.type==='king' && b[r][c]?.team===t) return {row:r,col:c};
    return null;
  }

  static check(b: (Piece | null)[][], t: Team) {
    const k=this.findKing(b,t); if (!k) return false;
    for (let r=0;r<BOARD_ROWS;r++) for (let c=0;c<BOARD_COLS;c++) {
      const p=b[r][c];
      if (p && p.team!==t) {
        const a=this.rawAttacks(b,{row:r,col:c});
        if (a.some(x=>x.row===k.row&&x.col===k.col)) return true;
      }
    }
    return false;
  }

  private static rawAttacks(b: (Piece | null)[][], p: Position) {
    const x=b[p.row][p.col]; if (!x) return [];
    switch(x.type){case'chariot':return this.chariot(b,p);case'cannon':return this.cannon(b,p);case'horse':return this.horse(b,p);case'elephant':return this.elephant(b,p);case'advisor':return this.advisor(b,p);case'king':return this.king(b,p);case'soldier':return this.soldier(b,p);}
    return [];
  }

  static checkmate(b: (Piece | null)[][], t: Team) {
    if (!this.check(b,t)) return false;
    for (let r=0;r<BOARD_ROWS;r++) for (let c=0;c<BOARD_COLS;c++) if (b[r][c]?.team===t && this.moves(b,{row:r,col:c}).length>0) return false;
    return true;
  }
}

// 위치별 가중치 테이블 (초 기준, 한은 상하 반전)
const PST: Partial<Record<PieceType, number[][]>> = {
  soldier: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [0,0,0.2,0,0.4,0,0.2,0,0],
    [0.2,0,0.4,0.2,0.5,0.2,0.4,0,0.2],
    [0.3,0.3,0.5,0.5,0.8,0.5,0.5,0.3,0.3],
    [0.5,0.5,0.7,0.8,1.0,0.8,0.7,0.5,0.5],
    [0.6,0.6,0.8,1.0,1.2,1.0,0.8,0.6,0.6],
    [0.7,0.7,1.0,1.2,1.5,1.2,1.0,0.7,0.7],
    [0.8,0.8,1.0,1.2,1.5,1.2,1.0,0.8,0.8],
  ],
  horse: [
    [0,0,0,0,0,0,0,0,0],
    [0,0,0.2,0.3,0,0.3,0.2,0,0],
    [0,0.2,0.4,0.5,0.4,0.5,0.4,0.2,0],
    [0,0.3,0.5,0.6,0.6,0.6,0.5,0.3,0],
    [0,0.3,0.5,0.7,0.8,0.7,0.5,0.3,0],
    [0,0.3,0.5,0.7,0.8,0.7,0.5,0.3,0],
    [0,0.3,0.5,0.6,0.6,0.6,0.5,0.3,0],
    [0,0.2,0.4,0.5,0.4,0.5,0.4,0.2,0],
    [0,0,0.2,0.3,0,0.3,0.2,0,0],
    [0,0,0,0,0,0,0,0,0],
  ],
  chariot: [
    [0.2,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0.2],
    [0.2,0.3,0.3,0.4,0.5,0.4,0.3,0.3,0.2],
    [0.2,0.3,0.3,0.4,0.5,0.4,0.3,0.3,0.2],
    [0.3,0.3,0.4,0.5,0.5,0.5,0.4,0.3,0.3],
    [0.3,0.4,0.5,0.5,0.6,0.5,0.5,0.4,0.3],
    [0.3,0.4,0.5,0.5,0.6,0.5,0.5,0.4,0.3],
    [0.3,0.3,0.4,0.5,0.5,0.5,0.4,0.3,0.3],
    [0.2,0.3,0.3,0.4,0.5,0.4,0.3,0.3,0.2],
    [0.2,0.3,0.3,0.4,0.5,0.4,0.3,0.3,0.2],
    [0.2,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0.2],
  ],
  cannon: [
    [0,0,0.2,0.2,0.3,0.2,0.2,0,0],
    [0,0,0.2,0.3,0.4,0.3,0.2,0,0],
    [0,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0],
    [0,0.2,0.3,0.5,0.6,0.5,0.3,0.2,0],
    [0,0.3,0.4,0.5,0.6,0.5,0.4,0.3,0],
    [0,0.3,0.4,0.5,0.6,0.5,0.4,0.3,0],
    [0,0.2,0.3,0.5,0.6,0.5,0.3,0.2,0],
    [0,0.2,0.3,0.4,0.5,0.4,0.3,0.2,0],
    [0,0,0.2,0.3,0.4,0.3,0.2,0,0],
    [0,0,0.2,0.2,0.3,0.2,0.2,0,0],
  ],
};

function getPST(type: PieceType, r: number, c: number, team: Team): number {
  const table = PST[type];
  if (!table) return 0;
  const row = team === 'cho' ? r : 9 - r;
  return table[row][c];
}

class AIPlayer {
  private d: Difficulty; private t: Team;
  private deadline = 0; private stopped = false;
  constructor(d: Difficulty, t: Team) { this.d=d; this.t=t; }

  getMove(b: (Piece | null)[][]) {
    const all = this.allMoves(b, this.t);
    if (all.length === 0) return null;
    const rand = [0.25, 0.08, 0, 0][this.d - 1];

    // 수 정렬: 포획 > 장군 > 일반 (알파-베타 효율 향상)
    this.orderMoves(b, all);

    // 시간 제한 (초급 1초, 중급 2초, 고급 3초, 마스터 5초)
    const TL = [1000, 2000, 3000, 5000][this.d - 1];
    const maxDepth = [2, 3, 4, 6][this.d - 1];
    const t0 = Date.now();
    this.deadline = t0 + TL;

    let best = all[0];

    // 반복 심화: 얕은 깊이부터 시작, 시간 내에서 점점 깊게
    for (let depth = 2; depth <= maxDepth; depth++) {
      if (Date.now() - t0 > TL - 200) break;
      this.stopped = false;

      // 이전 최선수를 맨 앞으로 (알파-베타 효율)
      const idx = all.findIndex(m => m.f.row === best.f.row && m.f.col === best.f.col && m.t.row === best.t.row && m.t.col === best.t.col);
      if (idx > 0) { const tmp = all[0]; all[0] = all[idx]; all[idx] = tmp; }

      let curBest = all[0], bestSc = -Infinity;
      for (const m of all) {
        if (Date.now() > this.deadline) break;
        const sc = this.minimax(this.sim(b, m.f, m.t), depth - 1, bestSc, Infinity, false);
        if (this.stopped) break;
        if (sc > bestSc) { bestSc = sc; curBest = m; }
      }
      if (!this.stopped) best = curBest;
    }

    if (Math.random() < rand) {
      this.stopped = false;
      this.deadline = Date.now() + 500;
      const scored = all.map(m => ({ m, sc: this.minimax(this.sim(b, m.f, m.t), 1, -Infinity, Infinity, false) }));
      scored.sort((a, b) => b.sc - a.sc);
      const pool = scored.slice(0, Math.max(3, Math.ceil(scored.length * 0.3)));
      return pool[Math.floor(Math.random() * pool.length)].m;
    }
    return best;
  }

  private orderMoves(b: (Piece | null)[][], moves: { f: Position; t: Position }[]) {
    moves.sort((a, mv2) => {
      const capA = b[a.t.row][a.t.col];
      const capB = b[mv2.t.row][mv2.t.col];
      const scoreA = capA ? VALUES[capA.type] * 10 - VALUES[b[a.f.row][a.f.col]!.type] : 0;
      const scoreB = capB ? VALUES[capB.type] * 10 - VALUES[b[mv2.f.row][mv2.f.col]!.type] : 0;
      return scoreB - scoreA;
    });
  }

  private minimax(b: (Piece | null)[][], d: number, a: number, B: number, mx: boolean): number {
    if (Date.now() > this.deadline) { this.stopped = true; return 0; }
    if (d === 0) return this.quiesce(b, a, B, mx, 4);
    const t = mx ? this.t : (this.t === 'cho' ? 'han' : 'cho');
    const ms = this.allMoves(b, t);
    if (ms.length === 0) return mx ? -99999 : 99999;
    if (Rules.checkmate(b, t)) return mx ? -99999 : 99999;

    this.orderMoves(b, ms);

    if (mx) {
      let s = -Infinity;
      for (const m of ms) {
        s = Math.max(s, this.minimax(this.sim(b, m.f, m.t), d - 1, a, B, false));
        if (this.stopped) return 0;
        a = Math.max(a, s); if (B <= a) break;
      }
      return s;
    } else {
      let s = Infinity;
      for (const m of ms) {
        s = Math.min(s, this.minimax(this.sim(b, m.f, m.t), d - 1, a, B, true));
        if (this.stopped) return 0;
        B = Math.min(B, s); if (B <= a) break;
      }
      return s;
    }
  }

  // 포획 연장 탐색 (Quiescence Search) - 교환 상황에서 정확한 판단
  private quiesce(b: (Piece | null)[][], a: number, B: number, mx: boolean, depth: number): number {
    if (Date.now() > this.deadline) { this.stopped = true; return 0; }
    const standPat = this.eval(b);
    if (depth === 0) return standPat;

    if (mx) {
      if (standPat >= B) return standPat;
      a = Math.max(a, standPat);
      const t = this.t;
      const captures = this.allMoves(b, t).filter(m => b[m.t.row][m.t.col] !== null);
      this.orderMoves(b, captures);
      for (const m of captures) {
        const sc = this.quiesce(this.sim(b, m.f, m.t), a, B, false, depth - 1);
        if (this.stopped) return 0;
        a = Math.max(a, sc); if (B <= a) return B;
      }
      return a;
    } else {
      if (standPat <= a) return standPat;
      B = Math.min(B, standPat);
      const t = this.t === 'cho' ? 'han' : 'cho';
      const captures = this.allMoves(b, t).filter(m => b[m.t.row][m.t.col] !== null);
      this.orderMoves(b, captures);
      for (const m of captures) {
        const sc = this.quiesce(this.sim(b, m.f, m.t), a, B, true, depth - 1);
        if (this.stopped) return 0;
        B = Math.min(B, sc); if (B <= a) return a;
      }
      return B;
    }
  }

  private eval(b: (Piece | null)[][]) {
    let s = 0;
    const opp = this.t === 'cho' ? 'han' : 'cho';

    for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) {
      const p = b[r][c];
      if (!p) continue;
      const sign = p.team === this.t ? 1 : -1;

      // 기물 기본 가치
      let v = VALUES[p.type];

      // 위치 가중치 (Piece-Square Table)
      v += getPST(p.type, r, c, p.team);

      // 졸/병 전진 보너스
      if (p.type === 'soldier') {
        const advance = p.team === 'cho' ? r : (9 - r);
        v += advance * 0.15;
      }

      // 궁 안전: 궁성 중심에 있으면 보너스
      if (p.type === 'king') {
        const centerR = p.team === 'cho' ? 1 : 8;
        if (r === centerR && c === 4) v += 1.5;
      }

      // 차: 열린 줄(같은 열에 아군 없음) 보너스
      if (p.type === 'chariot') {
        let open = true;
        for (let rr = 0; rr < BOARD_ROWS; rr++) {
          if (rr !== r && b[rr][c]?.team === p.team) { open = false; break; }
        }
        if (open) v += 1.0;
      }

      s += sign * v;
    }

    // 장군 보너스/패널티
    if (Rules.check(b, opp)) s += 4;
    if (Rules.check(b, this.t)) s -= 4;

    // 기동력 (이동 가능 수) - 고급/마스터에서만 계산
    if (this.d >= 3) {
      let myMobility = 0, oppMobility = 0;
      for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) {
        const p = b[r][c];
        if (p) {
          const cnt = Rules.moves(b, { row: r, col: c }).length;
          if (p.team === this.t) myMobility += cnt;
          else oppMobility += cnt;
        }
      }
      s += (myMobility - oppMobility) * 0.05;
    }

    return s;
  }

  private allMoves(b: (Piece | null)[][], t: Team) {
    const m: { f: Position; t: Position }[] = [];
    for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++)
      if (b[r][c]?.team === t) Rules.moves(b, { row: r, col: c }).forEach(x => m.push({ f: { row: r, col: c }, t: x }));
    return m;
  }

  private sim(b: (Piece | null)[][], f: Position, t: Position) {
    const nb = b.map(r => [...r]);
    nb[t.row][t.col] = nb[f.row][f.col]; nb[f.row][f.col] = null;
    return nb;
  }
}

export default function JanggiGame() {
  const [board, setBoard] = useState(createBoard);
  const [selected, setSelected] = useState<Position|null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [turn, setTurn] = useState<Team>('cho');
  const [moves, setMoves] = useState<{f:Position,t:Position,cap:Piece|null}[]>([]);
  const [captured, setCaptured] = useState<{cho:Piece[],han:Piece[]}>({cho:[],han:[]});
  const [history, setHistory] = useState<{board:(Piece|null)[][],captured:{cho:Piece[],han:Piece[]},turn:Team,lastMove:{f:Position,t:Position}|null}[]>([]);
  const [winner, setWinner] = useState<Team|null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [perspective, setPerspective] = useState<Team>('cho'); // 어떤 팀을 아래에 둘지
  const [showSettings, setShowSettings] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{f:Position,t:Position}|null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const soundRef = useRef(true);
  useEffect(() => { soundRef.current = soundOn; }, [soundOn]);
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [choFormation, setChoFormation] = useState<Formation>('mssm');
  const [hanFormation, setHanFormation] = useState<Formation>('mssm');

  const aiTeam = perspective === 'cho' ? 'han' : 'cho';
  const ai = useMemo(() => new AIPlayer(difficulty, aiTeam), [difficulty, aiTeam]);

  // 시점 변환 함수
  const toVisual = (r: number) => perspective === 'cho' ? 9 - r : r;
  const toLogical = (r: number) => perspective === 'cho' ? 9 - r : r;

  useEffect(() => {
    if (gamePhase === 'playing' && Rules.checkmate(board, turn)) {
      setWinner(turn === 'cho' ? 'han' : 'cho');
      if (soundRef.current) setTimeout(() => playVictoryFanfare(), 200);
    }
  }, [board, turn, gamePhase]);

  const executeMove = useCallback((f: Position, t: Position) => {
    const p = board[f.row][f.col];
    if (!p) return;

    // 이동 전 상태 저장 (무르기용)
    setHistory(prev => [...prev, {
      board: board.map(r => [...r]),
      captured: { cho: [...captured.cho], han: [...captured.han] },
      turn,
      lastMove,
    }]);

    const nb = board.map(r => [...r]);
    const cap = nb[t.row][t.col];
    nb[t.row][t.col] = p;
    nb[f.row][f.col] = null;

    const nc = { cho: [...captured.cho], han: [...captured.han] };
    if (cap) nc[p.team].push(cap);

    // 사운드 재생
    if (soundRef.current) {
      if (cap?.type === 'chariot') playHeavyCaptureSound();
      else playMoveSound(!!cap);
      // 장군 체크
      const nextTurn = turn === 'cho' ? 'han' : 'cho';
      if (Rules.check(nb, nextTurn)) {
        setTimeout(() => { if (soundRef.current) playCheckSound(); }, 150);
      }
    }

    setBoard(nb);
    setCaptured(nc);
    setMoves(prev => [...prev, { f, t, cap }]);
    setLastMove({ f, t });
    setTurn(x => x === 'cho' ? 'han' : 'cho');
    setSelected(null);
    setValidMoves([]);
  }, [board, captured, turn, lastMove]);

  // executeMove를 ref로 유지 (AI useEffect에서 항상 최신 참조 사용)
  const executeMoveRef = useRef(executeMove);
  useEffect(() => { executeMoveRef.current = executeMove; }, [executeMove]);

  // AI 턴 처리
  useEffect(() => {
    if (gameMode === 'ai' && turn === aiTeam && !winner && gamePhase === 'playing') {
      setIsThinking(true);
      const timer = setTimeout(() => {
        const m = ai.getMove(board);
        if (m) executeMoveRef.current(m.f, m.t);
        setIsThinking(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, board, winner, ai, aiTeam, gamePhase]);

  const handleIntersectionClick = (visualRow: number, col: number) => {
    initAudio(); // 첫 클릭에서 오디오 활성화
    if (gamePhase !== 'playing' || isThinking || winner) return;
    if (gameMode === 'ai' && turn === aiTeam) return;
    
    const logicalRow = toLogical(visualRow);
    const pos = { row: logicalRow, col };
    const p = board[logicalRow][col];
    
    if (selected) {
      const isValid = validMoves.some(m => m.row === logicalRow && m.col === col);
      if (isValid) {
        executeMove(selected, pos);
      } else if (p?.team === turn) {
        setSelected(pos);
        setValidMoves(Rules.moves(board, pos));
      } else {
        setSelected(null);
        setValidMoves([]);
      }
    } else if (p?.team === turn) {
      setSelected(pos);
      setValidMoves(Rules.moves(board, pos));
    }
  };

  const undo = useCallback(() => {
    if (isThinking || winner) return;
    // AI 모드에서는 AI 수 + 플레이어 수 2개 되돌리기
    const count = gameMode === 'ai' && history.length >= 2 ? 2 : 1;
    if (history.length < count) return;

    const target = history[history.length - count];
    setBoard(target.board);
    setCaptured(target.captured);
    setTurn(target.turn);
    setLastMove(target.lastMove);
    setHistory(prev => prev.slice(0, -count));
    setMoves(prev => prev.slice(0, -count));
    setSelected(null);
    setValidMoves([]);
    setWinner(null);
  }, [history, gameMode, isThinking, winner]);

  const reset = () => {
    setGamePhase('setup');
    setSelected(null);
    setValidMoves([]);
    setTurn('cho');
    setMoves([]);
    setCaptured({ cho: [], han: [] });
    setWinner(null);
    setLastMove(null);
    setHistory([]);
  };

  const startGame = () => {
    setBoard(createBoard(choFormation, hanFormation));
    setGamePhase('playing');
    setSelected(null);
    setValidMoves([]);
    setTurn('cho');
    setMoves([]);
    setCaptured({ cho: [], han: [] });
    setWinner(null);
    setLastMove(null);
    setHistory([]);
  };

  const WIDTH = PADDING * 2 + (BOARD_COLS - 1) * CELL_SIZE;
  const HEIGHT = PADDING * 2 + (BOARD_ROWS - 1) * CELL_SIZE;
  const getX = (c: number) => PADDING + c * CELL_SIZE;
  const getY = (r: number) => PADDING + toVisual(r) * CELL_SIZE;

  return (
    <>
      <SEOHead
        title="장기 게임"
        description="AI와 대국하는 온라인 장기 게임입니다. 한국 전통 보드게임 장기를 다양한 난이도로 즐겨보세요."
        url="/tools/janggi"
      />
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-amber-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-950 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-5 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/tools" className="text-white/70 hover:text-white transition"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">한국장기</h1>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">Korean Chess (Janggi)</p>
              </div>
            </div>
            <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition">
              <Settings className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">설정</span>
            </button>
          </div>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">게임 모드</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button onClick={() => { setGameMode('pvp'); reset(); }} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'pvp' ? 'bg-white shadow text-stone-800' : 'text-gray-600'}`}>
                    <User className="w-4 h-4 inline mr-1" />2인
                  </button>
                  <button onClick={() => { setGameMode('ai'); reset(); }} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${gameMode === 'ai' ? 'bg-white shadow text-stone-800' : 'text-gray-600'}`}>
                    <Bot className="w-4 h-4 inline mr-1" />AI
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">플레이어 위치</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button onClick={() => { setPerspective('cho'); reset(); }} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${perspective === 'cho' ? 'bg-blue-50 shadow text-blue-700' : 'text-gray-600'}`}>
                    초(藍) 아래
                  </button>
                  <button onClick={() => { setPerspective('han'); reset(); }} className={`flex-1 py-1.5 text-sm font-medium rounded-md transition ${perspective === 'han' ? 'bg-red-50 shadow text-red-700' : 'text-gray-600'}`}>
                    한(赤) 아래
                  </button>
                </div>
              </div>

              {gameMode === 'ai' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">AI 난이도</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value) as Difficulty)} className="w-full px-3 py-1.5 bg-white border rounded-lg text-sm">
                    <option value={1}>초급</option>
                    <option value={2}>중급</option>
                    <option value={3}>고급</option>
                    <option value={4}>마스터</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 배치 선택 화면 */}
      {gamePhase === 'setup' && (
        <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8">
            <h2 className="text-lg sm:text-2xl font-bold text-stone-800 text-center mb-1">기물 배치 선택</h2>
            <p className="text-xs sm:text-sm text-stone-500 text-center mb-5">상(象)과 마(馬)의 초기 배치를 선택하세요</p>

            {/* 초/한 배치 - 2열 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5">
              {/* 초(藍) 배치 */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b-2 border-blue-200">
                  <span className="text-sm font-bold text-blue-700">초 (藍)</span>
                  {gameMode === 'ai' && perspective === 'cho' && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">내 팀</span>}
                  {gameMode === 'ai' && perspective !== 'cho' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">AI</span>}
                </div>
                <div className="space-y-2">
                    {(['msms','mssm','smms','smsm'] as Formation[]).map(f => {
                      const pieces = FORMATIONS[f];
                      const isSelected = choFormation === f;
                      return (
                        <button key={f} onClick={() => setChoFormation(f)}
                          className={`w-full p-2.5 rounded-xl border-2 transition ${isSelected ? 'border-blue-400 bg-blue-50 shadow-md' : 'border-stone-200 hover:border-blue-200 bg-white'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-stone-800">{FORMATION_NAMES[f]}</span>
                            <span className="text-[10px] text-stone-400">{FORMATION_DESC[f]}</span>
                          </div>
                          <div className="flex justify-center gap-0.5">
                            {([
                              'chariot' as PieceType, pieces[0], pieces[1], 'advisor' as PieceType,
                              null,
                              'advisor' as PieceType, pieces[2], pieces[3], 'chariot' as PieceType,
                            ] as (PieceType | null)[]).map((type, i) => type ? (
                              <div key={i} className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 ${(i===1||i===2||i===6||i===7) ? (isSelected ? 'ring-2 ring-blue-400' : '') : ''}`}>
                                {LABELS.cho[type]}
                              </div>
                            ) : (
                              <div key={i} className="w-3 h-6 sm:w-4 sm:h-7" />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* 한(赤) 배치 */}
              <div>
                <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b-2 border-red-200">
                  <span className="text-sm font-bold text-red-700">한 (赤)</span>
                  {gameMode === 'ai' && perspective === 'han' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">내 팀</span>}
                  {gameMode === 'ai' && perspective !== 'han' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">AI</span>}
                </div>
                <div className="space-y-2">
                    {(['msms','mssm','smms','smsm'] as Formation[]).map(f => {
                      const pieces = FORMATIONS[f];
                      const isSelected = hanFormation === f;
                      return (
                        <button key={f} onClick={() => setHanFormation(f)}
                          className={`w-full p-2.5 rounded-xl border-2 transition ${isSelected ? 'border-red-400 bg-red-50 shadow-md' : 'border-stone-200 hover:border-red-200 bg-white'}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-stone-800">{FORMATION_NAMES[f]}</span>
                            <span className="text-[10px] text-stone-400">{FORMATION_DESC[f]}</span>
                          </div>
                          <div className="flex justify-center gap-0.5">
                            {([
                              'chariot' as PieceType, pieces[0], pieces[1], 'advisor' as PieceType,
                              null,
                              'advisor' as PieceType, pieces[2], pieces[3], 'chariot' as PieceType,
                            ] as (PieceType | null)[]).map((type, i) => type ? (
                              <div key={i} className={`w-6 h-6 sm:w-7 sm:h-7 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold bg-red-50 text-red-700 border border-red-200 ${(i===1||i===2||i===6||i===7) ? (isSelected ? 'ring-2 ring-red-400' : '') : ''}`}>
                                {LABELS.han[type]}
                              </div>
                            ) : (
                              <div key={i} className="w-3 h-6 sm:w-4 sm:h-7" />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* 게임 설정 */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-5 p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-stone-500">모드</span>
                <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                  <button onClick={() => setGameMode('ai')} className={`px-3 py-1 text-xs font-medium rounded-md transition ${gameMode === 'ai' ? 'bg-stone-800 text-white' : 'text-gray-500'}`}>
                    <Bot className="w-3 h-3 inline mr-0.5" />AI
                  </button>
                  <button onClick={() => setGameMode('pvp')} className={`px-3 py-1 text-xs font-medium rounded-md transition ${gameMode === 'pvp' ? 'bg-stone-800 text-white' : 'text-gray-500'}`}>
                    <User className="w-3 h-3 inline mr-0.5" />2인
                  </button>
                </div>
              </div>
              {gameMode === 'ai' && (
                <>
                  <div className="w-px h-5 bg-stone-300 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-500">내 팀</span>
                    <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                      <button onClick={() => setPerspective('cho')} className={`px-3 py-1 text-xs font-medium rounded-md transition ${perspective === 'cho' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>초</button>
                      <button onClick={() => setPerspective('han')} className={`px-3 py-1 text-xs font-medium rounded-md transition ${perspective === 'han' ? 'bg-red-600 text-white' : 'text-gray-500'}`}>한</button>
                    </div>
                  </div>
                  <div className="w-px h-5 bg-stone-300 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-500">난이도</span>
                    <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                      {([1,2,3,4] as Difficulty[]).map(lv => {
                        const labels = ['초급','중급','고급','마스터'];
                        return (
                          <button key={lv} onClick={() => setDifficulty(lv)}
                            className={`px-2 py-1 text-xs font-medium rounded-md transition ${difficulty === lv ? 'bg-stone-800 text-white' : 'text-gray-500'}`}>
                            {labels[lv-1]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button onClick={startGame}
              className="w-full py-3 bg-gradient-to-r from-stone-800 to-stone-950 text-white rounded-xl font-bold text-lg hover:from-stone-700 hover:to-stone-900 transition shadow-lg">
              게임 시작
            </button>
          </div>
        </div>
      )}

      {/* 메인 게임 */}
      {gamePhase === 'playing' && (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 게임 보드 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-6">
              {/* 상단 상태바 */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-3 h-3 rounded-full ${turn === 'cho' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-300'}`} />
                  <span className={`text-sm sm:text-base font-semibold ${turn === 'cho' ? 'text-blue-700' : 'text-gray-500'}`}>초 (藍)</span>
                </div>

                <div className="flex items-center gap-2 order-3 sm:order-none w-full sm:w-auto justify-center">
                  <button
                    onClick={() => { setPerspective(p => p === 'cho' ? 'han' : 'cho'); reset(); }}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1"
                    title="팀 바꾸기 (새 게임)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    {perspective === 'cho' ? '한으로' : '초로'}
                  </button>
                  <button
                    onClick={() => setSoundOn(s => !s)}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs sm:text-sm font-medium transition flex items-center gap-1"
                    title={soundOn ? '소리 끄기' : '소리 켜기'}
                  >
                    {soundOn ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>

                  {Rules.check(board, turn) && !winner && (
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-bold animate-pulse">장군!</span>
                  )}
                  {winner && (
                    <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-100 text-amber-800 rounded-full font-bold text-sm">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                      {winner === 'cho' ? '초' : '한'} 승리!
                    </div>
                  )}
                  {isThinking && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'75ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`text-sm sm:text-base font-semibold ${turn === 'han' ? 'text-red-700' : 'text-gray-500'}`}>한 (赤)</span>
                  <div className={`w-3 h-3 rounded-full ${turn === 'han' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-300'}`} />
                </div>
              </div>

              {/* 상대편(위)이 잡은 기물 표시 */}
              {(() => {
                const topTeam = perspective === 'cho' ? 'han' : 'cho';
                const topCapturedPieces = captured[topTeam]; // 위쪽 팀이 잡은 기물들
                return topCapturedPieces.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mb-2 px-1">
                    {topCapturedPieces.map((cp, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded text-xs sm:text-sm font-bold ${cp.team === 'cho' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {cp.label}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* SVG 보드 */}
              <div className="flex justify-center">
                <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-[550px] select-none">
                  {/* 나무 배경 */}
                  <defs>
                    <linearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f5e6c8" />
                      <stop offset="50%" stopColor="#e8d4a0" />
                      <stop offset="100%" stopColor="#d4b896" />
                    </linearGradient>
                    {/* 초(藍) 기물 돔 그라데이션 */}
                    <radialGradient id="choPieceGrad" cx="40%" cy="35%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                      <stop offset="35%" stopColor="#eef4ff"/>
                      <stop offset="75%" stopColor="#dbeafe"/>
                      <stop offset="100%" stopColor="#bfdbfe"/>
                    </radialGradient>
                    {/* 한(赤) 기물 돔 그라데이션 */}
                    <radialGradient id="hanPieceGrad" cx="40%" cy="35%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9}/>
                      <stop offset="35%" stopColor="#fff5f5"/>
                      <stop offset="75%" stopColor="#fee2e2"/>
                      <stop offset="100%" stopColor="#fecaca"/>
                    </radialGradient>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2.5"/>
                      <feOffset dx="1" dy="3" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.35"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#woodGrad)" rx="12" />
                  
                  {/* 격자선 */}
                  <g stroke="#5c3d1e" strokeWidth="1.2" opacity="0.85">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`h${i}`} x1={getX(0)} y1={getY(i)} x2={getX(8)} y2={getY(i)} />
                    ))}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <line key={`v${i}`} x1={getX(i)} y1={getY(0)} x2={getX(i)} y2={getY(9)} />
                    ))}
                  </g>

                  {/* 궁성 대각선 */}
                  <g stroke="#5c3d1e" strokeWidth="1.2" opacity="0.85">
                    <line x1={getX(3)} y1={getY(0)} x2={getX(5)} y2={getY(2)} />
                    <line x1={getX(5)} y1={getY(0)} x2={getX(3)} y2={getY(2)} />
                    <line x1={getX(3)} y1={getY(7)} x2={getX(5)} y2={getY(9)} />
                    <line x1={getX(5)} y1={getY(7)} x2={getX(3)} y2={getY(9)} />
                  </g>

                  {/* 교차점 클릭 영역 (투명) */}
                  {Array.from({ length: 10 }).map((_, r) =>
                    Array.from({ length: 9 }).map((_, c) => (
                      <circle
                        key={`hit-${r}-${c}`}
                        cx={getX(c)}
                        cy={getY(r)}
                        r="20"
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => handleIntersectionClick(toVisual(r), c)}
                      />
                    ))
                  )}

                  {/* 마지막 수 표시 */}
                  {lastMove && (
                    <g>
                      {/* 출발점: 반투명 사각형 */}
                      <rect
                        x={getX(lastMove.f.col) - 22} y={getY(lastMove.f.row) - 22}
                        width="44" height="44" rx="6"
                        fill="#3b82f6" opacity="0.12"
                      />
                      {/* 도착점: 눈에 띄는 강조 */}
                      <rect
                        x={getX(lastMove.t.col) - 24} y={getY(lastMove.t.row) - 24}
                        width="48" height="48" rx="7"
                        fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.85"
                      />
                      <rect
                        x={getX(lastMove.t.col) - 24} y={getY(lastMove.t.row) - 24}
                        width="48" height="48" rx="7"
                        fill="#f59e0b" opacity="0.08"
                      />
                    </g>
                  )}

                  {/* 이동 가능 표시 */}
                  {selected && validMoves.map((m, i) => {
                    const isCapture = board[m.row][m.col] !== null;
                    return (
                      <g key={`vm${i}`} pointerEvents="none">
                        {isCapture ? (
                          <circle cx={getX(m.col)} cy={getY(m.row)} r="18" fill="none" stroke="#ef4444" strokeWidth="3" opacity="0.8" />
                        ) : (
                          <circle cx={getX(m.col)} cy={getY(m.row)} r="5" fill="#fbbf24" opacity="0.9" />
                        )}
                      </g>
                    );
                  })}

                  {/* 기물 */}
                  {board.map((row, r) =>
                    row.map((p, c) => {
                      if (!p) return null;
                      const isSelected = selected?.row === r && selected?.col === c;
                      const cx = getX(c), cy = getY(r);
                      const sz = p.type === 'king' ? 24 : (p.type === 'soldier' || p.type === 'advisor') ? 18 : 20;
                      const innerSz = sz - 3;
                      const octPoints = (s: number) => {
                        const pts: [number,number][] = [];
                        for (let i = 0; i < 8; i++) {
                          const angle = (22.5 + 45 * i) * Math.PI / 180;
                          pts.push([cx + s * Math.sin(angle), cy - s * Math.cos(angle)]);
                        }
                        return pts.map(pt => pt.join(',')).join(' ');
                      };
                      return (
                        <g
                          key={p.id}
                          className="cursor-pointer transition-transform duration-150"
                          onClick={(e) => { e.stopPropagation(); handleIntersectionClick(toVisual(r), c); }}
                          style={{ filter: 'url(#shadow)' }}
                        >
                          {/* 기물 배경 (정팔각형) — 그라데이션 fill */}
                          <polygon
                            points={octPoints(sz)}
                            fill={`url(#${p.team === 'cho' ? 'cho' : 'han'}PieceGrad)`}
                            stroke={p.team === 'cho' ? '#1d4ed8' : '#dc2626'}
                            strokeWidth={isSelected ? 3 : p.type === 'king' ? 2.5 : 1.8}
                          />
                          {/* 안쪽 테두리 (이중선 효과) */}
                          <polygon
                            points={octPoints(innerSz)}
                            fill="none"
                            stroke={p.team === 'cho' ? '#93b4f8' : '#f8a0a0'}
                            strokeWidth="1"
                            opacity={0.8}
                          />
                          {/* 상단 하이라이트 (빛 반사) */}
                          <ellipse
                            cx={cx} cy={cy - sz * 0.3}
                            rx={sz * 0.5} ry={sz * 0.25}
                            fill="#ffffff" opacity={0.3}
                            pointerEvents="none"
                          />
                          {/* 하단 음영 */}
                          <ellipse
                            cx={cx} cy={cy + sz * 0.5}
                            rx={sz * 0.55} ry={sz * 0.12}
                            fill="#000000" opacity={0.06}
                            pointerEvents="none"
                          />
                          {/* 한자 — 양각 효과 */}
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={p.type === 'king' ? '21' : (p.type === 'soldier' || p.type === 'advisor') ? '15' : '17'}
                            fontWeight="bold"
                            fill={p.team === 'cho' ? '#1d4ed8' : '#dc2626'}
                            style={{ fontFamily: 'serif', pointerEvents: 'none', filter: 'drop-shadow(0px 0.5px 0px rgba(255,255,255,0.6))' }}
                          >
                            {p.label}
                          </text>
                          {/* 선택 효과 — 글로우 */}
                          {isSelected && (
                            <circle
                              cx={cx} cy={cy}
                              r={p.type === 'king' ? 29 : 25}
                              fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity={0.7}
                              style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' }}
                            />
                          )}
                        </g>
                      );
                    })
                  )}
                </svg>
              </div>

              {/* 아래편 잡힌 기물 (보드 아래) */}
              {(() => {
                const bottomTeam = perspective;
                const bottomCaptured = captured[bottomTeam]; // 아래편이 잡은 기물
                return bottomCaptured.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-2 px-1">
                    {bottomCaptured.map((cp, i) => (
                      <span key={i} className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded text-xs sm:text-sm font-bold ${cp.team === 'cho' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {cp.label}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}

              {/* 컨트롤 */}
              <div className="flex flex-col items-center gap-3 mt-6">
                <div className="flex justify-center gap-3">
                  <button onClick={reset} className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition">
                    <RotateCcw className="w-4 h-4" />
                    새 게임
                  </button>
                  <button
                    onClick={undo}
                    disabled={history.length === 0 || isThinking || !!winner}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Undo2 className="w-4 h-4" />
                    무르기
                  </button>
                </div>

                {/* AI 난이도 - 게임 중 바로 조절 */}
                {gameMode === 'ai' && (
                  <div className="flex items-center gap-1.5 bg-stone-50 rounded-xl p-1">
                    {([1,2,3,4] as Difficulty[]).map(lv => {
                      const labels = ['초급','중급','고급','마스터'];
                      const isActive = difficulty === lv;
                      return (
                        <button
                          key={lv}
                          onClick={() => setDifficulty(lv)}
                          className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition ${
                            isActive
                              ? 'bg-stone-800 text-white shadow'
                              : 'text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {labels[lv-1]}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="space-y-4">
            {/* 기물 점수 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">기물 점수</h3>
              <div className="space-y-1.5 text-sm">
                {[
                  { label: '車 차', value: 13, color: 'text-stone-700' },
                  { label: '包 포', value: 7, color: 'text-stone-700' },
                  { label: '馬 마', value: 5, color: 'text-stone-700' },
                  { label: '象 상', value: 3, color: 'text-stone-700' },
                  { label: '士 사', value: 3, color: 'text-stone-700' },
                  { label: '卒/兵', value: 2, color: 'text-stone-700' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-stone-600">{item.label}</span>
                    <span className={`font-bold ${item.color}`}>{item.value}점</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-3 pt-2 border-t">* 후수(한) 1.5점 덤</p>
            </div>

            {/* 수 기록 */}
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">수 기록 ({moves.length})</h3>
              <div className="max-h-48 overflow-y-auto space-y-1 text-sm">
                {moves.length === 0 ? (
                  <p className="text-stone-400 text-xs">아직 수가 없습니다</p>
                ) : (
                  moves.map((m, i) => (
                    <div key={i} className={`flex items-center gap-2 p-1.5 rounded ${i % 2 === 0 ? 'bg-blue-50/50' : 'bg-red-50/50'}`}>
                      <span className="text-xs text-stone-400 w-6">{i + 1}.</span>
                      <span className="font-medium">
                        {board[m.t.row][m.t.col]?.label} 
                        {m.cap && <span className="text-red-500">×</span>}
                      </span>
                      <span className="text-xs text-stone-400 ml-auto">
                        {String.fromCharCode(97 + m.f.col)}{10 - m.f.row}→{String.fromCharCode(97 + m.t.col)}{10 - m.t.row}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 게임 규칙 */}
            <div className="bg-gradient-to-br from-stone-50 to-amber-50 rounded-xl shadow-md p-4">
              <h3 className="font-bold text-stone-800 mb-3 text-sm">기물 이동</h3>
              <ul className="space-y-1.5 text-xs text-stone-600">
                <li><strong className="text-stone-800">車(차):</strong> 직선 무제한, 궁성 대각선</li>
                <li><strong className="text-stone-800">包(포):</strong> 기물 1개 넘어서 이동 (포는 넘지 못함)</li>
                <li><strong className="text-stone-800">馬(마):</strong> 日자, 막힘 체크</li>
                <li><strong className="text-stone-800">象(상):</strong> 1직선+2대각선, 막힘 체크</li>
                <li><strong className="text-stone-800">士(사):</strong> 궁성 내 상하좌우+대각선</li>
                <li><strong className="text-stone-800">楚/漢:</strong> 궁성 내 상하좌우+대각선</li>
                <li><strong className="text-stone-800">卒/兵:</strong> 앞+좌우, 적 궁성 대각선</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  
    </>);
}
