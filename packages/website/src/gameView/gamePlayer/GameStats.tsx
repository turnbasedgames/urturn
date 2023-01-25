import { Game } from '@urturn/types-common';
import React, { useState, useEffect } from 'react';
import {
  Stack, Chip, Typography, Paper,
} from '@mui/material';
import moment from 'moment';
import { Octokit } from 'octokit';
import GroupIcon from '@mui/icons-material/Group';
import GitHubIcon from '@mui/icons-material/GitHub';
import PublicIcon from '@mui/icons-material/Public';
import { getOwnerRepoFromURL } from '../../gameEditor/util';
import logger from '../../logger';

const octokit = new Octokit();

interface GameStatsProps {
  game: Game
}

function isoStrToDisplay(iso: string): string {
  const date = new Date(iso);
  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero based
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

function GameStats({ game }: GameStatsProps): React.ReactElement {
  const {
    activePlayerCount, playCount, updatedAt, createdAt, githubURL,
  } = game;

  const [starCount, setStarCount] = useState<number | undefined>(undefined);
  useEffect(() => {
    const setupStarCount = async (): Promise<void> => {
      const { owner, repo } = getOwnerRepoFromURL(githubURL);
      const res = await octokit.rest.repos.get({ owner, repo });
      setStarCount(res.data.stargazers_count);
    };
    setupStarCount().catch(logger.error);
  }, [githubURL]);
  return (
    <Stack
      direction="row"
      spacing={0}
      alignItems="center"
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      <Chip
        size="small"
        color="primary"
        variant="outlined"
        label={`${activePlayerCount} Active`}
        icon={<GroupIcon />}
      />
      <Chip
        size="small"
        color="secondary"
        variant="outlined"
        label={`${playCount} Plays`}
        icon={<PublicIcon />}
      />
      <Chip
        size="small"
        variant="outlined"
        label={(
          <Stack margin="auto" direction="row" alignItems="center" spacing={0.5}>
            <Typography fontSize="0.8rem">
              Created
            </Typography>
            <Paper
              sx={{ paddingLeft: 0.5, paddingRight: 0.5 }}
              variant="outlined"
              elevation={0}
            >
              <Typography fontSize="0.8rem">
                {isoStrToDisplay(createdAt)}
              </Typography>
            </Paper>
          </Stack>
        )}
      />
      <Chip
        size="small"
        variant="outlined"
        label={(
          <Stack margin="auto" direction="row" alignItems="center" spacing={0.5}>
            <Typography fontSize="0.8rem">
              Updated
            </Typography>
            <Paper
              sx={{ paddingLeft: 0.5, paddingRight: 0.5 }}
              variant="outlined"
              elevation={0}
            >
              <Typography fontSize="0.8rem">
                {moment(updatedAt).fromNow()}
              </Typography>
            </Paper>
          </Stack>
        )}
      />
      <Chip
        size="small"
        label={(
          <Stack margin="auto" direction="row" alignItems="center" spacing={0.5}>
            <Typography fontSize="0.8rem">
              Stars ✨
            </Typography>
            <Paper sx={{ paddingLeft: 0.5, paddingRight: 0.5 }} elevation={0}>
              <Typography fontSize="0.8rem">
                {starCount}
              </Typography>
            </Paper>
          </Stack>
        )}
        component="a"
        icon={<GitHubIcon />}
        href={githubURL}
        target="_blank"
        clickable
      />
    </Stack>
  );
}

export default GameStats;
