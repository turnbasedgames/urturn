import {
  Card, CardActionArea, CardContent, Typography,
} from '@mui/material';
import { Game } from '@urturn/types-common';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardMediaWithFallback from '../CardMediaWithFallback';

interface GameListCardProps {
  game: Game
}

function GameListCard({ game }: GameListCardProps): React.ReactElement {
  const navigate = useNavigate();

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
      <CardActionArea href={`/games/${game.id}`} onClick={() => navigate(`/games/${game.id}`)}>
        <CardMediaWithFallback
          sx={{ height: '170px', width: '170px' }}
          game={game}
        />
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
