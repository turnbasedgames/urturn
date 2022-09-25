import {
  Card, Box, CardContent, Typography, Stack, Link,
} from '@mui/material';
import React from 'react';
import CardMediaWithFallback from '../gameView/CardMediaWithFallback';

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
      <CardMediaWithFallback
        sx={{ width: '140px', height: '140px', minWidth: '140px' }}
        game={game}
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
