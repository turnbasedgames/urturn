import {
  Button, IconButton, LinearProgress, Stack, Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Game, User, DISCORD_URL, DOCS_URL,
} from '@urturn/types-common';
import { SiDiscord } from 'react-icons/si';
import SchoolIcon from '@mui/icons-material/School';

import GameEditor from '../gameEditor';
import DevGameCard from './DevGameCard';
import { getGames } from '../models/game';
import withUser from '../withUser';
import logger from '../logger';

interface Props {
  user: User
}

function CreatorView({ user }: Props): React.ReactElement {
  // eslint-disable-next-line prefer-const
  let [games, setGames] = useState<Game[] | null>(null);
  const gamesLoading = games == null;
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const navigate = useNavigate();
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
        onSubmit={(game) => { navigate(`/games/${game.id}`); }}
      />
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="center"
      >
        <Stack
          direction="column"
          alignItems="flex-start"
          justifyContent="flex-start"
          spacing={1}
          m={2}
          minWidth="400px"
          maxWidth="800px"
        >
          <Stack
            alignItems="center"
            width="100%"
            direction="row"
            justifyContent="space-between"
          >
            <Stack direction="row">
              {games?.length === 0 && (
              <Typography variant="h6" color="textPrimary" alignItems="center" sx={{ display: 'inherit', verticalAlign: 'middle' }}>
                Talk To Us On:
              </Typography>
              )}
              <IconButton
                component={Link}
                to={DISCORD_URL}
                target="_blank"
              >
                <SiDiscord />
              </IconButton>
              <IconButton
                component={Link}
                to={DOCS_URL}
                target="_blank"
              >
                <SchoolIcon />
              </IconButton>
            </Stack>
            <Button
              variant="contained"
              onClick={() => setOpenCreate(true)}
            >
              Create Game
            </Button>
          </Stack>
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
