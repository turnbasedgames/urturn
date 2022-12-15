import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';
import client from '@urturn/client';

const MINIMUM_TIME_LEFT_SECS = 0;
const CHECK_TIME_LEFT_INTERVAL_MS = 500;

function getTimeLeftSecs(startTime, timeoutMs) {
  const timeoutDateMs = new Date(startTime).getTime() + timeoutMs;
  const nowMs = client.now();
  const timeLeftSecs = (timeoutDateMs - nowMs) / 1000;
  return timeLeftSecs;
}

function getDisplayTimeLeftSecs(timeLeftSecs) {
  const roundedSeconds = Math.max(Math.round(timeLeftSecs), MINIMUM_TIME_LEFT_SECS);
  const seconds = roundedSeconds % 60;
  const minutes = Math.floor(roundedSeconds / 60);
  return `${minutes > 0 ? `${minutes}:` : ''}${seconds < 10 ? '0' : ''}${seconds}`;
}

function Timer({
  startTime, onTimeout, prefix, suffix, timeoutBufferMs, timeoutMs,
}) {
  const [timeLeftSecs, setTimeLeftSecs] = useState(getTimeLeftSecs(startTime, timeoutMs));

  useEffect(() => {
    const intervalStartMs = new Date().getTime();
    const interval = setInterval(() => {
      const timePassedMs = Date.now() - intervalStartMs;
      const newTimeLeftSecs = getTimeLeftSecs(startTime, timeoutMs);
      // Don't take any action within the buffer time. We do this because at startup client.now()
      // may not have enough data for syncing
      if (newTimeLeftSecs < 0 && timePassedMs > timeoutBufferMs) {
        onTimeout();
        clearInterval(interval);
      } else {
        setTimeLeftSecs(newTimeLeftSecs);
      }
    }, CHECK_TIME_LEFT_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [startTime]);

  return (
    <Typography color={timeLeftSecs <= 10 ? 'red' : 'text.primary'}>
      {`${prefix}${getDisplayTimeLeftSecs(timeLeftSecs)}${suffix}`}
    </Typography>
  );
}

Timer.propTypes = {
  timeoutMs: PropTypes.number.isRequired,
  startTime: PropTypes.string.isRequired,
  timeoutBufferMs: PropTypes.number,
  onTimeout: PropTypes.func.isRequired,
  prefix: PropTypes.string.isRequired,
  suffix: PropTypes.string.isRequired,
};

Timer.defaultProps = {
  timeoutBufferMs: 0,
};

export default Timer;
