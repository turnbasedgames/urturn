import React, { useEffect, useState } from 'react';
import {
  Card, CardActionArea, CardContent, Stack, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useLocation, useNavigate } from 'react-router-dom';
import { Game } from '@urturn/types-common';

import { getGames } from '../../models/game';
import CardMediaWithFallback from '../CardMediaWithFallback';
import logger from '../../logger';

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
  const navigate = useNavigate();

  return (
    <Stack
      direction="column"
      padding={2}
      overflow="auto"
    >
      <Typography color="text.primary">
        {(searchText === '' || searchText === undefined) ? 'All Games' : ''}
      </Typography>
      <Grid
        container
      >
        {games.map((game) => (
          <Card // TODO: separate component
            sx={{ margin: 1, width: '170px' }}
            key={`GameCard-${game.id}`}
          >
            <CardActionArea onClick={() => navigate(`/games/${game.id}`)}>
              <CardMediaWithFallback
                sx={{ height: '170px', width: '170px' }}
                game={game}
              />
              <CardContent sx={{ padding: 1 }}>
                <Typography noWrap>{game.name}</Typography>
                <Typography noWrap variant="caption">
                  {`by: ${game.creator.username}`}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}

export default GameList;
