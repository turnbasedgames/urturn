import React, { useEffect, useState } from 'react';
import {
  Card, CardActionArea, CardContent, Stack, Typography,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useNavigate } from 'react-router-dom';
import { Game } from '@urturn/types-common';

import { getGames } from '../../models/game';
import CardMediaWithFallback from '../CardMediaWithFallback';
import logger from '../../logger';

function GameList(): React.ReactElement {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    async function setupGames(): Promise<void> {
      const gamesRaw = await getGames();
      setGames(gamesRaw);
    }
    setupGames().catch(logger.error);
  }, []);
  const navigate = useNavigate();

  return (
    <Stack
      direction="column"
      padding={2}
      overflow="auto"
    >
      <Typography color="text.primary">
        All Games
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
