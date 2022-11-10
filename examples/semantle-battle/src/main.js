import { wordToVecRaw, wordToNearestRaw } from './words';
import {
  getSimilarityScore, getNearestIndex, getNthNearest, MAX_SIMILARITY,
} from './utils';

function hashWord(secret) {
  return Buffer.from(secret).toString('base64');
}

const hashToNearest = new Map();
wordToNearestRaw.trim().split(/\r?\n/).forEach((line) => {
  const similarWords = line.split(' ');
  hashToNearest.set(hashWord(similarWords.at(-1)), similarWords);
});

const hashToVec = new Map();
wordToVecRaw.trim().split(/\r?\n/).forEach((line) => {
  const [word, ...vec] = line.split(' ');
  hashToVec.set(hashWord(word), vec);
});

// TODO: setup unit tests for the exported functions
// TODO: cleanup jupyter notebook to output proper text files
const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});
const MAX_WORD_LENGTH = 6;
const MAX_HINT_INDEX = 70;
const CHOOSE_SECRET_TIMEOUT_MS = 30000; // 30 seconds
const IN_GAME_TIMEOUT_MS = 300000; // 5 minutes

function isValidWord(word) {
  return typeof word === 'string' && word.length <= MAX_WORD_LENGTH && hashToVec.has(hashWord(word));
}

function onRoomStart() {
  return {
    // Initialize the general shape of our custom room state that we need to self manage
    // UrTurn will not touch anything under 'state' field, and expects it to be a JSON
    // serializable object.
    state: {
      plrToSecretHash: {},
      plrToGuessToInfo: {},
      // plrToHintRequest: {[plr.id]: boolean}
      plrToHintRequest: {},
      // plrToRejectHintResponse: {[plr.id]: ISO timestamp string}
      plrToRejectHintResponse: {},
      hintIndex: -1,
      status: Status.PreGame,
      winner: null,
      // time set when second player joins and players begin choosing secrets
      chooseSecretStartTime: null,
      // time set when the actual in-game begins when both players provided valid secrets
      guessStartTime: null,
    },
  };
}

function onPlayerJoin(plr, boardGame) {
  // UrTurn provides the boardGame object which let's us know who is in the room
  const { players, state } = boardGame;

  // set guess to an empty object
  state.plrToGuessToInfo[plr.id] = {};

  // when the number of players is equal to 2, then we can start the game
  if (players.length === 2) {
    state.chooseSecretStartTime = new Date().toISOString();
    // other players will be unable to join this room (UrTurn will handle this for us)
    return { state, joinable: false };
  }
  return { state };
}

function onPlayerMovePreGame(plr, move, boardGame) {
  const { secret, forceEndGame } = move;
  const { state, players } = boardGame;
  if (forceEndGame) {
    const timeoutMs = new Date(state.chooseSecretStartTime).getTime() + CHOOSE_SECRET_TIMEOUT_MS;
    const nowMs = Date.now();
    if (nowMs < timeoutMs) {
      throw new Error('Player still has time left!');
    }

    const [winnerID] = Object.keys(state.plrToSecretHash);
    state.winner = players.find((p) => p.id === winnerID);
    state.status = Status.EndGame;
    return { state, joinable: false, finished: true };
  }

  // validate that the player has not already chosen a secret
  if (plr.id in state.plrToSecretHash) {
    // not letting player re-pick their secret will help simplify the logic and number of
    // state changes
    throw new Error('You already chose a secret. You cannot re-pick');
  }

  // validate the secret
  const valid = isValidWord(secret);
  if (!valid) {
    throw new Error('The secret word chosen is not known.');
  }

  // modify the state accordingly so we know what each plr secret word is
  state.plrToSecretHash[plr.id] = hashWord(secret);

  // if both players have chosen secrets then the in game guessing phase should start
  if (players.every(({ id }) => id in state.plrToSecretHash) && players.length === 2) {
    state.guessStartTime = new Date().toISOString();
    state.status = Status.InGame;
    return { state };
  }
  return { state };
}

function grantHint(state, players) {
  /* eslint-disable no-param-reassign */
  state.hintIndex += 1;
  state.plrToHintRequest = {};
  state.plrToRejectHintResponse = {};

  const p1Id = players[0].id;
  const p1SecretHash = state.plrToSecretHash[p1Id];
  const p2Id = players[1].id;
  const p2SecretHash = state.plrToSecretHash[p2Id];
  const p1HintWord = getNthNearest(hashToNearest, p2SecretHash, state.hintIndex);
  const p2HintWord = getNthNearest(hashToNearest, p1SecretHash, state.hintIndex);

  const lastUpdateTime = new Date().toISOString();
  state.plrToGuessToInfo[p1Id][p1HintWord] = {
    lastUpdateTime,
    count: 1,
    hint: true,
    similarity: getSimilarityScore(hashToVec, hashWord(p1HintWord), p2SecretHash),
    index: state.hintIndex,
  };
  state.plrToGuessToInfo[p2Id][p2HintWord] = {
    lastUpdateTime,
    count: 1,
    hint: true,
    similarity: getSimilarityScore(hashToVec, hashWord(p2HintWord), p1SecretHash),
    index: state.hintIndex,
  };
  /* eslint-enable no-param-reassign */
}

function getScoreCard(guessToInfo) {
  const initialScoreCard = [-1, -MAX_SIMILARITY - 1];
  return Object.entries(guessToInfo)
    .reduce(([curMaxIndex, curMaxSimilarity], [, { index, similarity }]) => {
      if (index > curMaxIndex) {
        return [index, similarity];
      }
      if (similarity > curMaxSimilarity) {
        return [index, similarity];
      }
      return [curMaxIndex, curMaxSimilarity];
    }, initialScoreCard);
}

function onInGameTimeout(boardGame, plr, otherPlr) {
  const { state } = boardGame;
  const timeoutMs = new Date(state.guessStartTime).getTime() + IN_GAME_TIMEOUT_MS;
  const nowMs = Date.now();
  if (nowMs < timeoutMs) {
    throw new Error('Game still has time left!');
  }

  const plrScoreCard = getScoreCard(state.plrToGuessToInfo[plr.id]);
  const otherPlrScoreCard = getScoreCard(state.plrToGuessToInfo[otherPlr.id]);

  for (let i = 0; i < 2; i += 1) {
    if (plrScoreCard[i] > otherPlrScoreCard[i]) {
      state.winner = plr;
      state.status = Status.EndGame;
      return {
        state,
        finished: true,
      };
    }
    if (plrScoreCard[i] < otherPlrScoreCard[i]) {
      state.winner = otherPlr;
      state.status = Status.EndGame;
      return {
        state,
        finished: true,
      };
    }
  }

  // Score cards are identical, so it must be tie.
  state.status = Status.EndGame;
  return {
    state,
    finished: true,
  };
}

function onPlayerMoveInGame(plr, move, boardGame) {
  const {
    guess, hintRequest, acceptHint, forceEndGame,
  } = move;
  const { players, state } = boardGame;
  const { plrToSecretHash } = state;
  const otherPlayer = players.find(({ id }) => id !== plr.id);

  if (otherPlayer == null) {
    throw new Error('This should be impossible. Contact Developers.');
  }

  if (forceEndGame != null) {
    return onInGameTimeout(boardGame, plr, otherPlayer);
  }

  if (acceptHint != null) {
    const otherPlayerHintRequest = state.plrToHintRequest[otherPlayer.id];
    if (otherPlayerHintRequest == null) {
      throw new Error('Other player did not request for a hint.');
    }
    if (acceptHint) {
      grantHint(state, players);
    } else {
      state.plrToRejectHintResponse[plr.id] = new Date().toISOString();
    }
    state.plrToHintRequest = {};
    return { state };
  }

  if (hintRequest != null) {
    if (hintRequest) {
      if (state.hintIndex > MAX_HINT_INDEX) {
        throw new Error('Cannot get anymore hints.');
      }
      state.plrToHintRequest[plr.id] = true;

      if (state.plrToHintRequest[otherPlayer.id]) {
        // both requested hint so grant hint
        grantHint(state, players);
      }

      return { state };
    }
    delete state.plrToHintRequest[plr.id];
    return { state };
  }

  if (!isValidWord(guess)) {
    throw new Error('Guess is not a known word.');
  }

  // set the guessInfo for the provided guess
  const guessHash = hashWord(guess);
  const otherPlayersSecretHash = plrToSecretHash[otherPlayer.id];
  const date = new Date();

  const guessInfo = state.plrToGuessToInfo[plr.id][guess] ?? { count: 0 };
  guessInfo.lastUpdateTime = date.toISOString();
  guessInfo.count += 1;
  guessInfo.similarity = getSimilarityScore(hashToVec, guessHash, otherPlayersSecretHash);
  guessInfo.index = getNearestIndex(hashToNearest, otherPlayersSecretHash, guess);
  state.plrToGuessToInfo[plr.id][guess] = guessInfo;

  // see if winner found
  if (otherPlayersSecretHash === guessHash) {
    state.winner = plr;
    state.status = Status.EndGame;
    return {
      state,
      finished: true,
    };
  }

  // no winner found, but still update other players on guesses
  return { state };
}

function onPlayerMove(plr, move, boardGame) {
  const { state } = boardGame;
  const { status } = state;

  switch (status) {
    case Status.PreGame:
      return onPlayerMovePreGame(plr, move, boardGame);
    case Status.InGame:
      return onPlayerMoveInGame(plr, move, boardGame);
    case Status.EndGame:
      throw new Error('Game is over, you cannot continue playing.');
    default:
      throw new Error("Game got corrupted, with invalid 'boardGame.state.status'. This should never happen, so contact developers.");
  }
}

function onPlayerQuit(_, boardGame) {
  const { state, players } = boardGame;
  const { status } = state;

  // The only player left should be considered the winner by default if the game already started.
  if (players.length === 1 && status !== Status.PreGame) {
    const [winner] = players;
    state.winner = winner;
    return { state, joinable: false, finished: true };
  }

  // By default we should make this room closed by making it not joinable and
  // classifying it as finished. This is important for UrTurn to understand how to
  // handle your game properly.
  return { joinable: false, finished: true };
}

export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};