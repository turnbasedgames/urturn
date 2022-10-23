import React, { useEffect, useState } from 'react';
import {
  Stack, Typography, Grid,
} from '@mui/material';
import { Game } from '@urturn/types-common';

import { getGame, getGames } from '../../models/game';
import logger from '../../logger';
import GameListCard from './GameListCard';

const FEATURED_GAME_IDS = ['626eac7c65667f00160a6b42', '62adfb1b212915000e44e7a8', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42', '626eac7c65667f00160a6b42'];

function GameList(): React.ReactElement {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    async function setupGames(): Promise<void> {
      const gamesRaw = await getGames();
      setGames(gamesRaw);
    }
    setupGames().catch(logger.error);
  }, []);

  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  useEffect(() => {
    async function setupFeaturedGames(): Promise<void> {
      const featuredGamesRaw: Game[] = (await Promise.all(
        FEATURED_GAME_IDS.map(async (gameId) => {
          try {
            return await getGame(gameId);
          } catch (err) {
            logger.error(err);
          }
          return undefined;
        }),
      )).filter((game): game is Game => game != null);
      setFeaturedGames(featuredGamesRaw);
    }
    setupFeaturedGames().catch(logger.error);
  }, []);

  return (
    <Stack
      direction="column"
      padding={1}
    >
      <Typography color="text.primary">
        Featured Games
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        paddingTop={2}
        paddingBottom={2}
        sx={{
          overflowX: 'scroll',
          flexShrink: 0,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {featuredGames.map((game) => (
          <GameListCard game={game} />
        ))}
      </Stack>
      <Typography color="text.primary">
        All Games
      </Typography>
      <Grid
        container
        columns={2}
        spacing={2}
        paddingTop={2}
        justifyContent="center"
      >
        {games.map((game) => (
          <Grid item>
            <GameListCard game={game} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default GameList;
