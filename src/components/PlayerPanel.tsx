import React from 'react';
import { Player, PlayerColor } from '../types/game';
import { PLAYER_COLORS } from '../game/constants';
import { Bot, User, Home, Disc, ShieldCheck } from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  isThinking?: boolean;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isActive,
  isThinking = false,
}) => {
  const c = PLAYER_COLORS[player.color];

  // Token counts
  const yardCount = player.tokens.filter((t) => t.status === 'yard').length;
  const trackCount = player.tokens.filter(
    (t) => t.status === 'track' || t.status === 'home_column'
  ).length;
  const homeCount = player.tokens.filter((t) => t.status === 'home').length;

  return (
    <div
      className={`relative rounded-xl border-2 p-2.5 sm:p-3 transition-all duration-300 ${
        isActive
          ? 'bg-white shadow-xl scale-[1.02] ring-2'
          : 'bg-white/80 shadow-sm opacity-85'
      }`}
      style={{
        borderColor: isActive ? c.primary : '#E2E8F0',
        ...(isActive ? { ringColor: c.primary } : {}),
      }}
    >
      {/* Active turn badge */}
      {isActive && (
        <div
          className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white uppercase tracking-wider shadow-sm flex items-center gap-1"
          style={{ backgroundColor: c.primary }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Active Turn
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-0.5">
        {/* Avatar & Player Name */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0 relative"
            style={{ backgroundColor: c.primary }}
          >
            {player.type === 'computer' ? (
              <Bot className="w-4 h-4" />
            ) : (
              <User className="w-4 h-4" />
            )}
            {/* Color dot indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-white border border-slate-300 flex items-center justify-center">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: c.primary }}
              />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                {player.name}
              </span>
              {player.type === 'computer' && (
                <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 rounded uppercase">
                  {player.difficulty || 'AI'}
                </span>
              )}
            </div>
            <div className="text-[10px] font-medium text-slate-500">
              {c.name}
            </div>
          </div>
        </div>

        {/* Win Status / Ranking */}
        {player.hasWon && (
          <div className="shrink-0 flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
            <ShieldCheck className="w-3 h-3 text-amber-600" />
            Winner!
          </div>
        )}
      </div>

      {/* Thinking state for AI */}
      {isActive && isThinking && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium animate-pulse">
          <Bot className="w-3.5 h-3.5 animate-spin" />
          Thinking...
        </div>
      )}

      {/* Token status counters */}
      <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-100 text-center">
        {/* Yard */}
        <div className="bg-slate-50 rounded p-1 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Yard</div>
          <div className="text-xs font-bold text-slate-700">{yardCount}</div>
        </div>

        {/* Track */}
        <div className="bg-slate-50 rounded p-1 border border-slate-100">
          <div className="text-[9px] font-semibold text-slate-400 uppercase flex items-center justify-center gap-0.5">
            <Disc className="w-2.5 h-2.5" />
            Track
          </div>
          <div className="text-xs font-bold text-slate-700">{trackCount}</div>
        </div>

        {/* Home */}
        <div
          className="rounded p-1 border"
          style={{
            backgroundColor: `${c.light}60`,
            borderColor: `${c.primary}40`,
          }}
        >
          <div
            className="text-[9px] font-semibold uppercase flex items-center justify-center gap-0.5"
            style={{ color: c.dark }}
          >
            <Home className="w-2.5 h-2.5" />
            Home
          </div>
          <div
            className="text-xs font-black"
            style={{ color: c.dark }}
          >
            {homeCount}/4
          </div>
        </div>
      </div>
    </div>
  );
};
