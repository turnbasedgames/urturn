const MAX_WORD_LENGTH = 6;
const NEAREST_WORDS_COUNT = 100;

export const getStatusMsg = ({
  status, winner, finished, players, curPlr, plrToSecretHash,
}) => {
  if (finished) {
    if (winner == null) {
      return "It's a tie (This is super rare)!";
    } if (winner?.id === curPlr?.id) {
      return 'You Won!';
    }
    return 'You lost';
  }
  if (status === 'preGame') {
    if (players.length === 1) { return 'Waiting on another player to join...'; }
    if (!(curPlr?.id in plrToSecretHash)) {
      return 'Choose a secret word for the other player to guess (max 6 letters)';
    }
    return 'Waiting on other player to choose their secret word...';
  } if (status === 'inGame') {
    return 'Just keep guessing🎵 just keep guessing🎵...';
  }
  return 'Error: You should never see this. Contact developers!';
};

export const getErrorMessageForWord = async (word) => {
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

export const getMagnitudeOfVector = (array) => Math.sqrt(
  array.reduce((sum, cur) => sum + (cur * cur), 0),
);

export const getSimilarityScore = (wordToVec, word1, word2) => {
  // note that the order of word1 and word2 doesn't matter
  // this operation satisfies the commutative property
  const vec1 = wordToVec.get(word1);
  const vec2 = wordToVec.get(word2);
  if (vec1 == null || vec2 == null) {
    return 0;
  }
  const mag1 = getMagnitudeOfVector(vec1);
  const mag2 = getMagnitudeOfVector(vec2);
  // upscale by 100 so that similarities are between -100 and 100 instead of -1 and 1
  const upscale = 100;

  // take the dot product of the unit vectors
  // this solves for the value of cos(theta) value in the dot product equation
  // cos(theta) = dot(vec1, vec2) * ||vec1||||vec2||
  return upscale * vec1.reduce((sum, vec1Elem, ind) => {
    const vec2Elem = vec2[ind];
    return sum + ((vec1Elem / mag1) * (vec2Elem / mag2));
  }, 0);
};

export const getClosenessMessage = (index) => {
  const message = index >= 0 ? `${index + 1}/${NEAREST_WORDS_COUNT}` : 'cold';
  return message;
};

export const getOtherPlayer = (players, curPlr) => players.find(({ id }) => id !== curPlr.id);

export const getGuessesData = (guessToInfo) => {
  const guessToInfoCopy = { ...guessToInfo };
  const guessEntries = Object.entries(guessToInfoCopy);

  const sortedGuesses = guessEntries
    .map(([guess, entry]) => ({ ...entry, guess }))
    .sort((a, b) => b.similarity - a.similarity);
  const latestGuess = sortedGuesses
    .reduce(
      (
        curLatestGuess,
        curGuess,
      ) => {
        if (curLatestGuess == null) {
          return curGuess;
        }
        return (curLatestGuess.lastUpdateTime > curGuess.lastUpdateTime
          ? curLatestGuess : curGuess);
      },
      undefined,
    );
  return {
    latestGuess,
    sortedGuesses,
  };
};
