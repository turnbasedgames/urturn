import React, { useEffect, useState } from 'react';
import {
  Card, CardActionArea, CardContent, Stack, Typography, 
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { useHistory } from 'react-router-dom';
import { Game, getGames } from '../../models/game';
import CardMediaWithFallback from '../CardMediaWithFallback';

const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    async function setupGames() {
      const gamesRaw = await getGames();
      setGames(gamesRaw);
    }
    setupGames();
  }, []);
  const history = useHistory();

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
        marginTop={1}
      >
        {games.map((game) => (
          <Card // TODO: separate component
            sx={{ margin: '10px' }}
            key={`GameCard-${game.id}`}
          >
            <CardActionArea onClick={() => history.push(`/games/${game.id}`)}>
              <CardMediaWithFallback
                sx={{ height: '200px', width: '180px' }}
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
};

export default GameList;
