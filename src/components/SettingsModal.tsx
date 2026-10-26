import React from 'react';
import { RulesConfig } from '../types/game';
import { DEFAULT_RULES } from '../game/constants';
import { X, Volume2, Music, Zap, RotateCcw, Sliders } from 'lucide-react';

interface SettingsModalProps {
  sfxEnabled: boolean;
  onToggleSfx: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  animationSpeed: 'normal' | 'fast';
  onSetAnimationSpeed: (speed: 'normal' | 'fast') => void;
  rules: RulesConfig;
  onUpdateRules: (rules: RulesConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  sfxEnabled,
  onToggleSfx,
  musicEnabled,
  onToggleMusic,
  animationSpeed,
  onSetAnimationSpeed,
  rules,
  onUpdateRules,
  onClose,
}) => {
  const toggleRule = (key: keyof RulesConfig) => {
    onUpdateRules({
      ...rules,
      [key]: !rules[key],
    });
  };

  const handleReset = () => {
    onUpdateRules({ ...DEFAULT_RULES });
    onSetAnimationSpeed('normal');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold">Game Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Audio Section */}
          <div>
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2.5">
              Audio & Soundtracks
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Sound Effects</div>
                    <div className="text-[11px] text-slate-500">
                      Dice rolls, hops, captures & chimes
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={sfxEnabled}
                  onChange={onToggleSfx}
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Music className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Ambient Music</div>
                    <div className="text-[11px] text-slate-500">
                      Calm procedural background music
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={musicEnabled}
                  onChange={onToggleMusic}
                  className="w-5 h-5 text-purple-600 rounded cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          </div>

          {/* Animation Speed */}
          <div>
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2.5">
              Animation Pace
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSetAnimationSpeed('normal')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  animationSpeed === 'normal'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                Normal Pace (300ms)
              </button>
              <button
                type="button"
                onClick={() => onSetAnimationSpeed('fast')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  animationSpeed === 'fast'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Fast Snappy (150ms)
              </button>
            </div>
          </div>

          {/* Rules Configuration */}
          <div>
            <h3 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-2.5">
              Rules & House Variants
            </h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">
                    3 Consecutive 6s Forfeit
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Third consecutive 6 forfeits turn
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.threeConsecutiveSixesForfeit}
                  onChange={() => toggleRule('threeConsecutiveSixesForfeit')}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">
                    Extra Turn on Capture
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Capturing an opponent grants bonus roll
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.captureExtraTurn}
                  onChange={() => toggleRule('captureExtraTurn')}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 text-xs">
                    Exact Roll for Home
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Tokens need exact roll to enter center
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={rules.exactRollForHome}
                  onChange={() => toggleRule('exactRollForHome')}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
