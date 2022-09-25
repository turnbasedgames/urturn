import {
  Card, CardMedia, Box, CardContent, Typography, Stack,
} from '@mui/material';
import React, { SyntheticEvent } from 'react';
import { useHistory } from 'react-router-dom';

import { Game } from '../models/game';
import GameCardActions from './GameCardActions';

interface Props {
  onDelete?: () => void
  onUpdate?: () => void
  game: Game
}

function DevGameCard({ game, onDelete, onUpdate }: Props): React.ReactElement {
  const history = useHistory();
  const openGameIfClicked = (event: SyntheticEvent): void => {
    if (event.currentTarget === event.target) {
      history.push(`/games/${game.id}`);
    }
  };

  return (
    <Card
      sx={{
        display: 'flex',
        width: '100%',
      }}
    >
      <CardMedia
        sx={{ width: '140px', height: '140px', minWidth: '140px' }}
        component="img"
        image="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
        alt={game.name}
      />
      <Box sx={{
        display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0,
      }}
      >
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography noWrap variant="h5" onClick={openGameIfClicked}>
              {game.name}
            </Typography>
            <GameCardActions game={game} onDelete={onDelete} onUpdate={onUpdate} />
          </Stack>
          <Typography
            noWrap
            variant="body1"
            color="text.secondary"
          >
            {game.description}
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default DevGameCard;
