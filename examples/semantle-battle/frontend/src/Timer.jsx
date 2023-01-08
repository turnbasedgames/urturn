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
  startTime, prefix, suffix, timeoutMs,
}) {
  const [timeLeftSecs, setTimeLeftSecs] = useState(getTimeLeftSecs(startTime, timeoutMs));

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLeftSecs = getTimeLeftSecs(startTime, timeoutMs);
      setTimeLeftSecs(newTimeLeftSecs);
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
  prefix: PropTypes.string.isRequired,
  suffix: PropTypes.string.isRequired,
};

export default Timer;
