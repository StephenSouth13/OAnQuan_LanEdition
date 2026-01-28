// src/components/CardModal.tsx
import React from 'react';
import type { GameCard } from '../data/cards';
import { Scroll, Zap, Dice6 } from 'lucide-react';

interface CardModalProps {
  card: GameCard;
  onConfirm?: () => void; // 👈 P2 không có quyền bấm
}

const CardModal: React.FC<CardModalProps> = ({ card, onConfirm }) => {
  const isImmediate = card.type === 'IMMEDIATE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="
        bg-[#fff9e6]
        w-full max-w-sm
        rounded-[28px]
        border-[6px] border-amber-800
        shadow-[0_30px_80px_rgba(0,0,0,0.45)]
        overflow-hidden
        animate-in fade-in zoom-in duration-300
      ">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-700 p-4 text-center">
          <h2 className="text-white text-xl font-black uppercase tracking-[0.3em]">
            Thẻ Trạng Nguyên
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center text-center">
          <div className="
            w-24 h-24
            bg-amber-200
            rounded-full
            flex items-center justify-center
            mb-6
            border-4 border-amber-700
            shadow-inner
          ">
            {isImmediate ? (
              <Zap size={46} className="text-amber-800" />
            ) : (
              <Scroll size={46} className="text-amber-800" />
            )}
          </div>

          <h3 className="text-2xl font-black text-amber-900 mb-2">
            {card.name}
          </h3>

          <div className="w-20 h-1 bg-amber-400 rounded-full mb-4" />

          <p className="text-amber-800 font-medium leading-relaxed mb-8">
            {card.desc}
          </p>

          {onConfirm ? (
            <button
              onClick={onConfirm}
              className="
                w-full py-4
                bg-amber-800
                text-white font-black
                rounded-xl
                hover:bg-amber-700
                active:scale-95
                transition-all
                shadow-lg
                uppercase tracking-wider
              "
            >
              Xác nhận
              {card.id === 15 && (
                <Dice6 className="inline ml-2 -mb-0.5" size={20} />
              )}
            </button>
          ) : (
            <p className="text-xs italic opacity-50">
              Đang chờ Host xác nhận…
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-amber-100 p-2 text-center border-t border-amber-200">
          <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
            UEH Lan Edition • 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
