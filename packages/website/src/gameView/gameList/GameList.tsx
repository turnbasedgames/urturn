import React, { useEffect, useState } from 'react';
import {
  Card, CardActionArea, CardContent, List, ListItem, Stack, Typography,
} from '@mui/material';
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
    >
      <Typography color="text.primary">
        All Games
      </Typography>
      <List
        sx={{
          width: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {games.map((game) => (
          <ListItem
            disableGutters
            sx={{ width: '300px', paddingRight: 2 }}
            key={`GameListItem-${game.id}`}
          >
            <Card // TODO: separate component
              key={`GameCard-${game.id}`}
              sx={{ width: '100%' }}
            >
              <CardActionArea
                onClick={() => history.push(`/games/${game.id}`)}
              >
                <CardMediaWithFallback
                  sx={{ height: '140px' }}
                  game={game}
                />
                <CardContent>
                  <Typography noWrap>{game.name}</Typography>
                  <Typography noWrap>
                    {`by: ${game.creator.username}`}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
};

export default GameList;
