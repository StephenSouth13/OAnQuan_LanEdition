import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

import type { GameCard } from './data/cards';
import { GAME_CARDS } from './data/cards';
import { applyCardEffect } from './logic/cardEffects';
import CardModal from './components/CardModal';

/* -------------------- TYPES -------------------- */
type SyncPayload = {
  type: 'SYNC';
  board: number[];
  scores: { p1: number; p2: number };
  isP1Turn: boolean;
  card: GameCard | null;
  gameOver: boolean;
};

type MovePayload = {
  type: 'MOVE';
  index: number;
};

type NetPayload = SyncPayload | MovePayload;

/* -------------------- UTILS -------------------- */
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const getRandomCard = (): GameCard => {
  const all = [...GAME_CARDS.IMMEDIATE, ...GAME_CARDS.HOLD];
  return all[Math.floor(Math.random() * all.length)];
};

const isNetPayload = (data: unknown): data is NetPayload => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (data as { type: string }).type !== undefined
  );
};

/* -------------------- APP -------------------- */
export default function App() {
  /* ---------- GAME STATE ---------- */
  const [board, setBoard] = useState<number[]>([5,5,5,5,5,1,5,5,5,5,5,1]);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [isP1Turn, setIsP1Turn] = useState(true);
  const [currentCard, setCurrentCard] = useState<GameCard | null>(null);
  const [gameOver, setGameOver] = useState(false);

  /* ---------- MULTIPLAYER ---------- */
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [role, setRole] = useState<'p1' | 'p2' | null>(null);

  const connRef = useRef<DataConnection | null>(null);
  const stateRef = useRef({ board, scores, isP1Turn });

  useEffect(() => {
    stateRef.current = { board, scores, isP1Turn };
  }, [board, scores, isP1Turn]);

  /* ---------- GAME LOGIC ---------- */
  const executeMove = useCallback(async (index: number) => {
    const newBoard = [...stateRef.current.board];
    const newScores = { ...stateRef.current.scores };

    let stones = newBoard[index];
    newBoard[index] = 0;
    setBoard([...newBoard]);

    let cur = index;
    while (stones > 0) {
      await delay(200);
      cur = (cur + 1) % 12;
      newBoard[cur]++;
      stones--;
      setBoard([...newBoard]);
    }

    const next = (cur + 1) % 12;
    const after = (next + 1) % 12;

    let captured = 0;
    if (newBoard[next] === 0 && newBoard[after] > 0) {
      captured = newBoard[after];
      newBoard[after] = 0;
    }

    if (stateRef.current.isP1Turn) newScores.p1 += captured;
    else newScores.p2 += captured;

    let card: GameCard | null = null;
    if (captured > 0) {
      card = getRandomCard();
      setCurrentCard(card);
    }

    setBoard(newBoard);
    setScores(newScores);
    setIsP1Turn(!stateRef.current.isP1Turn);

    connRef.current?.send({
      type: 'SYNC',
      board: newBoard,
      scores: newScores,
      isP1Turn: !stateRef.current.isP1Turn,
      card,
      gameOver: false
    } satisfies SyncPayload);
  }, []);

  /* ---------- DATA LISTENER ---------- */
  const setupDataListener = useCallback(
    (conn: DataConnection) => {
      conn.on('data', async (raw: unknown) => {
        if (!isNetPayload(raw)) return;

        if (raw.type === 'MOVE' && role === 'p1') {
          await executeMove(raw.index);
        }

        if (raw.type === 'SYNC') {
          setBoard(raw.board);
          setScores(raw.scores);
          setIsP1Turn(raw.isP1Turn);
          setCurrentCard(raw.card);
          setGameOver(raw.gameOver);
        }
      });
    },
    [executeMove, role]
  );

  /* ---------- PEER INIT ---------- */
  useEffect(() => {
    const p = new Peer();
    p.on('open', id => setMyId(id));

    p.on('connection', conn => {
      setRole('p1');
      connRef.current = conn;
      setupDataListener(conn);
    });

    setPeer(p);
    return () => p.destroy();
  }, [setupDataListener]);

  const connectToPeer = () => {
    if (!peer || !targetId) return;
    const conn = peer.connect(targetId);
    connRef.current = conn;
    setRole('p2');
    setupDataListener(conn);
  };

  /* ---------- UI HANDLER ---------- */
  const handleMove = (i: number) => {
    if (gameOver) return;
    if (role === 'p2') {
      connRef.current?.send({ type: 'MOVE', index: i } satisfies MovePayload);
    } else {
      executeMove(i);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-[#f3e5ab] p-6">
      {!role && (
        <div className="bg-white p-4 rounded-xl mb-4">
          <p>ID của bạn: <b>{myId}</b></p>
          <input
            className="border p-2 mr-2"
            value={targetId}
            onChange={e => setTargetId(e.target.value)}
            placeholder="ID đối phương"
          />
          <button onClick={connectToPeer}>Kết nối</button>
        </div>
      )}

      <div className="grid grid-cols-6 gap-2">
        {board.map((v, i) => (
          <button
            key={i}
            onClick={() => handleMove(i)}
            className="bg-white p-4 rounded shadow"
          >
            {v}
          </button>
        ))}
      </div>

      {currentCard && (
        <CardModal
          card={currentCard}
          onConfirm={() => {
            const res = applyCardEffect(
              currentCard,
              { board, scores, isP1Turn }
            );
            setBoard(res.newBoard);
            setScores(res.newScores);
            setCurrentCard(null);
          }}
        />
      )}
    </div>
  );
}
