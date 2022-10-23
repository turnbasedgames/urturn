import React, { useEffect, useState } from 'react';
import {
  Stack, Typography, Grid,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Game } from '@urturn/types-common';

import { getGame, getGames } from '../../models/game';
import logger from '../../logger';
import GameListCard from './GameListCard';

const FEATURED_GAME_IDS = ['626eac7c65667f00160a6b42', '62adfb1b212915000e44e7a8', '62f03a69c4b031000ea00bf0', '630ebdef9495d4000ee694cb', '630af4b26c3be1000e26aca4'];

function GameList(): React.ReactElement {
  const { search } = useLocation();
  const [games, setGames] = useState<Game[]>([]);
  const params = new URLSearchParams(search);

  const text = params.get('searchText');
  let searchText: string | undefined;
  if (text !== null && text !== '') {
    searchText = text;
  }

  useEffect(() => {
    async function setupGames(): Promise<void> {
      // In this case we prefer undefined over empty strings. So in the case of an empty
      // string in the search text we would rather send an 'undefined' value down to the API,
      // to prevent zero results showing up during a search when a user does not enter a value
      // in the search bar and submits.
      const gamesRaw = await getGames({ searchText });
      setGames(gamesRaw);
    }

    setupGames().catch(logger.error);
  }, [searchText]);

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

  const isSearch = searchText !== '' && searchText !== undefined;

  return (
    <Stack
      direction="column"
      padding={1}
    >
      {
        !isSearch && (
          <>
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
                <GameListCard key={game.id} game={game} />
              ))}
            </Stack>
          </>
        )
      }
      <Typography color="text.primary">
        {isSearch ? '' : 'All Games'}
      </Typography>
      <Grid
        container
        columns={2}
        spacing={2}
        paddingTop={2}
        justifyContent="center"
      >
        {games.map((game) => (
          <Grid key={game.id} item>
            <GameListCard game={game} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default GameList;
