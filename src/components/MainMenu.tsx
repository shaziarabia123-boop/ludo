import React from 'react';
import { Play, Users, Bot, Globe, BookOpen, Settings, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface MainMenuProps {
  onStartVsComputer: () => void;
  onStartLocalMultiplayer: () => void;
  onOpenOnline: () => void;
  onOpenRules: () => void;
  onOpenSettings: () => void;
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  hasSavedGame: boolean;
  onResumeSavedGame: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartVsComputer,
  onStartLocalMultiplayer,
  onOpenOnline,
  onOpenRules,
  onOpenSettings,
  sfxEnabled,
  onToggleSfx,
  hasSavedGame,
  onResumeSavedGame,
}) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden select-none">
      {/* Background Decorative Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      {/* Top Bar: Settings & Sound toggles */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">
            Premium Board Edition
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSfx}
            aria-label={sfxEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-200 cursor-pointer backdrop-blur-md"
          >
            {sfxEnabled ? (
              <Volume2 className="w-5 h-5 text-amber-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-slate-200 cursor-pointer backdrop-blur-md"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero & Logo Section */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-lg w-full">
        {/* Game Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide uppercase mb-3 shadow-sm backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          Classic 4-Player Strategy
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-300 drop-shadow-lg">
          LUDO MASTER
        </h1>
        <p className="text-sm sm:text-base text-slate-300 font-medium mt-2 max-w-md">
          Roll the dice, race tokens home, outsmart rivals, and master the board!
        </p>

        {/* 4 Colored Token Gems Preview */}
        <div className="flex items-center gap-4 my-6">
          <div className="w-9 h-9 rounded-full bg-[#F04444] shadow-lg shadow-red-500/40 border-2 border-white ring-2 ring-red-400/50 flex items-center justify-center font-black text-xs">
            1
          </div>
          <div className="w-9 h-9 rounded-full bg-[#24B96B] shadow-lg shadow-green-500/40 border-2 border-white ring-2 ring-green-400/50 flex items-center justify-center font-black text-xs">
            2
          </div>
          <div className="w-9 h-9 rounded-full bg-[#F5C542] shadow-lg shadow-amber-500/40 border-2 border-white ring-2 ring-amber-400/50 flex items-center justify-center font-black text-xs">
            3
          </div>
          <div className="w-9 h-9 rounded-full bg-[#3984F5] shadow-lg shadow-blue-500/40 border-2 border-white ring-2 ring-blue-400/50 flex items-center justify-center font-black text-xs">
            4
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
          {hasSavedGame && (
            <button
              type="button"
              onClick={onResumeSavedGame}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              Resume Active Match
            </button>
          )}

          {/* Primary Play Button: Against Computer */}
          <button
            type="button"
            onClick={onStartVsComputer}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Bot className="w-5 h-5 text-slate-950" />
            Play vs Computer
          </button>

          {/* Local Multiplayer */}
          <button
            type="button"
            onClick={onStartLocalMultiplayer}
            className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer backdrop-blur-sm"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            Pass & Play (Local 2-4P)
          </button>

          {/* Online Multiplayer */}
          <button
            type="button"
            onClick={onOpenOnline}
            className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer backdrop-blur-sm"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            Online Multiplayer Room
          </button>

          {/* Rules & Tutorial */}
          <button
            type="button"
            onClick={onOpenRules}
            className="w-full py-2.5 px-4 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            How to Play & Rules Guide
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full max-w-4xl text-center text-[11px] text-slate-400 z-10 pt-4">
        Supports Touch & Mouse • Authentic 52-tile circuit • Safe Stars & Shield Captures
      </div>
    </div>
  );
};
