const MAX_WORD_LENGTH = 6;

function timeout(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const processChunk = async (lines, chunkInd, chunkSize, func) => {
  const chunkEnd = chunkInd + chunkSize;
  for (let ind = chunkInd; ind < lines.length && ind < chunkEnd; ind += 1) {
    func(lines[ind]);
  }
};

const processChunks = async (lines, func) => {
  const chunkSize = 100;
  for (let chunkInd = 0; chunkInd <= lines.length; chunkInd += chunkSize) {
    /* eslint-disable no-await-in-loop */
    await processChunk(lines, chunkInd, chunkSize, func);
    await timeout(10);
    /* eslint-enable no-await-in-loop */
  }
};

const wordToNearestWordPairsPromise = fetch(`data/similarity-pairs${process.env.REACT_APP_DEV === 'true' ? '-test' : ''}.txt`)
  .then((res) => res.text()).then((rawData) => {
    const wordToNearestWordPairs = new Map();
    rawData.split(/\r?\n/).forEach((line) => {
      const [word, ...similarWordPairs] = line.split(' ');
      wordToNearestWordPairs.set(word, similarWordPairs
        .reduce((result, value, index, array) => {
          if (index % 2 === 0) { result.push(array.slice(index, index + 2)); }
          return result;
        }, []));
    });
    return wordToNearestWordPairs;
  });

const wordToVecPromise = fetch(`data/word-to-vec${process.env.REACT_APP_DEV === 'true' ? '-test' : ''}.txt`).then((res) => res.text()).then((rawData) => {
  const wordToVec = new Map();
  const lines = rawData.split(/\r?\n/);
  return processChunks(lines, (line) => {
    const [word, ...vec] = line.split(' ');
    wordToVec.set(word, vec);
  }).then(() => wordToVec);
});

export const getWordToNearestWordPairs = async () => wordToNearestWordPairsPromise;

export const getWordToVec = async () => wordToVecPromise;

export const getWordData = () => Promise.all(
  [getWordToNearestWordPairs(), getWordToVec()],
);

export const getStatusMsg = ({
  status, winner, finished, players, curPlr, plrToSecretHash, dataLoading,
}) => {
  if (dataLoading) {
    return 'Sit tight. We are loading a big ass word model in memory... (should be roughly 150 MB).';
  }
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
  const wordToVec = await wordToVecPromise;
  if (!wordToVec.has(word)) {
    return 'this word is unknown to the game.';
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

export const getClosenessObj = (wordToNearestWordPairs, secret, guess) => {
  const similarPairs = wordToNearestWordPairs.get(secret);
  const index = similarPairs.findIndex(([, word]) => word === guess);
  const message = index >= 0 ? `${index + 1}/${similarPairs.length}` : 'cold';
  return { message, topPosition: index };
};

export const getOtherPlayer = (players, curPlr) => players.find(({ id }) => id !== curPlr.id);

export const getGuessesData = (guessToInfo, secret) => getWordData()
  .then(([wordToNearestWordPairs, wordToVec]) => {
    const guessEntries = Object.entries(guessToInfo);

    const sortedGuesses = guessEntries.map(
      ([guess, { count, lastUpdateTime }]) => ({
        guess,
        count,
        lastUpdateTime,
        similarity: getSimilarityScore(wordToVec, guess, secret),
        ...getClosenessObj(wordToNearestWordPairs, secret, guess),
      }),
    ).sort((a, b) => b.similarity - a.similarity);
    const latestGuess = sortedGuesses
      .reduce(
        (
          curLatestGuess,
          curGuess,
        ) => (curLatestGuess.lastUpdateTime > curGuess.lastUpdateTime
          ? curLatestGuess : curGuess),
        guessEntries[0],
      );
    return {
      latestGuess,
      sortedGuesses,
    };
  });
