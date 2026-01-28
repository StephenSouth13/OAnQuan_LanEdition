export interface GameCard {
  id: number;
  name: string;
  desc: string;
  type: 'IMMEDIATE' | 'HOLD';
  emoji: string;
  color: string;
}

export const GAME_CARDS: { IMMEDIATE: GameCard[]; HOLD: GameCard[] } = {
  IMMEDIATE: [
    { id: 1, name: "NGON THÍIII", desc: "Ô cuối ăn được X2 (nếu lượt bốc có ăn)", type: 'IMMEDIATE', emoji: '✨', color: 'from-yellow-400 to-yellow-600' },
    { id: 2, name: "PHÁ LÀNG PHÁ XÓM", desc: "Bạn bị trừ 4 điểm", type: 'IMMEDIATE', emoji: '💥', color: 'from-red-400 to-red-600' },
    { id: 3, name: "THÊM LƯỢT", desc: "Bạn được thêm 1 lượt rải đá", type: 'IMMEDIATE', emoji: '⚡', color: 'from-blue-400 to-blue-600' },
    { id: 4, name: "CHĂM HỌC HÀNH", desc: "Bạn được cộng 2 điểm", type: 'IMMEDIATE', emoji: '📚', color: 'from-green-400 to-green-600' },
    { id: 5, name: "MẤT LƯỢT", desc: "Bạn bị mất 1 lượt tiếp theo", type: 'IMMEDIATE', emoji: '🛑', color: 'from-orange-400 to-orange-600' },
    { id: 6, name: "RẢI ĐỀU 5 ĐÁ", desc: "Đối phương phải bỏ 5 đá rải đều 5 ô", type: 'IMMEDIATE', emoji: '🌊', color: 'from-cyan-400 to-cyan-600' },
    { id: 7, name: "HỒI QUAN", desc: "Lấy Quan đối phương (đối phương phải có kho ≥10)", type: 'IMMEDIATE', emoji: '👑', color: 'from-purple-400 to-purple-600' },
    { id: 8, name: "LƯỜI HỌC HÀNH", desc: "Bạn bị trừ 3 điểm", type: 'IMMEDIATE', emoji: '😴', color: 'from-slate-400 to-slate-600' },
    { id: 9, name: "NGHÈO VƯỢT KHÓ", desc: "Bạn được cộng 5 điểm", type: 'IMMEDIATE', emoji: '💰', color: 'from-lime-400 to-lime-600' },
    { id: 10, name: "ĂN KẾ TIẾP", desc: "Ăn ô liền sau hành động (nếu đủ điều kiện)", type: 'IMMEDIATE', emoji: '😋', color: 'from-pink-400 to-pink-600' },
    { id: 11, name: "THI TRẠNG NGUYÊN", desc: "Trả lời câu hỏi - Đúng +3, Sai -3", type: 'IMMEDIATE', emoji: '🧠', color: 'from-indigo-400 to-indigo-600' }
  ],
  HOLD: [
    { id: 12, name: "ÔI THÔI CHỚTTT", desc: "Bẫy: đối phương bốc trúng bị trừ 5 điểm", type: 'HOLD', emoji: '🪤', color: 'from-red-500 to-red-700' },
    { id: 13, name: "MÀI CHỚT CHƯA CON", desc: "Bẫy: đối phương bốc trúng bị trừ 3 điểm", type: 'HOLD', emoji: '⚠️', color: 'from-yellow-500 to-yellow-700' },
    { id: 14, name: "CÂU HỎI ĐẲNG CẤP", desc: "Đúng nhận 'Lật Kèo', Sai bị trừ 10 điểm", type: 'HOLD', emoji: '❓', color: 'from-orange-500 to-orange-700' },
    { id: 15, name: "LẬT KÈO", desc: "Lắc 3 lần: ≤10 không gì, >11 đổi kho", type: 'HOLD', emoji: '🎲', color: 'from-purple-500 to-purple-700' },
    { id: 16, name: "ĐẬU TÚ TÀI", desc: "Rải đều 5 đá vào 5 ô (của mình/đối phương)", type: 'HOLD', emoji: '🎯', color: 'from-green-500 to-green-700' },
    { id: 17, name: "STOP", desc: "Dừng tác dụng thẻ chức năng đối phương", type: 'HOLD', emoji: '⏹️', color: 'from-slate-500 to-slate-700' }
  ]
};