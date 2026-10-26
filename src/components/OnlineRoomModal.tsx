import React, { useState } from 'react';
import { Player, PlayerColor, GameMode } from '../types/game';
import { PLAYER_COLORS, COLOR_ORDER } from '../game/constants';
import { createInitialTokens } from '../game/rules';
import { X, Globe, Copy, Check, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface OnlineRoomModalProps {
  onClose: () => void;
  onStartOnlineMatch: (players: Player[]) => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  onClose,
  onStartOnlineMatch,
}) => {
  const [roomCode, setRoomCode] = useState<string>(() =>
    'LUDO-' + Math.floor(1000 + Math.random() * 9000)
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(true);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Simulated connected room peers
  const [roomPlayers, setRoomPlayers] = useState<
    { name: string; color: PlayerColor; isHost: boolean; ready: boolean }[]
  >([
    { name: 'You (Host)', color: 'red', isHost: true, ready: true },
    { name: 'Guest Panda', color: 'green', isHost: false, ready: true },
    { name: 'Guest Falcon', color: 'yellow', isHost: false, ready: false },
    { name: 'Guest Tiger', color: 'blue', isHost: false, ready: true },
  ]);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    const nextReady = !isReady;
    setIsReady(nextReady);
    setRoomPlayers((prev) =>
      prev.map((p, idx) => (idx === 0 ? { ...p, ready: nextReady } : p))
    );
  };

  const handleStartMatch = () => {
    const activePlayers: Player[] = roomPlayers.map((rp, idx) => ({
      id: `online-player-${rp.color}`,
      name: rp.name,
      color: rp.color,
      type: idx === 0 ? 'human' : 'computer', // local client controls host, peers act as synced controllers
      tokens: createInitialTokens(rp.color),
      hasWon: false,
    }));

    onStartOnlineMatch(activePlayers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold">Online Multiplayer Lobby</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* Room Code Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Active Room Code
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono tracking-wider">
                {roomCode}
              </div>
              <div className="text-[11px] text-slate-500">
                Share this code with friends to join your match room
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="py-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-indigo-600" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Join By Code */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter 8-digit Room Code to Join..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase font-mono"
            />
            <button
              type="button"
              onClick={() => {
                if (joinCodeInput.trim()) {
                  setRoomCode(joinCodeInput.trim());
                  setJoinCodeInput('');
                }
              }}
              className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
            >
              Join Room
            </button>
          </div>

          {/* Connected Room Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-600 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Players in Room ({roomPlayers.filter((p) => p.ready).length}/4 Ready)
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Peer Session
              </span>
            </div>

            <div className="space-y-2">
              {roomPlayers.map((player) => {
                const c = PLAYER_COLORS[player.color];
                return (
                  <div
                    key={player.color}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xs"
                        style={{ backgroundColor: c.primary }}
                      >
                        {c.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-xs">
                          {player.name}
                        </div>
                        <div className="text-[10px] text-slate-500">{c.name} Yard</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {player.ready ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-700" />
                          Ready
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleToggleReady}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs border transition-colors cursor-pointer ${
              isReady
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isReady ? 'I am Ready (Click to Unready)' : 'Mark Ready'}
          </button>

          <button
            type="button"
            onClick={handleStartMatch}
            className="flex-1 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Start Room Match
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
