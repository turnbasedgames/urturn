import React, { useEffect, useState } from 'react';
import {
  Card, CardActionArea, CardContent, CardMedia, List, ListItem, Stack, Typography,
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { Game, getGames } from '../../models/game';

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
            sx={{ maxWidth: '300px', paddingRight: 2 }}
            key={`GameListItem-${game.id}`}
          >
            <Card // TODO: separate component
              key={`GameCard-${game.id}`}
            >
              <CardActionArea
                onClick={() => history.push(`/games/${game.id}`)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
                  alt={game.name}
                />
                <CardContent>
                  <Typography noWrap>{game.name}</Typography>
                  <Typography noWrap>
                    {`by: ${game.creator.id}`}
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
