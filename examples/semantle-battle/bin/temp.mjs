import { wordToVecRaw } from '../src/words.mjs';

const wordPairs = wordToVecRaw
  .trim()
  .split(/\r?\n/)
  .map((line) => {
    const [word, ...vec] = line.split(' ');
    return {
      word,
      weight: vec.reduce((total, cur) => {
        const xN = Number(cur);
        return total + xN * xN;
      }, 0),
    };
  })
  // sort in descending order
  .sort((a, b) => b.weight - a.weight);

console.log(wordPairs.slice(0, 100));
