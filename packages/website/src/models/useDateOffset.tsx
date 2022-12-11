import { useEffect, useState } from 'react';
import logger from '../logger';
import { getDate } from './instance';

const DEFAULT_OFFSET = 0;
const OFFSET_HISTORY_LENGTH = 10;
const SYNC_INTERVAL_MS = 1000;

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

const useDateOffset = (): [number] => {
  const [offset, setOffset] = useState(DEFAULT_OFFSET);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const offsets: number[] = new Array(OFFSET_HISTORY_LENGTH);
    const latencies: number[] = new Array(OFFSET_HISTORY_LENGTH);
    let idx = 0;
    const syncServer = async (): Promise<void> => {
      try {
        const requestTimeMS = new Date().getTime();
        const serverTimeMS = (await getDate()).getTime();
        const responseTimeMS = new Date().getTime();

        const latency = (responseTimeMS - requestTimeMS) / 2;
        latencies[idx] = latency;
        offsets[idx] = serverTimeMS - average(latencies.filter((n) => n != null)) - requestTimeMS;

        idx = (idx + 1) % OFFSET_HISTORY_LENGTH;

        setOffset(average(offsets.filter((n) => n != null)));
      } catch (e) {
        logger.error(e);
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      timeout = setTimeout(async () => syncServer(), SYNC_INTERVAL_MS);
    };

    syncServer().catch((e) => logger.error(e));

    return () => clearTimeout(timeout);
  }, []);

  return [offset];
};

export default useDateOffset;
