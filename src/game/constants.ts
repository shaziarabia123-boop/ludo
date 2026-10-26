import { PlayerColor, Coordinates, RulesConfig } from '../types/game';

export const PLAYER_COLORS: Record<
  PlayerColor,
  {
    name: string;
    primary: string;
    light: string;
    dark: string;
    ring: string;
    border: string;
  }
> = {
  red: {
    name: 'Red',
    primary: '#F04444',
    light: '#FEE2E2',
    dark: '#B91C1C',
    ring: 'rgba(240, 68, 68, 0.4)',
    border: '#DC2626',
  },
  green: {
    name: 'Green',
    primary: '#24B96B',
    light: '#DCFCE7',
    dark: '#15803D',
    ring: 'rgba(36, 185, 107, 0.4)',
    border: '#16A34A',
  },
  yellow: {
    name: 'Yellow',
    primary: '#F5C542',
    light: '#FEF3C7',
    dark: '#B45309',
    ring: 'rgba(245, 197, 66, 0.4)',
    border: '#D97706',
  },
  blue: {
    name: 'Blue',
    primary: '#3984F5',
    light: '#DBEAFE',
    dark: '#1D4ED8',
    ring: 'rgba(57, 132, 245, 0.4)',
    border: '#2563EB',
  },
};

export const COLOR_ORDER: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

// Start square index on the 52-tile track for each color
export const START_TRACK_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Index on track after which the token enters the home stretch (turns into home column)
export const HOME_ENTRY_TRACK_INDEX: Record<PlayerColor, number> = {
  red: 50,
  green: 11,
  yellow: 24,
  blue: 37,
};

// Safe squares on the 52-tile circuit (4 starting squares + 4 star squares)
export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];

// The 52 track cell positions on the 15x15 board grid (row, col from 0 to 14)
export const TRACK_COORDINATES: Coordinates[] = [
  // 0..4 (Red starting arm going right)
  { y: 6, x: 1 }, // 0: Red Start
  { y: 6, x: 2 }, // 1
  { y: 6, x: 3 }, // 2
  { y: 6, x: 4 }, // 3
  { y: 6, x: 5 }, // 4
  // 5..10 (Turn up into top arm)
  { y: 5, x: 6 }, // 5
  { y: 4, x: 6 }, // 6
  { y: 3, x: 6 }, // 7
  { y: 2, x: 6 }, // 8: Safe Star 1
  { y: 1, x: 6 }, // 9
  { y: 0, x: 6 }, // 10
  // 11..12 (Top turn)
  { y: 0, x: 7 }, // 11: Green turns into home column from here
  { y: 0, x: 8 }, // 12
  // 13..17 (Top arm going down)
  { y: 1, x: 8 }, // 13: Green Start
  { y: 2, x: 8 }, // 14
  { y: 3, x: 8 }, // 15
  { y: 4, x: 8 }, // 16
  { y: 5, x: 8 }, // 17
  // 18..23 (Turn right into right arm)
  { y: 6, x: 9 }, // 18
  { y: 6, x: 10 }, // 19
  { y: 6, x: 11 }, // 20
  { y: 6, x: 12 }, // 21: Safe Star 2
  { y: 6, x: 13 }, // 22
  { y: 6, x: 14 }, // 23
  // 24..25 (Right turn)
  { y: 7, x: 14 }, // 24: Yellow turns into home column from here
  { y: 8, x: 14 }, // 25
  // 26..30 (Right arm going left)
  { y: 8, x: 13 }, // 26: Yellow Start
  { y: 8, x: 12 }, // 27
  { y: 8, x: 11 }, // 28
  { y: 8, x: 10 }, // 29
  { y: 8, x: 9 }, // 30
  // 31..36 (Turn down into bottom arm)
  { y: 9, x: 8 }, // 31
  { y: 10, x: 8 }, // 32
  { y: 11, x: 8 }, // 33
  { y: 12, x: 8 }, // 34: Safe Star 3
  { y: 13, x: 8 }, // 35
  { y: 14, x: 8 }, // 36
  // 37..38 (Bottom turn)
  { y: 14, x: 7 }, // 37: Blue turns into home column from here
  { y: 14, x: 6 }, // 38
  // 39..43 (Bottom arm going up)
  { y: 13, x: 6 }, // 39: Blue Start
  { y: 12, x: 6 }, // 40
  { y: 11, x: 6 }, // 41
  { y: 10, x: 6 }, // 42
  { y: 9, x: 6 }, // 43
  // 44..49 (Turn left into left arm)
  { y: 8, x: 5 }, // 44
  { y: 8, x: 4 }, // 45
  { y: 8, x: 3 }, // 46
  { y: 8, x: 2 }, // 47: Safe Star 4
  { y: 8, x: 1 }, // 48
  { y: 8, x: 0 }, // 49
  // 50..51 (Left turn back to red arm)
  { y: 7, x: 0 }, // 50: Red turns into home column from here
  { y: 6, x: 0 }, // 51
];

// Home column coordinates (5 squares leading into the center)
export const HOME_COLUMN_COORDINATES: Record<PlayerColor, Coordinates[]> = {
  red: [
    { y: 7, x: 1 },
    { y: 7, x: 2 },
    { y: 7, x: 3 },
    { y: 7, x: 4 },
    { y: 7, x: 5 },
  ],
  green: [
    { y: 1, x: 7 },
    { y: 2, x: 7 },
    { y: 3, x: 7 },
    { y: 4, x: 7 },
    { y: 5, x: 7 },
  ],
  yellow: [
    { y: 7, x: 13 },
    { y: 7, x: 12 },
    { y: 7, x: 11 },
    { y: 7, x: 10 },
    { y: 7, x: 9 },
  ],
  blue: [
    { y: 13, x: 7 },
    { y: 12, x: 7 },
    { y: 11, x: 7 },
    { y: 10, x: 7 },
    { y: 9, x: 7 },
  ],
};

// Home center finish coordinates (inside central triangle)
export const HOME_CENTER_COORDINATES: Record<PlayerColor, Coordinates> = {
  red: { y: 7, x: 6.2 },
  green: { y: 6.2, x: 7 },
  yellow: { y: 7, x: 7.8 },
  blue: { y: 7.8, x: 7 },
};

// Starting yard 4 token slot positions on 15x15 grid
export const YARD_SLOT_COORDINATES: Record<PlayerColor, Coordinates[]> = {
  red: [
    { y: 1.5, x: 1.5 },
    { y: 1.5, x: 3.5 },
    { y: 3.5, x: 1.5 },
    { y: 3.5, x: 3.5 },
  ],
  green: [
    { y: 1.5, x: 10.5 },
    { y: 1.5, x: 12.5 },
    { y: 3.5, x: 10.5 },
    { y: 3.5, x: 12.5 },
  ],
  yellow: [
    { y: 10.5, x: 10.5 },
    { y: 10.5, x: 12.5 },
    { y: 12.5, x: 10.5 },
    { y: 12.5, x: 12.5 },
  ],
  blue: [
    { y: 10.5, x: 1.5 },
    { y: 10.5, x: 3.5 },
    { y: 12.5, x: 1.5 },
    { y: 12.5, x: 3.5 },
  ],
};

export const DEFAULT_RULES: RulesConfig = {
  sixAllowsDeployment: true,
  rollSixExtraTurn: true,
  captureExtraTurn: true,
  homeExtraTurn: true,
  threeConsecutiveSixesForfeit: true,
  exactRollForHome: true,
};

export const TOTAL_STEPS_TO_HOME = 56; // 0 is start track square, 50 is before home column, 51-55 in home column, 56 is finished
