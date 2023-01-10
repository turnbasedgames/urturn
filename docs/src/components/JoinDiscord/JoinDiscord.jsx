import React from 'react';
import { Stack } from '@mui/material';
import styles from './JoinDiscord.module.css';

function JoinDiscord() {
  return (
    <Stack justifyContent="center" margin={3}>
      <Stack minHeight="30vh" marginBottom={5} alignItems="center">
        <h1 className={styles['title-alt']}>Have questions or need one on one support?</h1>
        <a
          href="https://discord.gg/myWacjdb5S"
          target="_blank"
          className="button button--lg button--primary"
          rel="noreferrer"
        >
          Just Ask On Discord!
        </a>
      </Stack>
    </Stack>
  );
}

export default JoinDiscord;
