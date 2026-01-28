// src/components/CardModal.tsx
import React, { useState } from 'react';
import type { GameCard } from '../data/cards';
import { Dice6 } from 'lucide-react';

interface CardModalProps {
  card: GameCard;
  onConfirm?: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, onConfirm }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isImmediate = card.type === 'IMMEDIATE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4">
      <div 
        className="relative w-full max-w-sm"
        style={{ perspective: '1000px' }}
      >
        <div
          className={`
            bg-gradient-to-br ${card.color}
            rounded-[20px] sm:rounded-[28px]
            border-[4px] sm:border-[6px] border-white
            shadow-[0_30px_80px_rgba(0,0,0,0.45)]
            overflow-hidden
            animate-in fade-in zoom-in duration-300
            cursor-pointer transition-transform
            ${isFlipped ? 'scale-95' : 'scale-100'}
          `}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Header */}
          <div className="bg-white/20 backdrop-blur p-3 sm:p-4 text-center border-b-2 border-white/30">
            <h2 className="text-white text-base sm:text-xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              {isImmediate ? '⚡ DÙNG NGAY' : '🎁 CÓ THỂ ĐỂ DÀNH'}
            </h2>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8 flex flex-col items-center text-center">
            <div className="
              w-20 h-20 sm:w-24 sm:h-24
              bg-white/20
              rounded-full
              flex items-center justify-center
              mb-4 sm:mb-6
              border-4 border-white
              shadow-inner
              text-4xl sm:text-6xl
            ">
              {card.emoji}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white mb-2 drop-shadow-lg">
              {card.name}
            </h3>

            <div className="w-16 sm:w-20 h-1 bg-white/50 rounded-full mb-3 sm:mb-4" />

            <p className="text-xs sm:text-base text-white font-medium leading-relaxed mb-6 sm:mb-8 drop-shadow-md">
              {card.desc}
            </p>

            {onConfirm ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onConfirm();
                }}
                className="
                  w-full py-3 sm:py-4
                  bg-white text-gray-900
                  font-black
                  rounded-xl
                  hover:bg-gray-100
                  active:scale-95
                  transition-all
                  shadow-lg
                  uppercase tracking-wider
                  text-sm sm:text-base
                "
              >
                Xác nhận
                {card.id === 15 && (
                  <Dice6 className="inline ml-2 -mb-0.5" size={18} />
                )}
              </button>
            ) : (
              <p className="text-[10px] sm:text-xs italic opacity-75 text-white">
                Đang chờ Host xác nhận…
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/10 p-2 text-center border-t border-white/20 backdrop-blur">
            <p className="text-[8px] sm:text-[10px] font-black opacity-60 uppercase tracking-widest text-white">
              Bấm để xem lại • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
