import { getDate } from './instance';

const OFFSET_HISTORY_LENGTH = 10;

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const useDateOffset = (): [() => Promise<number>] => {
  const offsets: number[] = new Array(OFFSET_HISTORY_LENGTH);
  const latencies: number[] = new Array(OFFSET_HISTORY_LENGTH);
  let idx = 0;

  const getOffset = async (): Promise<number> => {
    const requestTimeMS = new Date().getTime();
    const serverTimeMS = (await getDate()).getTime();
    const responseTimeMS = new Date().getTime();

    const latency = (responseTimeMS - requestTimeMS) / 2;
    latencies[idx] = latency;
    offsets[idx] = serverTimeMS - average(latencies.filter((n) => n != null)) - requestTimeMS;

    idx = (idx + 1) % OFFSET_HISTORY_LENGTH;

    return average(offsets.filter((n) => n != null));
  };

  return [getOffset];
};

export default useDateOffset;
