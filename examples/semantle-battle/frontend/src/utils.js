const MAX_WORD_LENGTH = 6;

export const getStatusMsg = ({
  status, winner, finished, players, curPlr, plrToSecretHash,
}) => {
  if (finished) {
    if (winner == null) {
      return "It's a tie (This is super rare)!";
    } if (winner?.id === curPlr?.id) {
      return 'You won!';
    }
    return 'You Lost';
  }
  if (status === 'preGame') {
    if (players.length === 1) { return 'Waiting on another player to join...'; }
    if (!(curPlr?.id in plrToSecretHash)) {
      return 'Choose a secret word for the other player to guess (max 6 letters)';
    }
    return 'Waiting on other player to choose their secret word for you to guess...';
  } if (status === 'inGame') {
    return 'Just keep guessing🎵 just keep guessing🎵...';
  }
  return 'Error: You should never see this. Contact developers!';
};

export const getErrorMessageForWord = (word) => {
  if (typeof word !== 'string') {
    return 'word must be a string';
  }
  if (word.length > MAX_WORD_LENGTH) {
    return `word must be at most ${MAX_WORD_LENGTH} letters long`;
  }
  if (word.length === 0) {
    return 'word cannot be empty';
  }
  if (!/^[a-z]*$/i.test(word)) {
    return 'word must be made of only letters';
  }
  return undefined;
};
