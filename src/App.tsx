import { useState, useEffect, useRef, useCallback } from 'react';
import { Peer } from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { GameCard } from './data/cards';
import { GAME_CARDS } from './data/cards';
import { applyCardEffect } from './logic/cardEffects';
import CardModal from './components/CardModal';
import Stone from './components/Stone';
import Timer from './components/Timer';

/* -------------------- Utils -------------------- */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=mimi",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Happy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cute",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Cool",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Awesome",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Nice",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sweet",
];

const getRandomCard = (): GameCard => {
  const all = [...GAME_CARDS.IMMEDIATE, ...GAME_CARDS.HOLD];
  return all[Math.floor(Math.random() * all.length)];
};

/* -------------------- Interface for Sync Data -------------------- */
interface SyncData {
  type: 'SYNC' | 'MOVE' | 'JOIN' | 'CARD_EFFECT';
  board?: number[];
  scores?: { p1: number; p2: number };
  isP1Turn?: boolean;
  card?: GameCard | null;
  gameOver?: boolean;
  name?: string;
  avatar?: string;
  index?: number;
  skipNextTurn?: boolean;
}

export default function App() {
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(AVATARS[0]);
  const [isJoined, setIsJoined] = useState(false);
  const [oppInfo, setOppInfo] = useState({ name: 'Đang chờ...', avatar: '' });

  const [board, setBoard] = useState<number[]>([5, 5, 5, 5, 5, 1, 5, 5, 5, 5, 5, 1]);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isP1Turn, setIsP1Turn] = useState(true);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [skipNextTurn, setSkipNextTurn] = useState(false);

  const [myId, setMyId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [role, setRole] = useState<'p1' | 'p2' | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Đang kết nối...');
  
  const connRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const stateRef = useRef({ board, scores, isP1Turn, gameOver, skipNextTurn });

  useEffect(() => {
    stateRef.current = { board, scores, isP1Turn, gameOver, skipNextTurn };
  }, [board, scores, isP1Turn, gameOver, skipNextTurn]);

  /* ---------- BROADCAST LOGIC ---------- */
  const broadcastSync = useCallback((
    b: number[], 
    s: { p1: number; p2: number }, 
    t: boolean, 
    c?: GameCard | null, 
    end?: boolean,
    skip?: boolean
  ) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send({
        type: 'SYNC',
        board: b,
        scores: s,
        isP1Turn: t,
        card: c,
        gameOver: end,
        skipNextTurn: skip
      });
    }
  }, []);

  /* ---------- GAME ENGINE CORE ---------- */
  const executeMove = useCallback(async (index: number) => {
    if (stateRef.current.gameOver || stateRef.current.skipNextTurn) return;

    const newBoard = [...stateRef.current.board];
    const newScores = { ...stateRef.current.scores };
    let stones = newBoard[index];
    newBoard[index] = 0;
    setBoard([...newBoard]);

    let cur = index;
    while (stones > 0) {
      await delay(250);
      cur = (cur + 1) % 12;
      newBoard[cur]++;
      stones--;
      setBoard([...newBoard]);
    }

    const next = (cur + 1) % 12;
    const after = (next + 1) % 12;
    let captured = 0;

    // Logic Ăn Quan & Dân chuẩn Lan Edition
    if (newBoard[next] === 0 && newBoard[after] > 0) {
      const isQuan = after === 5 || after === 11;
      if (!(isQuan && newBoard[after] < 4)) {
        captured += isQuan ? 10 + (newBoard[after] - 1) : newBoard[after];
        newBoard[after] = 0;
        setBoard([...newBoard]);
      }
    }

    if (stateRef.current.isP1Turn) newScores.p1 += captured;
    else newScores.p2 += captured;

    let card: GameCard | null = null;
    const oppTerritory = stateRef.current.isP1Turn ? cur >= 6 && cur <= 10 : cur >= 0 && cur <= 4;
    if (oppTerritory || captured > 0) {
      card = getRandomCard();
      setCurrentCard(card);
    }

    setScores(newScores);
    let nextTurn = !stateRef.current.isP1Turn;
    
    // Xử lý skip next turn nếu cấp card MẤT LƯỢT
    if (skipNextTurn) {
      setSkipNextTurn(false);
      nextTurn = !nextTurn;
    }
    
    setIsP1Turn(nextTurn);

    if (newBoard[5] === 0 && newBoard[11] === 0) {
      setGameOver(true);
      broadcastSync(newBoard, newScores, nextTurn, card, true);
    } else {
      broadcastSync(newBoard, newScores, nextTurn, card, false, false);
    }
  }, [broadcastSync, skipNextTurn]);

  /* ---------- NETWORK LISTENERS ---------- */
  const setupDataListener = useCallback((c: DataConnection) => {
    c.on('data', async (data: unknown) => {
      const payload = data as SyncData;
      
      if (payload.type === 'JOIN') {
        setOppInfo({ name: payload.name || 'Người chơi', avatar: payload.avatar || AVATARS[0] });
        setIsJoined(true);
        setConnectionStatus('Đã kết nối');
      }
      
      if (payload.type === 'MOVE' && payload.index !== undefined) {
        await executeMove(payload.index);
      }
      
      if (payload.type === 'SYNC') {
        setBoard(payload.board!);
        setScores(payload.scores!);
        setIsP1Turn(payload.isP1Turn!);
        setCurrentCard(payload.card || null);
        setSkipNextTurn(payload.skipNextTurn || false);
        if (payload.gameOver) setGameOver(true);
      }
      
      if (payload.type === 'CARD_EFFECT') {
        // Xử lý effect từ đối phương
        if (payload.card?.id === 5) { // MẤT LƯỢT
          setSkipNextTurn(true);
        }
        if (payload.card?.id === 3) { // THÊM LƯỢT (không chuyển)
          // Logic: không chuyển lượt
        }
      }
    });
  }, [executeMove]);

  /* ---------- PEER INITIALIZATION ---------- */
  useEffect(() => {
    const p = new Peer();
    peerRef.current = p;
    
    p.on('open', id => {
      setMyId(id);
      setConnectionStatus('Sẵn sàng (tạo/vào phòng)');
    });
    
    p.on('connection', (c) => {
      connRef.current = c;
      setRole('p1');
      setConnectionStatus('Đã kết nối');
      setupDataListener(c);
      c.on('open', () => {
        c.send({ type: 'JOIN', name: userName, avatar: userAvatar });
      });
      c.on('error', () => setConnectionStatus('Lỗi kết nối'));
      c.on('close', () => setConnectionStatus('Kết nối bị đóng'));
    });
    
    p.on('error', () => setConnectionStatus('Lỗi Peer'));
    
    return () => p.destroy();
  }, [setupDataListener, userName, userAvatar]);

  const connectToPeer = () => {
    if (!targetId || !userName || !peerRef.current) return;
    setConnectionStatus('Đang kết nối...');
    const c = peerRef.current.connect(targetId);
    connRef.current = c;
    c.on('open', () => {
      setRole('p2');
      setIsJoined(true);
      setConnectionStatus('Đã kết nối');
      setupDataListener(c);
      c.send({ type: 'JOIN', name: userName, avatar: userAvatar });
    });
    c.on('error', () => setConnectionStatus('Lỗi kết nối - ID sai?'));
    c.on('close', () => setConnectionStatus('Kết nối bị đóng'));
  };

  const handleMove = (i: number) => {
    if (gameOver || !role || skipNextTurn) return;
    if (role === 'p1' && !isP1Turn) return;
    if (role === 'p2' && isP1Turn) return;

    if (role === 'p2') {
      connRef.current?.send({ type: 'MOVE', index: i });
    } else {
      executeMove(i);
    }
  };

  /* ---------- UI RENDER ---------- */
  if (!isJoined) {
    return (
      <div className="min-h-screen bg-[#f3e5ab] flex items-center justify-center p-4">
        <div className="bg-white p-6 sm:p-8 rounded-[30px] sm:rounded-[40px] shadow-2xl border-4 border-amber-800 w-full max-w-md">
          <h2 className="text-2xl sm:text-3xl font-black text-amber-900 mb-4 sm:mb-6 text-center underline">LAN EDITION</h2>
          
          <div className="flex justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
            {AVATARS.map(url => (
              <img key={url} src={url} alt="avatar" onClick={() => setUserAvatar(url)}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 cursor-pointer transition-all ${userAvatar === url ? 'border-amber-600 scale-110' : 'border-transparent opacity-50'}`}
              />
            ))}
          </div>
          
          <input 
            className="w-full border-2 border-amber-200 p-3 sm:p-4 rounded-2xl mb-3 sm:mb-4 font-bold outline-none text-sm sm:text-base" 
            placeholder="Tên của bạn..." 
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && userName && setIsJoined(true)}
          />
          
          <button 
            onClick={() => { if(userName) setIsJoined(true) }} 
            className="w-full bg-amber-800 text-white py-3 sm:py-4 rounded-2xl font-black mb-2 sm:mb-3 active:scale-95 transition-all text-sm sm:text-base"
          >
            TẠO PHÒNG
          </button>
          
          <div className="flex gap-2">
            <input 
              className="flex-1 border-2 border-amber-100 p-3 sm:p-4 rounded-2xl font-bold text-sm sm:text-base" 
              placeholder="ID phòng..." 
              value={targetId} 
              onChange={e => setTargetId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && connectToPeer()}
            />
            <button 
              onClick={connectToPeer} 
              className="bg-blue-600 text-white px-4 sm:px-6 rounded-2xl font-black text-sm sm:text-base"
            >
              VÀO
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-500 mt-4 text-center">{connectionStatus}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3e5ab] p-3 sm:p-6 flex flex-col items-center landscape:p-2 landscape:h-screen landscape:overflow-auto">
      {/* Header with players info */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-3 sm:mb-10 landscape:mb-2 flex-wrap gap-2 sm:gap-0">
        <div className="flex items-center gap-2 bg-white p-1.5 sm:p-2 pr-3 sm:pr-6 rounded-full shadow border-2 border-amber-500 min-w-fit landscape:scale-90 landscape:origin-left">
          <img src={role === 'p1' ? userAvatar : oppInfo.avatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="p1" />
          <div className="flex flex-col items-start">
            <p className="font-black text-xs sm:text-base">{role === 'p1' ? userName : oppInfo.name}</p>
            <p className="text-xs text-gray-600">P1: {scores.p1}đ</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-1 landscape:gap-0.5">
          <div className={`px-4 sm:px-8 py-1.5 sm:py-2 rounded-full font-black text-white shadow-lg text-xs sm:text-base landscape:scale-90 ${isP1Turn ? 'bg-amber-600' : 'bg-blue-600'}`}>
            {isP1Turn ? "⏱️ LƯỢT P1" : "⏱️ LƯỢT P2"}
          </div>
          {(isP1Turn ? role === 'p1' : role === 'p2') && (
            <Timer 
              isActive={!skipNextTurn && !gameOver}
              duration={30}
              onTimeout={() => {
                alert('Hết thời gian! Tự động chuyển lượt.');
                setIsP1Turn(!isP1Turn);
              }}
            />
          )}
          <button 
            onClick={() => { navigator.clipboard.writeText(myId); alert("Đã copy ID!"); }} 
            className="text-[8px] sm:text-[10px] font-bold text-amber-800 underline hover:text-amber-600 landscape:text-[7px]"
          >
            ID: {myId.slice(0,6)}...
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1.5 sm:p-2 pl-3 sm:pl-6 rounded-full shadow border-2 border-blue-500 min-w-fit landscape:scale-90 landscape:origin-right">
          <div className="flex flex-col items-end">
            <p className="font-black text-xs sm:text-base">{role === 'p2' ? userName : oppInfo.name}</p>
            <p className="text-xs text-gray-600">P2: {scores.p2}đ</p>
          </div>
          <img src={role === 'p2' ? userAvatar : oppInfo.avatar} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" alt="p2" />
        </div>
      </div>

      {/* Game Board - LANDSCAPE OPTIMIZED */}
      <div className="flex items-center gap-1 sm:gap-4 bg-amber-950 p-2 sm:p-10 landscape:p-2 rounded-[30px] sm:rounded-[80px] landscape:rounded-2xl shadow-2xl border-b-2 sm:border-b-[10px] landscape:border-b-2 border-black/30 overflow-auto landscape:max-h-[70vh]">
        <div className="w-12 h-24 sm:w-24 sm:h-52 landscape:w-16 landscape:h-32 bg-amber-50 rounded-full flex items-center justify-center text-xl sm:text-5xl landscape:text-2xl font-black border-4 border-amber-800 shadow-inner flex-shrink-0">
          <Stone count={board[11]} size="sm" />
        </div>
        
        <div className="grid grid-cols-5 gap-1 sm:gap-4 landscape:gap-1.5 flex-shrink-0">
          {[10, 9, 8, 7, 6].map(i => (
            <div 
              key={i} 
              onClick={() => handleMove(i)} 
              className={`w-12 h-12 sm:w-24 sm:h-24 landscape:w-14 landscape:h-14 rounded-lg sm:rounded-3xl landscape:rounded-2xl flex items-center justify-center text-lg sm:text-4xl landscape:text-xl font-black transition-all ${!isP1Turn && role==='p2' && !skipNextTurn ? 'bg-stone-100 scale-105 cursor-pointer hover:scale-110' : 'bg-stone-400 opacity-50 cursor-not-allowed'}`}
            >
              <Stone count={board[i]} size={board[i] > 10 ? 'sm' : 'md'} />
            </div>
          ))}
          {[0, 1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              onClick={() => handleMove(i)} 
              className={`w-12 h-12 sm:w-24 sm:h-24 landscape:w-14 landscape:h-14 rounded-lg sm:rounded-3xl landscape:rounded-2xl flex items-center justify-center text-lg sm:text-4xl landscape:text-xl font-black transition-all ${isP1Turn && role==='p1' && !skipNextTurn ? 'bg-amber-200 scale-105 cursor-pointer hover:scale-110' : 'bg-amber-500 opacity-50 cursor-not-allowed'}`}
            >
              <Stone count={board[i]} size={board[i] > 10 ? 'sm' : 'md'} />
            </div>
          ))}
        </div>
        
        <div className="w-12 h-24 sm:w-24 sm:h-52 landscape:w-16 landscape:h-32 bg-amber-50 rounded-full flex items-center justify-center text-xl sm:text-5xl landscape:text-2xl font-black border-4 border-amber-800 shadow-inner flex-shrink-0">
          <Stone count={board[5]} size="sm" />
        </div>
      </div>

      {skipNextTurn && (
        <p className="mt-2 text-red-600 font-bold text-sm sm:text-base landscape:text-xs animate-pulse">⚠️ Bị mất lượt!</p>
      )}

      {/* Card Modal */}
      {currentCard && (
        <CardModal 
          card={currentCard} 
          onConfirm={role === 'p1' ? () => {
            const res = applyCardEffect(currentCard, { board, scores, isP1Turn });
            setBoard(res.newBoard); 
            setScores(res.newScores); 
            setCurrentCard(null);
            
            if (currentCard.id === 5) {
              setSkipNextTurn(true);
            }
            
            broadcastSync(res.newBoard, res.newScores, isP1Turn, null);
          } : undefined}
        />
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[300] text-white p-4">
          <h2 className="text-4xl sm:text-6xl font-black mb-3 sm:mb-4">🎉 KẾT THÚC</h2>
          <p className="text-2xl sm:text-3xl mb-4 sm:mb-8 font-bold">
            P1: {scores.p1} - P2: {scores.p2}
          </p>
          <p className="text-lg sm:text-2xl mb-8 font-bold">
            {scores.p1 > scores.p2 ? '🏆 P1 THẮNG!' : scores.p2 > scores.p1 ? '🏆 P2 THẮNG!' : '🤝 HÒA!'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 sm:px-12 py-3 sm:py-4 bg-amber-600 rounded-full text-lg sm:text-2xl font-black shadow-xl hover:scale-110 transition-transform"
          >
            CHƠI LẠI
          </button>
        </div>
      )}
    </div>
  );
}