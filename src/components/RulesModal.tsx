import React from 'react';
import { X, Dices, Shield, Star, Home, Swords, RotateCcw } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold">Ludo Master Rules & Guide</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Rule 1: Yard and Deploy */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                1. Roll a 6 to Deploy
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                All 4 tokens start in your colored Yard. You must roll a{' '}
                <strong className="text-amber-700 font-extrabold">6</strong> to deploy a
                token onto your starting square on the main circuit.
              </p>
            </div>
          </div>

          {/* Rule 2: Movement */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200">
            <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                2. Clockwise Track Movement
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                Tokens move clockwise along the 52-tile circuit according to the exact number
                rolled on the dice. Click or tap any highlighted token to move it.
              </p>
            </div>
          </div>

          {/* Rule 3: Capturing */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50/80 border border-red-200">
            <div className="p-2 rounded-lg bg-red-600 text-white shrink-0 mt-0.5">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                3. Capturing Opponents
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                When your token lands on an unprotected square occupied by an opponent's token,
                the opponent token is captured and sent back to its starting yard! A capture grants you a{' '}
                <strong className="text-red-700 font-bold">bonus extra roll</strong>.
              </p>
            </div>
          </div>

          {/* Rule 4: Safe Squares */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
            <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
              <Star className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                4. Safe Squares (Star & Shield)
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                The 4 starting squares (marked with shields) and the 4 star squares are{' '}
                <strong className="text-emerald-700 font-bold">Safe Zones</strong>. Tokens resting on
                safe squares cannot be captured by any opponent.
              </p>
            </div>
          </div>

          {/* Rule 5: Home & Exact Roll */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/80 border border-purple-200">
            <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0 mt-0.5">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                5. Home Stretch & Exact Roll
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                After completing the circuit, your tokens enter your private colored Home
                Column. To enter the final central Home triangle, an{' '}
                <strong className="text-purple-700 font-bold">exact dice roll</strong> is required.
                The first player to move all 4 tokens into Home wins!
              </p>
            </div>
          </div>

          {/* Extra Turns & Consecutive Sixes */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="p-2 rounded-lg bg-slate-700 text-white shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                6. Extra Turns & 3 Sixes Forfeit
              </h3>
              <p className="text-slate-600 mt-0.5 text-xs">
                Rolling a 6 grants an immediate extra roll. However, rolling a 6 three consecutive
                times forfeits your turn to ensure fair play!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
