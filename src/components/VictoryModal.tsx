import React, { useEffect } from 'react';
import { Player } from '../types/game';
import { PLAYER_COLORS } from '../game/constants';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Crown, Medal } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface VictoryModalProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  players,
  onPlayAgain,
  onReturnToMenu,
}) => {
  const c = PLAYER_COLORS[winner.color];

  useEffect(() => {
    // Play victory sound fanfare
    soundManager.playVictoryFanfare();

    // Trigger celebratory confetti cannon
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F04444', '#24B96B', '#F5C542', '#3984F5'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F04444', '#24B96B', '#F5C542', '#3984F5'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Sort players by finished tokens
  const rankedPlayers = [...players].sort((a, b) => {
    const aHome = a.tokens.filter((t) => t.status === 'home').length;
    const bHome = b.tokens.filter((t) => t.status === 'home').length;
    return bHome - aHome;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md select-none animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden flex flex-col items-center text-center p-6 sm:p-8">
        {/* Glow halo */}
        <div
          className="absolute -top-16 w-48 h-48 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: c.primary }}
        />

        {/* Crown & Trophy Icon */}
        <div className="relative mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 shadow-xl flex items-center justify-center border-4 border-white">
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-700 animate-bounce" />
          </div>
          <Crown className="w-8 h-8 text-amber-400 absolute -top-3 -right-2 drop-shadow rotate-12" />
        </div>

        {/* Winner Announcement */}
        <span
          className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm mb-2"
          style={{ backgroundColor: c.primary }}
        >
          {c.name} Victory!
        </span>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {winner.name} Wins!
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs">
          All 4 tokens successfully returned home! A glorious triumph on the board.
        </p>

        {/* Final Standings */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 my-5 space-y-2 text-left">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            Match Standings
          </div>
          {rankedPlayers.map((player, idx) => {
            const pc = PLAYER_COLORS[player.color];
            const homeCount = player.tokens.filter((t) => t.status === 'home').length;
            return (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-black text-[11px] text-slate-600">
                    {idx === 0 ? <Medal className="w-3.5 h-3.5 text-amber-500" /> : idx + 1}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: pc.primary }}
                  />
                  <span className="font-bold text-xs text-slate-800">
                    {player.name}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-600">
                  {homeCount}/4 Home
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            type="button"
            onClick={onReturnToMenu}
            className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};
