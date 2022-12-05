// upscale by 100 so that similarities are between -100 and 100 instead of -1 and 1
export const MAX_SIMILARITY = 100;

export const getMagnitudeOfVector = (array) => Math.sqrt(
  array.reduce((sum, cur) => sum + (cur * cur), 0),
);

export const getSimilarityScore = (hashToVec, hash1, hash2) => {
  // note that the order of word1 and word2 doesn't matter
  // this operation satisfies the commutative property
  const vec1 = hashToVec.get(hash1);
  const vec2 = hashToVec.get(hash2);
  if (vec1 == null || vec2 == null) {
    return 0;
  }
  const mag1 = getMagnitudeOfVector(vec1);
  const mag2 = getMagnitudeOfVector(vec2);

  // take the dot product of the unit vectors
  // this solves for the value of cos(theta) value in the dot product equation
  // cos(theta) = dot(vec1, vec2) * ||vec1||||vec2||
  return MAX_SIMILARITY * vec1.reduce((sum, vec1Elem, ind) => {
    const vec2Elem = vec2[ind];
    return sum + ((vec1Elem / mag1) * (vec2Elem / mag2));
  }, 0);
};

export const getNearestIndex = (hashToNearest, secretHash, guess) => {
  const nearestWords = hashToNearest.get(secretHash);
  const index = nearestWords.indexOf(guess);
  return index;
};

export const getNthNearest = (hashToNearest, secretHash, n) => {
  const nearestWords = hashToNearest.get(secretHash);
  return nearestWords[n];
};

function getRandomItem(collection) {
  const keys = Array.from(collection.keys());
  return keys[Math.floor(Math.random() * keys.length)];
}

export const getRandHash = (hashToNearest) => getRandomItem(hashToNearest);

export const botPlr = {
  id: 'botId',
  username: 'word_bot',
};
