import {
  Card, CardActionArea, CardContent, Typography,
} from '@mui/material';
import { Game } from '@urturn/types-common';
import React from 'react';
import { Link } from 'react-router-dom';
import CardMediaWithFallback from '../gameCard/CardMediaWithFallback';
import ActiveUsersOverlay from '../gameCard/ActiveUsersOverlay';

interface GameListCardProps {
  game: Game
}

function GameListCard({ game }: GameListCardProps): React.ReactElement {
  const pathToUse = game.customURL != null ? `/games/play/${game.customURL}` : `/games/${game.id}`;
  return (
    <Card
      sx={{
        maxWidth: '170px',
        flexShrink: 0,
        transition: '0.2s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
      key={`GameCard-${game.id}`}
    >
      <CardActionArea component={Link} to={pathToUse}>
        <div>
          {
            game.activePlayerCount !== 0
            && <ActiveUsersOverlay activePlayerCount={game.activePlayerCount} />
          }
          <CardMediaWithFallback
            sx={{ height: '170px', width: '170px' }}
            game={game}
          />
        </div>
        <CardContent sx={{ padding: 1.5 }}>
          <Typography variant="h6" noWrap>{game.name}</Typography>
          <Typography color="text.secondary" noWrap variant="caption">
            {`by: ${game.creator.username}`}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default GameListCard;
