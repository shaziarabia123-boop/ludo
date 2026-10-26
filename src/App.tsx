import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Player,
  PlayerColor,
  Token,
  MoveOption,
  GameMode,
  RulesConfig,
  GamePhase,
} from './types/game';
import {
  PLAYER_COLORS,
  DEFAULT_RULES,
  COLOR_ORDER,
} from './game/constants';
import {
  createInitialTokens,
  getLegalMoves,
  applyMove,
  chooseAIMove,
  checkWinCondition,
} from './game/rules';
import { soundManager } from './utils/audio';
import { Board } from './components/Board';
import { Dice } from './components/Dice';
import { PlayerPanel } from './components/PlayerPanel';
import { MainMenu } from './components/MainMenu';
import { SetupModal } from './components/SetupModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { VictoryModal } from './components/VictoryModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import {
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  Home,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

const STORAGE_KEY = 'ludo_active_game_state_v1';

export default function App() {
  // Screen / modal states
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [activeModal, setActiveModal] = useState<
    'setup' | 'rules' | 'settings' | 'online' | 'victory' | null
  >(null);

  // Match states
  const [mode, setMode] = useState<GameMode>('computer');
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [legalMoves, setLegalMoves] = useState<MoveOption[]>([]);
  const [turnMessage, setTurnMessage] = useState<string>('');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState<boolean>(false);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);

  // Settings
  const [rules, setRules] = useState<RulesConfig>(DEFAULT_RULES);
  const [animationSpeed, setAnimationSpeed] = useState<'normal' | 'fast'>('normal');
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(false);

  // Capture / event banner
  const [eventNotification, setEventNotification] = useState<{
    text: string;
    type: 'capture' | 'deploy' | 'bonus' | 'safe';
  } | null>(null);

  // Keep a ref for active timers to prevent memory leaks or overlapping turns
  const turnTimeoutRef = useRef<number | null>(null);

  // Load preferences and check saved game on mount
  useEffect(() => {
    setSfxEnabled(soundManager.getSfxEnabled());
    setMusicEnabled(soundManager.getMusicEnabled());

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.players && parsed.players.length > 0) {
          setHasSavedGame(true);
        }
      }
    } catch {}

    // Check ?autostart=1 support for automated verification / testing
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      startStandardGame('computer');
    }
  }, []);

  // Save active game to localStorage
  const persistGame = (currentPlayers: Player[], activeIdx: number, currentMode: GameMode) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          players: currentPlayers,
          activePlayerIndex: activeIdx,
          mode: currentMode,
          rules,
        })
      );
      setHasSavedGame(true);
    } catch {}
  };

  const clearSavedGame = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedGame(false);
    } catch {}
  };

  const activePlayer = players[activePlayerIndex] || null;

  // Initialize a match with player configurations
  const startMatch = (newPlayers: Player[], gameMode: GameMode) => {
    setPlayers(newPlayers);
    setMode(gameMode);
    setActivePlayerIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setIsMoving(false);
    setConsecutiveSixes(0);
    setLegalMoves([]);
    setWinner(null);
    setPhase('waiting_for_roll');
    setActiveModal(null);
    setEventNotification(null);

    const firstColor = PLAYER_COLORS[newPlayers[0].color].name;
    const msg = `${firstColor}'s Turn — Roll the dice to begin!`;
    setTurnMessage(msg);
    setMoveHistory([`Match started (${gameMode}) with ${newPlayers.length} players.`]);

    persistGame(newPlayers, 0, gameMode);
    soundManager.playTurnChange();
  };

  // Quick start standard 4-player game (1 Human Red vs 3 Bots)
  const startStandardGame = (gameMode: GameMode = 'computer') => {
    const newPlayers: Player[] = COLOR_ORDER.map((color, idx) => ({
      id: `player-${color}`,
      name: idx === 0 ? 'You (Red)' : `Bot ${idx + 1}`,
      color,
      type: idx === 0 ? 'human' : 'computer',
      difficulty: 'normal',
      tokens: createInitialTokens(color),
      hasWon: false,
    }));
    startMatch(newPlayers, gameMode);
  };

  // Resume game from storage
  const resumeSavedGame = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlayers(parsed.players);
        setActivePlayerIndex(parsed.activePlayerIndex || 0);
        setMode(parsed.mode || 'computer');
        if (parsed.rules) setRules(parsed.rules);
        setDiceValue(null);
        setIsRolling(false);
        setIsMoving(false);
        setConsecutiveSixes(0);
        setLegalMoves([]);
        setWinner(null);
        setPhase('waiting_for_roll');
        const currentColor = parsed.players[parsed.activePlayerIndex]?.color as PlayerColor;
        const colorName = PLAYER_COLORS[currentColor]?.name || 'Player';
        setTurnMessage(`${colorName}'s Turn — Roll the dice!`);
        soundManager.playButtonClick();
      }
    } catch {}
  };

  // Show a momentary event notification banner (e.g. Capture! +1 Roll!)
  const triggerNotification = (text: string, type: 'capture' | 'deploy' | 'bonus' | 'safe') => {
    setEventNotification({ text, type });
    window.setTimeout(() => setEventNotification(null), 2500);
  };

  // Advance to next active player
  const advanceTurn = useCallback(
    (currentPlayers: Player[], currentIndex: number) => {
      let nextIndex = (currentIndex + 1) % currentPlayers.length;
      // Skip players who have already won
      let attempts = 0;
      while (currentPlayers[nextIndex].hasWon && attempts < currentPlayers.length) {
        nextIndex = (nextIndex + 1) % currentPlayers.length;
        attempts++;
      }

      setActivePlayerIndex(nextIndex);
      setDiceValue(null);
      setLegalMoves([]);
      setConsecutiveSixes(0);
      setIsRolling(false);
      setIsMoving(false);
      setIsAIThinking(false);

      const nextPlayer = currentPlayers[nextIndex];
      const nextColor = PLAYER_COLORS[nextPlayer.color].name;
      setTurnMessage(`${nextColor}'s Turn — Roll the dice!`);
      soundManager.playTurnChange();

      persistGame(currentPlayers, nextIndex, mode);
    },
    [mode, rules]
  );

  // Perform movement of chosen token
  const handleMoveToken = useCallback(
    (move: MoveOption) => {
      if (!activePlayer || diceValue === null || isMoving) return;

      setIsMoving(true);
      setLegalMoves([]);

      // Play appropriate sound
      if (move.isDeployment) {
        soundManager.playDeploy();
        triggerNotification(`${PLAYER_COLORS[activePlayer.color].name} deployed a token!`, 'deploy');
      } else if (move.willCaptureTokenIds.length > 0) {
        soundManager.playCapture();
        triggerNotification('💥 Token Captured! +1 Bonus Roll!', 'capture');
      } else if (move.landingOnSafeSquare && move.toStatus === 'track') {
        soundManager.playSafeSquare();
        triggerNotification('🛡️ Landed on Safe Zone!', 'safe');
      } else if (move.isFinishing) {
        soundManager.playHomeEnter();
        triggerNotification('🏆 Token reached Home!', 'bonus');
      } else {
        soundManager.playTokenStep();
      }

      const moveDelay = animationSpeed === 'fast' ? 180 : 320;

      window.setTimeout(() => {
        const { updatedPlayers, capturedTokens, reachedHome } = applyMove(
          players,
          move,
          diceValue
        );

        setPlayers(updatedPlayers);
        setIsMoving(false);

        // Log move
        const logMsg = `${activePlayer.name} moved token ${move.tokenIndex + 1} (${diceValue})${
          move.willCaptureTokenIds.length ? ' and captured opponent!' : ''
        }${reachedHome ? ' into HOME!' : ''}`;
        setMoveHistory((prev) => [logMsg, ...prev.slice(0, 19)]);

        // Check Win Condition
        const playerWon = checkWinCondition(
          updatedPlayers.find((p) => p.id === activePlayer.id)!
        );

        if (playerWon) {
          const winnerPlayer = updatedPlayers.find((p) => p.id === activePlayer.id)!;
          setWinner(winnerPlayer);
          setActiveModal('victory');
          setPhase('game_over');
          clearSavedGame();
          return;
        }

        // Check Extra Turns:
        // 1. Rolled a 6
        // 2. Captured opponent (if rule enabled)
        // 3. Reached home (if rule enabled)
        let grantExtraTurn = false;
        if (diceValue === 6 && rules.rollSixExtraTurn) {
          grantExtraTurn = true;
        } else if (capturedTokens.length > 0 && rules.captureExtraTurn) {
          grantExtraTurn = true;
        } else if (reachedHome && rules.homeExtraTurn) {
          grantExtraTurn = true;
        }

        if (grantExtraTurn) {
          setDiceValue(null);
          setTurnMessage(`${activePlayer.name} earns an EXTRA ROLL!`);
          triggerNotification('🎲 Extra Roll Granted!', 'bonus');
          persistGame(updatedPlayers, activePlayerIndex, mode);
        } else {
          advanceTurn(updatedPlayers, activePlayerIndex);
        }
      }, moveDelay);
    },
    [activePlayer, diceValue, isMoving, animationSpeed, players, rules, activePlayerIndex, mode, advanceTurn]
  );

  // Roll the dice
  const handleRollDice = useCallback(() => {
    if (isRolling || isMoving || diceValue !== null || !activePlayer) return;

    soundManager.playDiceRoll();
    setIsRolling(true);

    const rollDuration = animationSpeed === 'fast' ? 250 : 450;

    window.setTimeout(() => {
      // Authoritative random dice roll (1 to 6)
      const rolled = Math.floor(Math.random() * 6) + 1;
      setDiceValue(rolled);
      setIsRolling(false);

      // Check consecutive 6s
      let newConsecutiveSixes = consecutiveSixes;
      if (rolled === 6) {
        newConsecutiveSixes += 1;
        setConsecutiveSixes(newConsecutiveSixes);

        if (newConsecutiveSixes === 3 && rules.threeConsecutiveSixesForfeit) {
          setTurnMessage('⚠️ 3 Consecutive 6s! Turn forfeited!');
          triggerNotification('Turn forfeited (3 consecutive 6s)', 'bonus');
          window.setTimeout(() => {
            advanceTurn(players, activePlayerIndex);
          }, 1400);
          return;
        }
      } else {
        setConsecutiveSixes(0);
      }

      // Calculate legal moves
      const legal = getLegalMoves(activePlayer, rolled, players, rules);
      setLegalMoves(legal);

      if (legal.length === 0) {
        setTurnMessage(`Rolled ${rolled}. No legal moves available!`);
        window.setTimeout(() => {
          advanceTurn(players, activePlayerIndex);
        }, 1300);
      } else if (legal.length === 1 && activePlayer.type === 'computer') {
        // AI with 1 move executes shortly
        setTurnMessage(`Rolled ${rolled}. Moving token...`);
      } else {
        setTurnMessage(`Rolled ${rolled}! Select a token to move.`);
      }
    }, rollDuration);
  }, [
    isRolling,
    isMoving,
    diceValue,
    activePlayer,
    animationSpeed,
    consecutiveSixes,
    rules,
    players,
    activePlayerIndex,
    advanceTurn,
  ]);

  // AI Turn automation loop
  useEffect(() => {
    if (
      phase !== 'waiting_for_roll' ||
      !activePlayer ||
      activePlayer.type !== 'computer' ||
      winner !== null
    ) {
      return;
    }

    if (diceValue === null && !isRolling) {
      // Step 1: AI Rolls the dice after brief natural delay
      setIsAIThinking(true);
      turnTimeoutRef.current = window.setTimeout(() => {
        handleRollDice();
      }, 700);
    } else if (diceValue !== null && !isRolling && !isMoving) {
      // Step 2: AI Evaluates and picks a move
      if (legalMoves.length > 0) {
        setIsAIThinking(true);
        turnTimeoutRef.current = window.setTimeout(() => {
          setIsAIThinking(false);
          const chosenMove = chooseAIMove(
            legalMoves,
            activePlayer,
            players,
            activePlayer.difficulty || 'normal'
          );
          handleMoveToken(chosenMove);
        }, 800);
      }
    }

    return () => {
      if (turnTimeoutRef.current) {
        clearTimeout(turnTimeoutRef.current);
      }
    };
  }, [
    phase,
    activePlayer,
    diceValue,
    isRolling,
    isMoving,
    legalMoves,
    winner,
    handleRollDice,
    handleMoveToken,
    players,
  ]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'waiting_for_roll') return;

      // Space to roll dice
      if (e.code === 'Space' && activePlayer?.type === 'human' && diceValue === null && !isRolling) {
        e.preventDefault();
        handleRollDice();
      }

      // Keys 1..4 to select eligible token
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4'].includes(e.code) && legalMoves.length > 0) {
        const tokenIdx = parseInt(e.code.replace('Digit', '')) - 1;
        const matchingMove = legalMoves.find((m) => m.tokenIndex === tokenIdx);
        if (matchingMove) {
          e.preventDefault();
          handleMoveToken(matchingMove);
        }
      }

      // M to toggle audio
      if (e.key === 'm' || e.key === 'M') {
        const next = !sfxEnabled;
        setSfxEnabled(next);
        soundManager.setSfxEnabled(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, activePlayer, diceValue, isRolling, legalMoves, handleRollDice, handleMoveToken, sfxEnabled]);

  const toggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundManager.setSfxEnabled(next);
    if (next) soundManager.playButtonClick();
  };

  const toggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundManager.setMusicEnabled(next);
  };

  // Render Main Menu
  if (phase === 'menu') {
    return (
      <main className="w-full min-h-screen">
        <MainMenu
          onStartVsComputer={() => setActiveModal('setup')}
          onStartLocalMultiplayer={() => {
            setMode('local');
            setActiveModal('setup');
          }}
          onOpenOnline={() => setActiveModal('online')}
          onOpenRules={() => setActiveModal('rules')}
          onOpenSettings={() => setActiveModal('settings')}
          sfxEnabled={sfxEnabled}
          onToggleSfx={toggleSfx}
          hasSavedGame={hasSavedGame}
          onResumeSavedGame={resumeSavedGame}
        />

        {activeModal === 'setup' && (
          <SetupModal
            initialMode={mode}
            onClose={() => setActiveModal(null)}
            onStartGame={startMatch}
          />
        )}

        {activeModal === 'rules' && (
          <RulesModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === 'settings' && (
          <SettingsModal
            sfxEnabled={sfxEnabled}
            onToggleSfx={toggleSfx}
            musicEnabled={musicEnabled}
            onToggleMusic={toggleMusic}
            animationSpeed={animationSpeed}
            onSetAnimationSpeed={setAnimationSpeed}
            rules={rules}
            onUpdateRules={setRules}
            onClose={() => setActiveModal(null)}
          />
        )}

        {activeModal === 'online' && (
          <OnlineRoomModal
            onClose={() => setActiveModal(null)}
            onStartOnlineMatch={(roomPlayers) => startMatch(roomPlayers, 'online')}
          />
        )}
      </main>
    );
  }

  // Active Game Screen
  return (
    <div className="min-h-screen w-full bg-slate-900 text-slate-100 flex flex-col justify-between p-2 sm:p-4 select-none overflow-x-hidden">
      {/* Top App Header / Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPhase('menu')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black tracking-tight text-amber-300">
              LUDO MASTER
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded capitalize">
              {mode}
            </span>
          </div>
        </div>

        {/* Status notification banner (center) */}
        {eventNotification && (
          <div className="animate-bounce flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-lg bg-amber-400 text-slate-950">
            <Sparkles className="w-3.5 h-3.5" />
            {eventNotification.text}
          </div>
        )}

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleSfx}
            aria-label={sfxEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            {sfxEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('rules')}
            aria-label="How to play"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('settings')}
            aria-label="Settings"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Game Stage Area */}
      <main className="w-full max-w-6xl mx-auto flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 py-2 sm:py-4">
        {/* Left Side: Desktop Player Panels (Red & Blue) */}
        <div className="hidden lg:flex flex-col gap-4 w-60 shrink-0">
          {players.filter((p) => p.color === 'red' || p.color === 'blue').map((p) => (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={activePlayer?.id === p.id}
              isThinking={activePlayer?.id === p.id && isAIThinking}
            />
          ))}

          {/* Game Tips & Instructions Box */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              Quick Controls
            </div>
            <div>• Click dice or press <strong>Space</strong> to roll</div>
            <div>• Click highlighted token to move</div>
            <div>• Rolling a <strong>6</strong> deploys from yard</div>
            <div>• Star cells protect from capture</div>
          </div>
        </div>

        {/* Center: The Board & Floating Active Player Controls */}
        <div className="flex flex-col items-center justify-center w-full max-w-[560px] relative">
          {/* Turn Banner */}
          <div className="w-full mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: activePlayer
                    ? PLAYER_COLORS[activePlayer.color].primary
                    : '#FFFFFF',
                }}
              />
              <span className="font-bold text-slate-100">
                {turnMessage || `${activePlayer?.name}'s Turn`}
              </span>
            </div>
            {activePlayer?.type === 'human' && (
              <span className="text-[10px] text-slate-400">
                Pass & Play
              </span>
            )}
          </div>

          {/* Central 15x15 Ludo Board */}
          <Board
            players={players}
            activePlayer={activePlayer!}
            legalMoves={legalMoves}
            onSelectToken={(token) => {
              const matchingMove = legalMoves.find((m) => m.tokenId === token.id);
              if (matchingMove) {
                handleMoveToken(matchingMove);
              }
            }}
            isMoving={isMoving}
          />

          {/* Dice & Active Player Actions Bar (Bottom of board) */}
          <div className="w-full mt-3 p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-around gap-4 shadow-xl">
            {/* Active Player Summary */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md"
                style={{
                  backgroundColor: activePlayer
                    ? PLAYER_COLORS[activePlayer.color].primary
                    : '#3B82F6',
                }}
              >
                {activePlayer?.name[0] || 'P'}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {activePlayer?.name}
                  {activePlayer?.type === 'computer' && (
                    <span className="text-[9px] bg-slate-700 px-1 rounded text-slate-300">
                      BOT
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {legalMoves.length > 0
                    ? `${legalMoves.length} legal move(s)`
                    : diceValue
                    ? 'No legal moves'
                    : 'Ready to roll'}
                </div>
              </div>
            </div>

            {/* Central Dice */}
            <Dice
              value={diceValue}
              isRolling={isRolling}
              canRoll={
                activePlayer?.type === 'human' &&
                diceValue === null &&
                !isRolling &&
                !isMoving
              }
              activeColor={activePlayer?.color || 'red'}
              onRoll={handleRollDice}
              consecutiveSixes={consecutiveSixes}
              disabledReason={
                activePlayer?.type === 'computer'
                  ? 'Computer is rolling...'
                  : diceValue !== null
                  ? 'Select a token to move'
                  : undefined
              }
            />
          </div>
        </div>

        {/* Right Side: Desktop Player Panels (Green & Yellow) */}
        <div className="hidden lg:flex flex-col gap-4 w-60 shrink-0">
          {players.filter((p) => p.color === 'green' || p.color === 'yellow').map((p) => (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={activePlayer?.id === p.id}
              isThinking={activePlayer?.id === p.id && isAIThinking}
            />
          ))}

          {/* Recent Match Moves Log */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="font-bold text-slate-400 text-[11px] uppercase tracking-wider mb-1.5">
              Match Log
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-300 pr-1">
              {moveHistory.slice(0, 5).map((log, i) => (
                <div key={i} className="truncate border-b border-slate-700/50 pb-0.5">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile View Player Panels (horizontal scroll/grid) */}
        <div className="lg:hidden w-full max-w-[560px] grid grid-cols-2 gap-2 mt-2">
          {players.map((p) => (
            <PlayerPanel
              key={p.id}
              player={p}
              isActive={activePlayer?.id === p.id}
              isThinking={activePlayer?.id === p.id && isAIThinking}
            />
          ))}
        </div>
      </main>

      {/* Footer info */}
      <footer className="w-full max-w-6xl mx-auto pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800">
        <div>Ludo Master • Traditional 52-tile circuit & safe squares</div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Restart current match?')) {
              startMatch(players, mode);
            }
          }}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restart Match
        </button>
      </footer>

      {/* Modals */}
      {activeModal === 'setup' && (
        <SetupModal
          initialMode={mode}
          onClose={() => setActiveModal(null)}
          onStartGame={startMatch}
        />
      )}

      {activeModal === 'rules' && (
        <RulesModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          sfxEnabled={sfxEnabled}
          onToggleSfx={toggleSfx}
          musicEnabled={musicEnabled}
          onToggleMusic={toggleMusic}
          animationSpeed={animationSpeed}
          onSetAnimationSpeed={setAnimationSpeed}
          rules={rules}
          onUpdateRules={setRules}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'online' && (
        <OnlineRoomModal
          onClose={() => setActiveModal(null)}
          onStartOnlineMatch={(roomPlayers) => startMatch(roomPlayers, 'online')}
        />
      )}

      {activeModal === 'victory' && winner && (
        <VictoryModal
          winner={winner}
          players={players}
          onPlayAgain={() => startMatch(players, mode)}
          onReturnToMenu={() => {
            setActiveModal(null);
            setPhase('menu');
          }}
        />
      )}
    </div>
  );
}
