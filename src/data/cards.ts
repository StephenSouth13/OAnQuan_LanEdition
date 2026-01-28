export interface GameCard {
  id: number;
  name: string;
  desc: string;
  type: 'IMMEDIATE' | 'HOLD';
}

export const GAME_CARDS: { IMMEDIATE: GameCard[]; HOLD: GameCard[] } = {
  IMMEDIATE: [
    { id: 1, name: "VUA BAN THƯỞNG", desc: "Ô cuối ăn được X2 (nếu ăn)", type: 'IMMEDIATE' },
    { id: 2, name: "PHÁ LÀNG PHÁ XÓM", desc: "Bạn bị trừ 4 điểm", type: 'IMMEDIATE' },
    { id: 3, name: "THÊM LƯỢT", desc: "Bạn được thêm 1 lượt rải đá", type: 'IMMEDIATE' },
    { id: 4, name: "CHĂM HỌC HÀNH", desc: "Bạn được cộng 2 điểm", type: 'IMMEDIATE' },
    { id: 5, name: "MẤT LƯỢT", desc: "Bạn bị mất 1 lượt tiếp theo", type: 'IMMEDIATE' },
    { id: 6, name: "RẢI ĐỀU 5 ĐÁ", desc: "Đối phương phải rải 5 đá vào nhà", type: 'IMMEDIATE' },
    { id: 7, name: "HỒI QUAN", desc: "Lấy Quan đối phương đã ăn về ô trống", type: 'IMMEDIATE' },
    { id: 8, name: "LƯỜI HỌC HÀNH", desc: "Bạn bị trừ 3 điểm", type: 'IMMEDIATE' },
    { id: 9, name: "NGHÈO VƯỢT KHÓ", desc: "Bạn được cộng 5 điểm", type: 'IMMEDIATE' },
    { id: 10, name: "ĂN KẾ TIẾP", desc: "Ăn luôn ô liền sau hành động", type: 'IMMEDIATE' },
    { id: 11, name: "THI TRẠNG NGUYÊN", desc: "Trắc nghiệm Đúng +3, Sai -3", type: 'IMMEDIATE' }
  ],
  HOLD: [
    { id: 12, name: "TRƯỢT THI ĐÌNH", desc: "Bẫy đặt tại nhà, đối phương bốc trúng bị trừ 5 điểm", type: 'HOLD' },
    { id: 13, name: "TRƯỢT THI HƯƠNG", desc: "Bẫy đặt tại nhà, đối phương bốc trúng bị trừ 3 điểm", type: 'HOLD' },
    { id: 14, name: "CÂU HỎI ĐẲNG CẤP", desc: "Đúng nhận 'Lật Kèo', Sai bị trừ 10 điểm", type: 'HOLD' },
    { id: 15, name: "LẬT KÈO", desc: "Lắc xúc xắc 3 lần để đổi kho điểm", type: 'HOLD' },
    { id: 16, name: "ĐẬU TÚ TÀI", desc: "Rải đều 5 đá vào 5 ô bất kỳ", type: 'HOLD' },
    { id: 17, name: "STOP", desc: "Dừng tác dụng của thẻ chức năng", type: 'HOLD' }
  ]
};