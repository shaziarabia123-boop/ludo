import React from 'react';
import { PlayerColor } from '../types/game';
import { PLAYER_COLORS } from '../game/constants';

interface DiceProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  activeColor: PlayerColor;
  onRoll: () => void;
  consecutiveSixes: number;
  disabledReason?: string;
}

export const Dice: React.FC<DiceProps> = ({
  value,
  isRolling,
  canRoll,
  activeColor,
  onRoll,
  consecutiveSixes,
  disabledReason,
}) => {
  const colorData = PLAYER_COLORS[activeColor];

  // Render dice pips according to value 1..6
  const renderPips = (val: number) => {
    switch (val) {
      case 1:
        return (
          <div className="flex items-center justify-center w-full h-full">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-900 shadow-sm" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
            <span className="w-3 h-3 rounded-full bg-slate-900 self-start shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-slate-900 self-end shadow-sm" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-between w-full h-full p-2.5">
            <span className="w-3 h-3 rounded-full bg-slate-900 self-start shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-slate-900 self-center shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-slate-900 self-end shadow-sm" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 grid-rows-2 w-full h-full p-2.5 gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-start" />
            <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-end" />
            <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-start" />
            <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="relative w-full h-full p-2.5">
            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-start" />
              <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-end" />
              <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-start" />
              <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm place-self-end" />
            </div>
            <span className="w-3 h-3 rounded-full bg-slate-900 shadow-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        );
      case 6:
        return (
          <div className="grid grid-cols-2 grid-rows-3 w-full h-full p-2.5 gap-x-3 gap-y-1.5 items-center justify-items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-sm" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-full h-full text-slate-400 font-bold text-xs uppercase tracking-wider">
            Roll
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <div className="relative">
        {/* Glow halo when ready to roll */}
        {canRoll && !isRolling && (
          <div
            className="absolute -inset-2 rounded-2xl animate-pulse blur-md opacity-75"
            style={{ backgroundColor: colorData.primary }}
          />
        )}

        <button
          type="button"
          onClick={onRoll}
          disabled={!canRoll || isRolling}
          aria-label={canRoll ? `Roll dice for ${colorData.name}` : 'Dice roll unavailable'}
          title={canRoll ? 'Click or press Space to roll' : disabledReason || 'Waiting...'}
          className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-200 border-2 shadow-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 ${
            canRoll && !isRolling
              ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-lg'
              : 'cursor-not-allowed opacity-90'
          } ${isRolling ? 'animate-bounce rotate-12 scale-110' : ''}`}
          style={{
            borderColor: canRoll ? colorData.primary : '#CBD5E1',
            boxShadow: canRoll
              ? `0 10px 25px -5px ${colorData.ring}, 0 8px 10px -6px rgba(0, 0, 0, 0.1)`
              : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Subtle glossy top highlight */}
          <div className="absolute top-1 left-2 right-2 h-4 bg-gradient-to-b from-white/80 to-transparent rounded-t-xl pointer-events-none" />

          {/* Dice Face Content */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
            {renderPips(isRolling ? Math.floor(Math.random() * 6) + 1 : value || 6)}
          </div>
        </button>

        {/* Extra turn indicator badge on 6 */}
        {value === 6 && !isRolling && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
            +1 ROLL
          </div>
        )}
      </div>

      {/* Button / Instruction Text */}
      <div className="text-center">
        {canRoll && (
          <button
            type="button"
            onClick={onRoll}
            className="text-xs font-bold px-3 py-1 rounded-full text-white shadow-sm transition-transform active:scale-95 cursor-pointer"
            style={{ backgroundColor: colorData.primary }}
          >
            TAP TO ROLL
          </button>
        )}
        {!canRoll && value && !isRolling && (
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Rolled {value}
          </span>
        )}
        {consecutiveSixes > 0 && (
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
            Consecutive 6s: {consecutiveSixes}/3
          </div>
        )}
      </div>
    </div>
  );
};
