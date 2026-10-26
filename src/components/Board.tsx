import React, { useMemo, useState } from 'react';
import {
  Player,
  PlayerColor,
  Token,
  MoveOption,
} from '../types/game';
import {
  PLAYER_COLORS,
  SAFE_SQUARES,
  TRACK_COORDINATES,
  HOME_COLUMN_COORDINATES,
  HOME_CENTER_COORDINATES,
  YARD_SLOT_COORDINATES,
} from '../game/constants';
import {
  Star,
  Shield,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
} from 'lucide-react';

interface BoardProps {
  players: Player[];
  activePlayer: Player;
  legalMoves: MoveOption[];
  onSelectToken: (token: Token) => void;
  isMoving: boolean;
}

export const Board: React.FC<BoardProps> = ({
  players,
  activePlayer,
  legalMoves,
  onSelectToken,
  isMoving,
}) => {
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);

  // Map each token to its (x, y) grid coordinates
  const tokenCoordinates = useMemo(() => {
    const coordsMap = new Map<string, { x: number; y: number }>();

    players.forEach((player) => {
      player.tokens.forEach((token) => {
        if (token.status === 'yard') {
          const slot = YARD_SLOT_COORDINATES[token.color][token.index];
          coordsMap.set(token.id, { x: slot.x, y: slot.y });
        } else if (token.status === 'track' && token.trackIndex !== null) {
          const trackPos = TRACK_COORDINATES[token.trackIndex];
          coordsMap.set(token.id, { x: trackPos.x, y: trackPos.y });
        } else if (token.status === 'home_column' && token.homeIndex !== null) {
          const colPos = HOME_COLUMN_COORDINATES[token.color][token.homeIndex];
          coordsMap.set(token.id, { x: colPos.x, y: colPos.y });
        } else if (token.status === 'home') {
          const centerPos = HOME_CENTER_COORDINATES[token.color];
          // Symmetrical quadrant offset for finished tokens inside the triangle
          const offsets = [
            { dx: -0.22, dy: -0.22 },
            { dx: 0.22, dy: -0.22 },
            { dx: -0.22, dy: 0.22 },
            { dx: 0.22, dy: 0.22 },
          ];
          const off = offsets[token.index] || { dx: 0, dy: 0 };
          coordsMap.set(token.id, {
            x: centerPos.x + off.dx,
            y: centerPos.y + off.dy,
          });
        }
      });
    });

    return coordsMap;
  }, [players]);

  // Group tokens occupying the same coordinate (except yard/home) to apply visual offsets
  const groupedTokens = useMemo(() => {
    const groups = new Map<string, Token[]>();

    players.forEach((player) => {
      player.tokens.forEach((token) => {
        if (token.status === 'track' || token.status === 'home_column') {
          const key =
            token.status === 'track'
              ? `track-${token.trackIndex}`
              : `home_col-${token.color}-${token.homeIndex}`;

          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key)!.push(token);
        }
      });
    });

    return groups;
  }, [players]);

  // Find legal destination for dragged token highlight
  const legalDestination = useMemo(() => {
    if (!draggedTokenId) return null;
    const move = legalMoves.find((m) => m.tokenId === draggedTokenId);
    if (!move) return null;

    if (move.toStatus === 'track' && move.toTrackIndex !== null) {
      return TRACK_COORDINATES[move.toTrackIndex];
    }
    if (move.toStatus === 'home_column' && move.toHomeIndex !== null) {
      return HOME_COLUMN_COORDINATES[activePlayer.color][move.toHomeIndex];
    }
    if (move.toStatus === 'home') {
      return HOME_CENTER_COORDINATES[activePlayer.color];
    }
    return null;
  }, [draggedTokenId, legalMoves, activePlayer]);

  // Render Yard Quadrant with perfectly centered token pedestals
  const renderYard = (
    color: PlayerColor,
    top: number,
    left: number,
    label: string
  ) => {
    const c = PLAYER_COLORS[color];
    const slots = YARD_SLOT_COORDINATES[color];

    return (
      <div
        className="absolute w-[40%] h-[40%] p-1.5 sm:p-2.5 rounded-2xl shadow-md"
        style={{
          top: `${(top / 15) * 100}%`,
          left: `${(left / 15) * 100}%`,
          backgroundColor: c.primary,
        }}
      >
        <div className="relative w-full h-full bg-white/95 rounded-xl border border-white/80 shadow-inner overflow-hidden">
          {/* Yard Title Tag */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span
              className="text-[10px] sm:text-xs font-black tracking-widest uppercase py-0.5 px-3 rounded-full shadow-xs border border-white"
              style={{ color: c.dark, backgroundColor: c.light }}
            >
              {label}
            </span>
          </div>

          {/* 4 circular token base pads positioned at the exact coordinates */}
          {slots.map((slot, slotIdx) => {
            const padX = ((slot.x + 0.5 - left) / 6) * 100;
            const padY = ((slot.y + 0.5 - top) / 6) * 100;

            return (
              <div
                key={slotIdx}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed flex items-center justify-center transition-all shadow-xs"
                style={{
                  left: `${padX}%`,
                  top: `${padY}%`,
                  width: '24%',
                  height: '24%',
                  borderColor: c.primary,
                  backgroundColor: `${c.light}80`,
                }}
              >
                {/* Center dot pedestal marker */}
                <div
                  className="w-2 h-2 rounded-full opacity-50 shadow-inner"
                  style={{ backgroundColor: c.dark }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Check if a cell coordinate is a safe square
  const getSafeSquareInfo = (row: number, col: number) => {
    const trackIdx = TRACK_COORDINATES.findIndex(
      (c) => c.y === row && c.x === col
    );
    if (trackIdx !== -1 && SAFE_SQUARES.includes(trackIdx)) {
      const isStart = [0, 13, 26, 39].includes(trackIdx);
      return { isSafe: true, isStart, trackIdx };
    }
    return { isSafe: false, isStart: false, trackIdx: -1 };
  };

  return (
    <div className="relative w-full aspect-square max-w-[620px] mx-auto bg-amber-50/70 rounded-2xl shadow-2xl border-4 border-slate-700/80 p-1 sm:p-2 select-none overflow-hidden touch-manipulation">
      {/* 15x15 Grid Container */}
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-white border border-slate-300 shadow-inner">
        {/* Four Yards */}
        {renderYard('red', 0, 0, 'Red')}
        {renderYard('green', 0, 9, 'Green')}
        {renderYard('yellow', 9, 9, 'Yellow')}
        {renderYard('blue', 9, 0, 'Blue')}

        {/* Central Triangle Home Area (Rows 6..8, Cols 6..8) */}
        <div
          className="absolute w-[20%] h-[20%] border border-slate-400/60 overflow-hidden shadow-inner"
          style={{
            top: `${(6 / 15) * 100}%`,
            left: `${(6 / 15) * 100}%`,
          }}
        >
          {/* SVG 4 Triangles */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full filter drop-shadow-sm"
          >
            {/* Top Triangle: Green */}
            <polygon
              points="0,0 100,0 50,50"
              fill={PLAYER_COLORS.green.primary}
            />
            {/* Right Triangle: Yellow */}
            <polygon
              points="100,0 100,100 50,50"
              fill={PLAYER_COLORS.yellow.primary}
            />
            {/* Bottom Triangle: Blue */}
            <polygon
              points="100,100 0,100 50,50"
              fill={PLAYER_COLORS.blue.primary}
            />
            {/* Left Triangle: Red */}
            <polygon
              points="0,100 0,0 50,50"
              fill={PLAYER_COLORS.red.primary}
            />

            {/* Center Trophy / Crown symbol */}
            <circle
              cx="50"
              cy="50"
              r="14"
              fill="#FFFFFF"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <polygon
              points="50,42 54,49 59,44 57,56 43,56 41,44 46,49"
              fill="#F59E0B"
            />
          </svg>
        </div>

        {/* 15x15 Board Cells (Track and Home Columns) */}
        {Array.from({ length: 15 }).map((_, row) =>
          Array.from({ length: 15 }).map((_, col) => {
            // Skip yard quadrants and center triangle
            const inYard =
              (row < 6 && col < 6) ||
              (row < 6 && col > 8) ||
              (row > 8 && col > 8) ||
              (row > 8 && col < 6);
            const inCenter = row >= 6 && row <= 8 && col >= 6 && col <= 8;

            if (inYard || inCenter) return null;

            // Check if cell is in Home Column
            let homeColColor: PlayerColor | null = null;
            if (row === 7 && col >= 1 && col <= 5) homeColColor = 'red';
            if (col === 7 && row >= 1 && row <= 5) homeColColor = 'green';
            if (row === 7 && col >= 9 && col <= 13) homeColColor = 'yellow';
            if (col === 7 && row >= 9 && row <= 13) homeColColor = 'blue';

            // Check if cell is Start Square
            let startColor: PlayerColor | null = null;
            let startArrow: React.ReactNode = null;
            if (row === 6 && col === 1) {
              startColor = 'red';
              startArrow = <ArrowRight className="w-3 h-3 text-white" />;
            }
            if (row === 1 && col === 8) {
              startColor = 'green';
              startArrow = <ArrowDown className="w-3 h-3 text-white" />;
            }
            if (row === 8 && col === 13) {
              startColor = 'yellow';
              startArrow = <ArrowLeft className="w-3 h-3 text-white" />;
            }
            if (row === 13 && col === 6) {
              startColor = 'blue';
              startArrow = <ArrowUp className="w-3 h-3 text-white" />;
            }

            // Safe square info
            const { isSafe, isStart } = getSafeSquareInfo(row, col);

            // Is legal destination for dragged token?
            const isHighlightedDestination =
              legalDestination &&
              legalDestination.y === row &&
              legalDestination.x === col;

            return (
              <div
                key={`${row}-${col}`}
                className={`absolute border border-slate-300 flex items-center justify-center transition-colors ${
                  isHighlightedDestination
                    ? 'ring-4 ring-amber-400 bg-amber-100 z-10 animate-pulse'
                    : ''
                }`}
                style={{
                  top: `${(row / 15) * 100}%`,
                  left: `${(col / 15) * 100}%`,
                  width: `${(1 / 15) * 100}%`,
                  height: `${(1 / 15) * 100}%`,
                  backgroundColor: homeColColor
                    ? PLAYER_COLORS[homeColColor].primary
                    : startColor
                    ? PLAYER_COLORS[startColor].primary
                    : isSafe && !isStart
                    ? '#FEF9C3' // Soft distinctive amber for Star safe zones
                    : '#FFFFFF',
                  borderColor: isSafe && !isStart ? '#FDE047' : '#E2E8F0',
                }}
              >
                {/* Start Arrow & Shield */}
                {startColor && (
                  <div className="flex items-center justify-center text-white drop-shadow-sm">
                    {startArrow}
                  </div>
                )}
                {/* Safe Star */}
                {isSafe && !isStart && (
                  <div className="text-amber-500 drop-shadow-xs">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 stroke-amber-600" />
                  </div>
                )}
                {/* Home Column Dot */}
                {homeColColor && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs" />
                )}
              </div>
            );
          })
        )}

        {/* Tokens Layer */}
        {players.map((player) =>
          player.tokens.map((token) => {
            const coords = tokenCoordinates.get(token.id);
            if (!coords) return null;

            const isCurrentPlayer = player.color === activePlayer.color;
            const legalMove = legalMoves.find((m) => m.tokenId === token.id);
            const isSelectable = !isMoving && isCurrentPlayer && !!legalMove;
            const c = PLAYER_COLORS[token.color];

            // Calculate offset if multiple tokens share the same track/column cell
            let offsetX = 0;
            let offsetY = 0;
            if (token.status === 'track' || token.status === 'home_column') {
              const groupKey =
                token.status === 'track'
                  ? `track-${token.trackIndex}`
                  : `home_col-${token.color}-${token.homeIndex}`;
              const group = groupedTokens.get(groupKey) || [];
              if (group.length > 1) {
                const idxInGroup = group.findIndex((t) => t.id === token.id);
                const spreadOffsets = [
                  { dx: -0.18, dy: -0.18 },
                  { dx: 0.18, dy: -0.18 },
                  { dx: -0.18, dy: 0.18 },
                  { dx: 0.18, dy: 0.18 },
                ];
                const off = spreadOffsets[idxInGroup % 4];
                offsetX = off.dx;
                offsetY = off.dy;
              }
            }

            const cellPercentX = ((coords.x + offsetX + 0.5) / 15) * 100;
            const cellPercentY = ((coords.y + offsetY + 0.5) / 15) * 100;

            return (
              <div
                key={token.id}
                role="button"
                tabIndex={isSelectable ? 0 : -1}
                aria-label={`${c.name} token ${token.index + 1} at ${token.status}${
                  isSelectable ? ' - Click to move' : ''
                }`}
                onClick={() => {
                  if (isSelectable) {
                    onSelectToken(token);
                  }
                }}
                onKeyDown={(e) => {
                  if (isSelectable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelectToken(token);
                  }
                }}
                onPointerDown={() => {
                  if (isSelectable) {
                    setDraggedTokenId(token.id);
                  }
                }}
                onPointerUp={() => {
                  if (draggedTokenId === token.id) {
                    setDraggedTokenId(null);
                    onSelectToken(token);
                  }
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-transform duration-200 z-20 ${
                  isSelectable
                    ? 'cursor-pointer hover:scale-115 active:scale-95 z-30'
                    : 'cursor-default'
                }`}
                style={{
                  left: `${cellPercentX}%`,
                  top: `${cellPercentY}%`,
                  width: '5.4%',
                  height: '5.4%',
                  minWidth: '22px',
                  minHeight: '22px',
                }}
              >
                {/* Glowing pulsating ring when selectable */}
                {isSelectable && (
                  <span
                    className="absolute -inset-1.5 rounded-full animate-ping opacity-75 pointer-events-none"
                    style={{ backgroundColor: c.primary }}
                  />
                )}

                {/* 3D Glossy Token Body */}
                <div
                  className="relative w-full h-full rounded-full border-2 shadow-md flex items-center justify-center transition-transform"
                  style={{
                    backgroundColor: c.primary,
                    borderColor: '#FFFFFF',
                    boxShadow: isSelectable
                      ? `0 0 14px 4px ${c.ring}, 0 4px 8px rgba(0,0,0,0.3)`
                      : '0 2px 4px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {/* Subtle inner highlight */}
                  <div className="absolute top-0.5 left-0.5 right-0.5 h-1/2 bg-gradient-to-b from-white/70 to-transparent rounded-t-full pointer-events-none" />

                  {/* Inner ring & dot */}
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-inner border border-white/60"
                    style={{ backgroundColor: c.light }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
