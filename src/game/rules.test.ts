import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialTokens,
  calculateMoveForToken,
  getLegalMoves,
  applyMove,
  checkWinCondition,
  chooseAIMove,
  isSafeSquare,
} from './rules';
import { DEFAULT_RULES, START_TRACK_INDEX, SAFE_SQUARES } from './constants';
import { Player } from '../types/game';

function mockPlayers(): Player[] {
  return [
    {
      id: 'p-red',
      name: 'Player 1',
      color: 'red',
      type: 'human',
      tokens: createInitialTokens('red'),
      hasWon: false,
    },
    {
      id: 'p-green',
      name: 'Player 2',
      color: 'green',
      type: 'computer',
      tokens: createInitialTokens('green'),
      hasWon: false,
    },
  ];
}

test('initial tokens are in yard', () => {
  const tokens = createInitialTokens('red');
  assert.equal(tokens.length, 4);
  assert.equal(tokens[0].status, 'yard');
  assert.equal(tokens[0].trackIndex, null);
  assert.equal(tokens[0].stepsTraveled, 0);
});

test('rolling 1-5 cannot deploy from yard', () => {
  const players = mockPlayers();
  const token = players[0].tokens[0];

  for (let dice = 1; dice <= 5; dice++) {
    const move = calculateMoveForToken(token, dice, players, DEFAULT_RULES);
    assert.equal(move, null, `Should not be able to deploy with dice ${dice}`);
  }
});

test('rolling 6 deploys from yard to start square', () => {
  const players = mockPlayers();
  const token = players[0].tokens[0];
  const move = calculateMoveForToken(token, 6, players, DEFAULT_RULES);

  assert.notEqual(move, null);
  assert.equal(move?.isDeployment, true);
  assert.equal(move?.toTrackIndex, START_TRACK_INDEX['red']);
  assert.equal(move?.toStatus, 'track');
});

test('safe squares list contains 8 standard squares', () => {
  assert.equal(SAFE_SQUARES.length, 8);
  assert.equal(isSafeSquare(0), true);
  assert.equal(isSafeSquare(8), true);
  assert.equal(isSafeSquare(13), true);
  assert.equal(isSafeSquare(21), true);
  assert.equal(isSafeSquare(26), true);
  assert.equal(isSafeSquare(34), true);
  assert.equal(isSafeSquare(39), true);
  assert.equal(isSafeSquare(47), true);
  assert.equal(isSafeSquare(1), false);
  assert.equal(isSafeSquare(5), false);
});

test('track movement advances correct steps', () => {
  const players = mockPlayers();
  // Deploy red token 0
  players[0].tokens[0] = {
    ...players[0].tokens[0],
    status: 'track',
    trackIndex: 0,
    stepsTraveled: 0,
  };

  const move = calculateMoveForToken(
    players[0].tokens[0],
    4,
    players,
    DEFAULT_RULES
  );
  assert.notEqual(move, null);
  assert.equal(move?.toTrackIndex, 4);
  assert.equal(move?.toStatus, 'track');

  const { updatedPlayers } = applyMove(players, move!, 4);
  assert.equal(updatedPlayers[0].tokens[0].trackIndex, 4);
  assert.equal(updatedPlayers[0].tokens[0].stepsTraveled, 4);
});

test('capturing opponent on vulnerable square sends them to yard', () => {
  const players = mockPlayers();
  // Red token at track 2
  players[0].tokens[0] = {
    ...players[0].tokens[0],
    status: 'track',
    trackIndex: 2,
    stepsTraveled: 2,
  };
  // Green token at track 5 (not safe)
  players[1].tokens[0] = {
    ...players[1].tokens[0],
    status: 'track',
    trackIndex: 5,
    stepsTraveled: 10,
  };

  // Red rolls 3: 2 + 3 = 5
  const move = calculateMoveForToken(
    players[0].tokens[0],
    3,
    players,
    DEFAULT_RULES
  );
  assert.notEqual(move, null);
  assert.equal(move?.willCaptureTokenIds.length, 1);
  assert.equal(move?.willCaptureTokenIds[0], players[1].tokens[0].id);

  const { updatedPlayers, capturedTokens } = applyMove(players, move!, 3);
  assert.equal(capturedTokens.length, 1);
  assert.equal(updatedPlayers[1].tokens[0].status, 'yard');
  assert.equal(updatedPlayers[1].tokens[0].trackIndex, null);
  assert.equal(updatedPlayers[1].tokens[0].stepsTraveled, 0);
  assert.equal(updatedPlayers[0].tokens[0].trackIndex, 5);
});

test('opponent on safe square cannot be captured', () => {
  const players = mockPlayers();
  // Red token at track 4
  players[0].tokens[0] = {
    ...players[0].tokens[0],
    status: 'track',
    trackIndex: 4,
    stepsTraveled: 4,
  };
  // Green token at track 8 (Star safe square)
  players[1].tokens[0] = {
    ...players[1].tokens[0],
    status: 'track',
    trackIndex: 8,
    stepsTraveled: 20,
  };

  // Red rolls 4: lands on safe square 8
  const move = calculateMoveForToken(
    players[0].tokens[0],
    4,
    players,
    DEFAULT_RULES
  );
  assert.notEqual(move, null);
  assert.equal(move?.willCaptureTokenIds.length, 0);
  assert.equal(move?.landingOnSafeSquare, true);

  const { updatedPlayers, capturedTokens } = applyMove(players, move!, 4);
  assert.equal(capturedTokens.length, 0);
  assert.equal(updatedPlayers[1].tokens[0].status, 'track');
});

test('entering home column and exact roll finishing', () => {
  const players = mockPlayers();
  // Token on track near home entry (step 49)
  players[0].tokens[0] = {
    ...players[0].tokens[0],
    status: 'track',
    trackIndex: 49,
    stepsTraveled: 49,
  };

  // Rolls 3: total 52 steps -> home column index 1 (52 - 51 = 1)
  const moveIntoHomeCol = calculateMoveForToken(
    players[0].tokens[0],
    3,
    players,
    DEFAULT_RULES
  );
  assert.notEqual(moveIntoHomeCol, null);
  assert.equal(moveIntoHomeCol?.toStatus, 'home_column');
  assert.equal(moveIntoHomeCol?.toHomeIndex, 1);
  assert.equal(moveIntoHomeCol?.isHomeEntry, true);

  // Apply move into home column
  const { updatedPlayers } = applyMove(players, moveIntoHomeCol!, 3);
  assert.equal(updatedPlayers[0].tokens[0].status, 'home_column');
  assert.equal(updatedPlayers[0].tokens[0].homeIndex, 1);

  // Now token at homeIndex 1. Needs 4 (1 + 4 = 5) to finish!
  const finishMove = calculateMoveForToken(
    updatedPlayers[0].tokens[0],
    4,
    updatedPlayers,
    DEFAULT_RULES
  );
  assert.notEqual(finishMove, null);
  assert.equal(finishMove?.toStatus, 'home');
  assert.equal(finishMove?.isFinishing, true);

  // Over-roll with 5 when needing 4 should be null
  const overRollMove = calculateMoveForToken(
    updatedPlayers[0].tokens[0],
    5,
    updatedPlayers,
    DEFAULT_RULES
  );
  assert.equal(overRollMove, null);
});

test('win condition triggers when all 4 tokens reach home', () => {
  const players = mockPlayers();
  assert.equal(checkWinCondition(players[0]), false);

  players[0].tokens.forEach((t) => {
    t.status = 'home';
  });
  assert.equal(checkWinCondition(players[0]), true);
});

test('AI chooses capture move over plain advancement', () => {
  const players = mockPlayers();
  // Token 0 at track 2
  players[1].tokens[0] = {
    ...players[1].tokens[0],
    status: 'track',
    trackIndex: 2,
    stepsTraveled: 2,
  };
  // Token 1 at track 10
  players[1].tokens[1] = {
    ...players[1].tokens[1],
    status: 'track',
    trackIndex: 10,
    stepsTraveled: 10,
  };
  // Red opponent at track 6
  players[0].tokens[0] = {
    ...players[0].tokens[0],
    status: 'track',
    trackIndex: 6,
    stepsTraveled: 6,
  };

  // Green rolls 4:
  // Token 0 can move 2 -> 6 (CAPTURES Red!)
  // Token 1 can move 10 -> 14 (No capture)
  const legalMoves = getLegalMoves(players[1], 4, players, DEFAULT_RULES);
  assert.equal(legalMoves.length, 2);

  const chosen = chooseAIMove(legalMoves, players[1], players, 'hard');
  assert.equal(chosen.tokenId, players[1].tokens[0].id);
  assert.equal(chosen.willCaptureTokenIds.length, 1);
});
