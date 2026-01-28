import type { GameCard } from '../data/cards';

type GameState = {
  board: number[];
  scores: { p1: number; p2: number };
  isP1Turn: boolean;
};

export const applyCardEffect = (card: GameCard, state: GameState) => {
  const newBoard = [...state.board];
  const newScores = { ...state.scores };

  const currentPlayer: 'p1' | 'p2' = state.isP1Turn ? 'p1' : 'p2';
  const opponent: 'p1' | 'p2' = state.isP1Turn ? 'p2' : 'p1';

  switch (card.id) {
    case 2: // Phá làng phá xóm
      newScores[currentPlayer] = Math.max(0, newScores[currentPlayer] - 4);
      break;

    case 4: // Chăm học hành
      newScores[currentPlayer] += 2;
      break;

    case 6: { // Rải đều 5 đá
      const oppScore = newScores[opponent];

      if (oppScore >= 9) {
        const oppSlots = state.isP1Turn
          ? [6, 7, 8, 9, 10]
          : [0, 1, 2, 3, 4];

        oppSlots.forEach(idx => newBoard[idx]++);

        // Nếu giàu quá thì rải thêm vào Quan
        if (oppScore > 20) {
          newBoard[5]++;
          newBoard[11]++;
        }

        newScores[opponent] -= 5;
      }
      break;
    }

    case 7: { // Hồi quan
      const targetQuan = state.isP1Turn ? 5 : 11;

      if (newBoard[targetQuan] === 0 && newScores[opponent] >= 10) {
        newBoard[targetQuan] = 1;
        newScores[opponent] -= 10;
      }
      break;
    }

    case 8: // Lười học hành
      newScores[currentPlayer] = Math.max(0, newScores[currentPlayer] - 3);
      break;

    case 9: // Nghèo vượt khó
      newScores[currentPlayer] += 5;
      break;

    case 11: { // Thi trạng nguyên
      const isCorrect = Math.random() > 0.5;
      newScores[currentPlayer] += isCorrect ? 3 : -3;
      break;
    }

    case 15: { // Lật kèo
      const rolls = Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * 6) + 1
      );

      const total = rolls.reduce((a, b) => a + b, 0);

      if (total > 11) {
        const temp = newScores.p1;
        newScores.p1 = newScores.p2;
        newScores.p2 = temp;
      }
      break;
    }

    default:
      console.warn('Card logic not implemented yet for ID:', card.id);
  }

  return { newBoard, newScores };
};
