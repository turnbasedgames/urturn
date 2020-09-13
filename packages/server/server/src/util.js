function randInt(min = 0, max = 1) {
  return Math.floor(Math.random() * Math.floor(max - min) + min);
}

function shuffleArray(arr) {
  const a = arr;
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = randInt(0, i + 1);
    const x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

module.exports = { randInt, shuffleArray };
