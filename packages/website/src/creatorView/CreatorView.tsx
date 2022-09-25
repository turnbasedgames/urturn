import {
  Button, LinearProgress, Stack, Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { DISCORD_URL, DOCS_URL } from '../util';

import GameEditor from '../gameEditor';
import DevGameCard from './DevGameCard';
import { Game, getGames } from '../models/game';
import { User } from '../models/user';
import withUser from '../withUser';
import logger from '../logger';

interface Props {
  user: User
}

function CreatorView({ user }: Props): React.ReactElement {
  const [games, setGames] = useState<Game[] | null>(null);
  const gamesLoading = games == null;
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const history = useHistory();
  const setupGames = async (): Promise<void> => {
    const gamesRaw = await getGames({ creator: user.id });
    setGames(gamesRaw);
  };
  useEffect(() => {
    setupGames().catch(logger.error);
  }, []);

  return (
    <Stack direction="column">
      <LinearProgress sx={{
        position: 'relative',
        visibility: gamesLoading ? 'visible' : 'hidden',
      }}
      />
      <GameEditor
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={(game) => { history.push(`/games/${game.id}`); }}
      />
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
      >
        <Stack
          direction="column"
          spacing={1}
          m={2}
          justifyContent="flex-start"
        >
          <Typography
            variant="h5"
            color="text.primary"
          >
            Developer Resources
          </Typography>
          <Button
            href={DOCS_URL}
            variant="outlined"
            target="_blank"
          >
            API Reference
          </Button>
          <Button
            variant="outlined"
            href={DISCORD_URL}
            target="_blank"
          >
            Discord
          </Button>
        </Stack>
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          spacing={1}
          m={2}
          width="70%"
          minWidth="400px"
          maxWidth="500px"
        >
          <Button
            sx={{ width: '100%' }}
            variant="contained"
            onClick={() => setOpenCreate(true)}
          >
            Create Game
          </Button>
          {games?.map((game) => (
            <DevGameCard
              onUpdate={() => {
                setupGames().catch(logger.error);
              }}
              onDelete={() => {
                setupGames().catch(logger.error);
              }}
              key={`DevGameCard-${game.id}`}
              game={game}
            />
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}

export default withUser(CreatorView, { redirectOnAnonymous: true });
