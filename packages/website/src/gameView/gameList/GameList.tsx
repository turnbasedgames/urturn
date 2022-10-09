import React, { useEffect, useState } from 'react';
import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
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
      padding={2}
      overflow="auto"
    >
      <Typography color="text.primary">
        Featured Games
      </Typography>
      <Grid
        container
        direction="column"
        sx={{
          overflowX: 'auto',
        }}
      >
        {featuredGames.map((game) => (<GameListCard game={game} />
        ))}
      </Grid>
      <Typography color="text.primary">
        All Games
      </Typography>
      <Grid
        container
      >
        {games.map((game) => (
          <GameListCard game={game} />
        ))}
      </Grid>
    </Stack>
  );
}

export default GameList;
