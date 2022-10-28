// TODO: setup unit tests for the exported functions
// TODO: cleanup jupyter notebook to output proper text files
// TODO: use webpack and put the text files in the backend
// TODO: UrTurn should cache the entire runner instead of just files
const Status = Object.freeze({
  PreGame: 'preGame',
  InGame: 'inGame',
  EndGame: 'endGame',
});
const MAX_WORD_LENGTH = 6;
const MAX_HINT_INDEX = 70;

function hashSecret(secret) {
  return Buffer.from(secret).toString('base64');
}

function isValidWord(word) {
  // TODO: check if the word exists in list of possible words
  return typeof word === 'string' && word.length <= MAX_WORD_LENGTH;
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
    // other players will be unable to join this room (UrTurn will handle this for us)
    return { state, joinable: false };
  }
  return { state };
}

function onPlayerMovePreGame(plr, move, boardGame) {
  // TODO: add time control so player doesn't not pick word indefinitely
  const { secret } = move;
  const { state, players } = boardGame;

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
  state.plrToSecretHash[plr.id] = hashSecret(secret);

  // if both players have chosen secrets then the games should start
  // we also have to return the new state so UrTurn can update the boardGame
  // and stream changes to our frontend client
  if (players.every(({ id }) => id in state.plrToSecretHash) && players.length === 2) {
    state.status = Status.InGame;
    return { state };
  }
  return { state };
}

function grantHint(state) {
  /* eslint-disable no-param-reassign */
  state.hintIndex += 1;
  state.plrToHintRequest = {};
  state.plrToRejectHintResponse = {};
  /* eslint-enable no-param-reassign */
}

function onPlayerMoveInGame(plr, move, boardGame) {
  // TODO: implement time control limits
  const { guess, hintRequest, acceptHint } = move;
  const { players, state } = boardGame;
  const { plrToSecretHash } = state;
  const otherPlayer = players.find(({ id }) => id !== plr.id);

  if (otherPlayer == null) {
    throw new Error('This should be impossible. Contact Developers.');
  }

  if (acceptHint != null) {
    const otherPlayerHintRequest = state.plrToHintRequest[otherPlayer.id];
    if (otherPlayerHintRequest == null) {
      throw new Error('Other player did not request for a hint.');
    }
    if (acceptHint) {
      grantHint(state);
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
        grantHint(state);
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
  const date = new Date();
  const guessInfo = state.plrToGuessToInfo[plr.id][guess] ?? { count: 0 };
  guessInfo.lastUpdateTime = date.toISOString();
  guessInfo.count += 1;
  state.plrToGuessToInfo[plr.id][guess] = guessInfo;

  // see if winner found
  const guessHash = hashSecret(guess);
  const otherPlayersSecret = plrToSecretHash[otherPlayer.id];
  if (otherPlayersSecret === guessHash) {
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

module.exports = {
  onRoomStart,
  onPlayerJoin,
  onPlayerMove,
  onPlayerQuit,
};
