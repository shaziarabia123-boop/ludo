import React, { useState } from 'react';
import { GameMode, Player, PlayerColor, PlayerType, AIDifficulty } from '../types/game';
import { PLAYER_COLORS, COLOR_ORDER } from '../game/constants';
import { createInitialTokens } from '../game/rules';
import { X, ArrowLeft, Play, Bot, User, Shield } from 'lucide-react';

interface SetupModalProps {
  initialMode: GameMode;
  onClose: () => void;
  onStartGame: (players: Player[], mode: GameMode) => void;
}

interface SeatConfig {
  color: PlayerColor;
  name: string;
  type: PlayerType;
  difficulty: AIDifficulty;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  initialMode,
  onClose,
  onStartGame,
}) => {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(
    initialMode === 'computer' ? 4 : 4
  );
  const [twoPlayerLayout, setTwoPlayerLayout] = useState<'opposite' | 'adjacent'>('opposite');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');

  // Seats configuration
  const [seats, setSeats] = useState<SeatConfig[]>([
    { color: 'red', name: 'Player 1', type: 'human', difficulty: 'normal' },
    {
      color: 'green',
      name: initialMode === 'computer' ? 'Bot Alpha' : 'Player 2',
      type: initialMode === 'computer' ? 'computer' : 'human',
      difficulty: 'normal',
    },
    {
      color: 'yellow',
      name: initialMode === 'computer' ? 'Bot Beta' : 'Player 3',
      type: initialMode === 'computer' ? 'computer' : 'human',
      difficulty: 'normal',
    },
    {
      color: 'blue',
      name: initialMode === 'computer' ? 'Bot Gamma' : 'Player 4',
      type: initialMode === 'computer' ? 'computer' : 'human',
      difficulty: 'normal',
    },
  ]);

  const updateSeat = (index: number, partial: Partial<SeatConfig>) => {
    setSeats((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...partial };
      return copy;
    });
  };

  const handleStart = () => {
    let activeColors: PlayerColor[] = [];

    if (playerCount === 2) {
      if (twoPlayerLayout === 'opposite') {
        // Red and Yellow are opposite corners
        activeColors = ['red', 'yellow'];
      } else {
        activeColors = ['red', 'green'];
      }
    } else if (playerCount === 3) {
      activeColors = ['red', 'green', 'yellow'];
    } else {
      activeColors = COLOR_ORDER;
    }

    const gamePlayers: Player[] = activeColors.map((color, i) => {
      const seat = seats.find((s) => s.color === color) || {
        color,
        name: `Player ${i + 1}`,
        type: i === 0 ? 'human' : ('computer' as PlayerType),
        difficulty,
      };

      return {
        id: `player-${color}`,
        name: seat.name.trim() || `Player ${i + 1}`,
        color,
        type: seat.type,
        difficulty: seat.type === 'computer' ? difficulty : undefined,
        tokens: createInitialTokens(color),
        hasWon: false,
      };
    });

    onStartGame(gamePlayers, initialMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base sm:text-lg font-bold">
              {initialMode === 'computer' ? 'Match vs Computer' : 'Pass & Play Setup'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-800">
          {/* Player Count Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPlayerCount(count)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    playerCount === count
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* 2-Player Board Layout Option */}
          {playerCount === 2 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <label className="block text-xs font-bold text-amber-800 mb-1.5">
                2-Player Board Layout
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setTwoPlayerLayout('opposite')}
                  className={`p-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                    twoPlayerLayout === 'opposite'
                      ? 'border-amber-600 bg-white text-amber-900 shadow-sm'
                      : 'border-transparent text-amber-700 hover:bg-amber-100/50'
                  }`}
                >
                  Opposite (Red vs Yellow)
                  <span className="block text-[10px] text-amber-600 font-normal">
                    Recommended classic fair layout
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTwoPlayerLayout('adjacent')}
                  className={`p-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                    twoPlayerLayout === 'adjacent'
                      ? 'border-amber-600 bg-white text-amber-900 shadow-sm'
                      : 'border-transparent text-amber-700 hover:bg-amber-100/50'
                  }`}
                >
                  Adjacent (Red vs Green)
                  <span className="block text-[10px] text-amber-600 font-normal">
                    Quick clash layout
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* AI Difficulty (If any computer players) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Computer Difficulty</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {difficulty === 'easy'
                  ? 'Casual & Beginner friendly'
                  : difficulty === 'normal'
                  ? 'Sensible moves & captures'
                  : 'Smart strategy & safe priority'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    difficulty === lvl
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Player Seats */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Configure Players
            </label>
            <div className="space-y-2">
              {seats.slice(0, playerCount).map((seat, idx) => {
                const c = PLAYER_COLORS[seat.color];
                return (
                  <div
                    key={seat.color}
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    {/* Color Badge */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm"
                      style={{ backgroundColor: c.primary }}
                    >
                      {idx + 1}
                    </div>

                    {/* Name Input */}
                    <input
                      type="text"
                      value={seat.name}
                      maxLength={16}
                      onChange={(e) => updateSeat(idx, { name: e.target.value })}
                      placeholder={`Player ${idx + 1}`}
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />

                    {/* Human vs Computer Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        updateSeat(idx, {
                          type: seat.type === 'human' ? 'computer' : 'human',
                        })
                      }
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                        seat.type === 'computer'
                          ? 'border-indigo-300 bg-indigo-100 text-indigo-700'
                          : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      {seat.type === 'computer' ? (
                        <>
                          <Bot className="w-3.5 h-3.5" />
                          Bot
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5" />
                          Human
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};
