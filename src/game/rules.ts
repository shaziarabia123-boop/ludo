import {
  Player,
  PlayerColor,
  Token,
  MoveOption,
  RulesConfig,
  AIDifficulty,
} from '../types/game';
import {
  START_TRACK_INDEX,
  SAFE_SQUARES,
  TOTAL_STEPS_TO_HOME,
} from './constants';

export function createInitialTokens(color: PlayerColor): Token[] {
  return [0, 1, 2, 3].map((index) => ({
    id: `${color}-${index}`,
    color,
    index,
    status: 'yard',
    trackIndex: null,
    homeIndex: null,
    stepsTraveled: 0,
  }));
}

export function isSafeSquare(trackIndex: number | null): boolean {
  if (trackIndex === null) return false;
  return SAFE_SQUARES.includes(trackIndex);
}

export function calculateMoveForToken(
  token: Token,
  diceValue: number,
  allPlayers: Player[],
  rules: RulesConfig
): MoveOption | null {
  // Case 1: In Yard
  if (token.status === 'yard') {
    if (diceValue === 6 && rules.sixAllowsDeployment) {
      const startIndex = START_TRACK_INDEX[token.color];
      // Check if start square has opponents that could be captured (if start isn't safe, but start is safe by default)
      const opponentsOnSquare = isSafeSquare(startIndex)
        ? []
        : findOpponentsOnTrack(startIndex, token.color, allPlayers);

      return {
        tokenId: token.id,
        tokenIndex: token.index,
        fromStatus: 'yard',
        toStatus: 'track',
        fromTrackIndex: null,
        toTrackIndex: startIndex,
        fromHomeIndex: null,
        toHomeIndex: null,
        willCaptureTokenIds: opponentsOnSquare.map((t) => t.id),
        isDeployment: true,
        isHomeEntry: false,
        isFinishing: false,
        landingOnSafeSquare: isSafeSquare(startIndex),
      };
    }
    return null;
  }

  // Case 2: On Track
  if (token.status === 'track' && token.trackIndex !== null) {
    const currentSteps = token.stepsTraveled;
    const targetSteps = currentSteps + diceValue;

    if (targetSteps <= 50) {
      // Still on track
      const toTrackIndex = (token.trackIndex + diceValue) % 52;
      const landingSafe = isSafeSquare(toTrackIndex);
      const willCapture = landingSafe
        ? []
        : findOpponentsOnTrack(toTrackIndex, token.color, allPlayers);

      return {
        tokenId: token.id,
        tokenIndex: token.index,
        fromStatus: 'track',
        toStatus: 'track',
        fromTrackIndex: token.trackIndex,
        toTrackIndex,
        fromHomeIndex: null,
        toHomeIndex: null,
        willCaptureTokenIds: willCapture.map((t) => t.id),
        isDeployment: false,
        isHomeEntry: false,
        isFinishing: false,
        landingOnSafeSquare: landingSafe,
      };
    } else {
      // Entering home stretch (steps 51..55 in column, 56 is finish)
      const targetHomeStep = targetSteps - 51; // 0, 1, 2, 3, 4 for column, 5 for finish

      if (targetHomeStep < 5) {
        return {
          tokenId: token.id,
          tokenIndex: token.index,
          fromStatus: 'track',
          toStatus: 'home_column',
          fromTrackIndex: token.trackIndex,
          toTrackIndex: null,
          fromHomeIndex: null,
          toHomeIndex: targetHomeStep,
          willCaptureTokenIds: [],
          isDeployment: false,
          isHomeEntry: true,
          isFinishing: false,
          landingOnSafeSquare: true, // Home column is protected
        };
      } else if (targetHomeStep === 5) {
        return {
          tokenId: token.id,
          tokenIndex: token.index,
          fromStatus: 'track',
          toStatus: 'home',
          fromTrackIndex: token.trackIndex,
          toTrackIndex: null,
          fromHomeIndex: null,
          toHomeIndex: 5,
          willCaptureTokenIds: [],
          isDeployment: false,
          isHomeEntry: true,
          isFinishing: true,
          landingOnSafeSquare: true,
        };
      } else {
        // Exceeds home target
        if (rules.exactRollForHome) {
          return null;
        }
        return null;
      }
    }
  }

  // Case 3: In Home Column
  if (token.status === 'home_column' && token.homeIndex !== null) {
    const targetHomeIndex = token.homeIndex + diceValue;

    if (targetHomeIndex < 5) {
      return {
        tokenId: token.id,
        tokenIndex: token.index,
        fromStatus: 'home_column',
        toStatus: 'home_column',
        fromTrackIndex: null,
        toTrackIndex: null,
        fromHomeIndex: token.homeIndex,
        toHomeIndex: targetHomeIndex,
        willCaptureTokenIds: [],
        isDeployment: false,
        isHomeEntry: false,
        isFinishing: false,
        landingOnSafeSquare: true,
      };
    } else if (targetHomeIndex === 5) {
      return {
        tokenId: token.id,
        tokenIndex: token.index,
        fromStatus: 'home_column',
        toStatus: 'home',
        fromTrackIndex: null,
        toTrackIndex: null,
        fromHomeIndex: token.homeIndex,
        toHomeIndex: 5,
        willCaptureTokenIds: [],
        isDeployment: false,
        isHomeEntry: false,
        isFinishing: true,
        landingOnSafeSquare: true,
      };
    } else {
      // Exceeds home
      if (rules.exactRollForHome) {
        return null;
      }
      return null;
    }
  }

  // Case 4: Already Finished in Home
  return null;
}

export function findOpponentsOnTrack(
  trackIndex: number,
  playerColor: PlayerColor,
  players: Player[]
): Token[] {
  const opponents: Token[] = [];
  for (const player of players) {
    if (player.color === playerColor) continue;
    for (const token of player.tokens) {
      if (token.status === 'track' && token.trackIndex === trackIndex) {
        opponents.push(token);
      }
    }
  }
  return opponents;
}

export function getLegalMoves(
  player: Player,
  diceValue: number,
  allPlayers: Player[],
  rules: RulesConfig
): MoveOption[] {
  const legalMoves: MoveOption[] = [];
  for (const token of player.tokens) {
    const move = calculateMoveForToken(token, diceValue, allPlayers, rules);
    if (move) {
      legalMoves.push(move);
    }
  }
  return legalMoves;
}

export function applyMove(
  players: Player[],
  move: MoveOption,
  diceValue: number
): {
  updatedPlayers: Player[];
  capturedTokens: Token[];
  reachedHome: boolean;
} {
  const capturedTokens: Token[] = [];
  let reachedHome = false;

  const updatedPlayers = players.map((player) => {
    const updatedTokens = player.tokens.map((token) => {
      // Is this the moving token?
      if (token.id === move.tokenId) {
        let newStepsTraveled = token.stepsTraveled;
        if (move.isDeployment) {
          newStepsTraveled = 0;
        } else {
          newStepsTraveled += diceValue;
        }

        if (move.isFinishing) {
          reachedHome = true;
        }

        return {
          ...token,
          status: move.toStatus,
          trackIndex: move.toTrackIndex,
          homeIndex: move.toHomeIndex,
          stepsTraveled: newStepsTraveled,
        };
      }

      // Is this a captured opponent token?
      if (move.willCaptureTokenIds.includes(token.id)) {
        capturedTokens.push(token);
        return {
          ...token,
          status: 'yard' as const,
          trackIndex: null,
          homeIndex: null,
          stepsTraveled: 0,
        };
      }

      return token;
    });

    const hasWon = updatedTokens.every((t) => t.status === 'home');

    return {
      ...player,
      tokens: updatedTokens,
      hasWon,
    };
  });

  return { updatedPlayers, capturedTokens, reachedHome };
}

export function checkWinCondition(player: Player): boolean {
  return player.tokens.every((t) => t.status === 'home');
}

/**
 * Intelligent AI Decision Maker
 * Evaluates legal moves based on difficulty setting:
 * - Easy: random with slight bias toward deployment
 * - Normal: sensible deployment, capture, and home-reach decisions
 * - Hard: weighted evaluation scoring captures, safety, finish, risk of being captured, and distance to home
 */
export function chooseAIMove(
  legalMoves: MoveOption[],
  player: Player,
  allPlayers: Player[],
  difficulty: AIDifficulty = 'normal'
): MoveOption {
  if (legalMoves.length === 1) {
    return legalMoves[0];
  }

  if (difficulty === 'easy') {
    // Prefer deployment or random
    const deployMove = legalMoves.find((m) => m.isDeployment);
    if (deployMove && Math.random() < 0.6) return deployMove;
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Score each move option
  const scoredMoves = legalMoves.map((move) => {
    let score = 0;
    const token = player.tokens.find((t) => t.id === move.tokenId)!;

    // 1. Finishing a token into Home is highest priority
    if (move.isFinishing) {
      score += 1000;
    }

    // 2. Capturing an opponent token
    if (move.willCaptureTokenIds.length > 0) {
      score += 500 * move.willCaptureTokenIds.length;
    }

    // 3. Entering home stretch (safe from track capture)
    if (move.isHomeEntry) {
      score += 250;
    }

    // 4. Landing on a safe square
    if (move.landingOnSafeSquare && move.toStatus === 'track') {
      score += 120;
    }

    // 5. Deploying a new token from yard
    if (move.isDeployment) {
      const tokensOnTrackOrHome = player.tokens.filter(
        (t) => t.status !== 'yard' && t.status !== 'home'
      ).length;
      if (tokensOnTrackOrHome === 0) {
        score += 350; // High need to get on board
      } else {
        score += 180;
      }
    }

    // 6. Progress bonus: Moving tokens closer to home
    score += (token.stepsTraveled || 0) * 2;

    if (difficulty === 'hard') {
      // Risk analysis: Is the token vulnerable at its current position?
      const isCurrentlyVulnerable =
        token.status === 'track' &&
        token.trackIndex !== null &&
        !isSafeSquare(token.trackIndex) &&
        isSquareThreatened(token.trackIndex, player.color, allPlayers);

      if (isCurrentlyVulnerable) {
        score += 150; // Incentive to run away
      }

      // Will landing spot be threatened?
      if (
        move.toStatus === 'track' &&
        move.toTrackIndex !== null &&
        !move.landingOnSafeSquare
      ) {
        const landingThreatened = isSquareThreatened(
          move.toTrackIndex,
          player.color,
          allPlayers
        );
        if (landingThreatened) {
          score -= 100; // Penalty for landing in danger
        }
      }
    }

    return { move, score };
  });

  scoredMoves.sort((a, b) => b.score - a.score);
  return scoredMoves[0].move;
}

export function isSquareThreatened(
  targetTrackIndex: number,
  playerColor: PlayerColor,
  players: Player[]
): boolean {
  for (const player of players) {
    if (player.color === playerColor) continue;
    for (const token of player.tokens) {
      if (token.status === 'track' && token.trackIndex !== null) {
        // Distance behind targetTrackIndex
        const dist = (targetTrackIndex - token.trackIndex + 52) % 52;
        if (dist >= 1 && dist <= 6) {
          return true; // An opponent token can potentially hit this square with 1-6
        }
      }
    }
  }
  return false;
}
