import {
  Card, CardMedia, Box, CardContent, Typography, Stack, Link,
} from '@mui/material';
import React from 'react';

import { Game } from '../models/game';
import GameCardActions from './GameCardActions';

interface Props {
  onDelete?: () => void
  onUpdate?: () => void
  game: Game
}

function DevGameCard({ game, onDelete, onUpdate }: Props): React.ReactElement {
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
            <Link href={`/games/${game.id}`} color="textPrimary" underline="hover" sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography noWrap variant="h5">
                {game.name}
              </Typography>
            </Link>
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
