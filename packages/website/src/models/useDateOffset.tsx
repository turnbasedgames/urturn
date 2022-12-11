import { useEffect, useState } from 'react';
import { getDate } from './instance';

function average(arr: number[]): number {
  return arr.reduce((a, b) => (a != null ? a + b : b), 0) / arr.filter((n) => n).length;
}

const DEFAULT_OFFSET = 0;
const CACHED_CALCULATIONS = 10;
const SYNC_INTERVAL_MS = 1000;

const useDateOffset = (): [number] => {
  const [offset, setOffset] = useState(DEFAULT_OFFSET);
  const offsets: number[] = new Array(CACHED_CALCULATIONS);
  const latencies: number[] = new Array(CACHED_CALCULATIONS);

  let idx = 0;
  useEffect(() => {
    const syncServer = async (): Promise<void> => {
      const requestTimeMS = new Date().getTime();
      const serverTimeMS = (await getDate()).getTime();
      const responseTimeMS = new Date().getTime();

      const latency = (requestTimeMS - responseTimeMS) / 2;
      latencies[idx] = latency;
      offsets[idx] = serverTimeMS - average(latencies) - requestTimeMS;
      idx = (idx + 1) % CACHED_CALCULATIONS;

      setOffset(average(offsets));
    };
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    const interval = setInterval(async () => syncServer(), SYNC_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return [offset];
};

export default useDateOffset;
