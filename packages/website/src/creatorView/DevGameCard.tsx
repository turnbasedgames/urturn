import {
  Card, CardActionArea, CardHeader, CardMedia, Stack,
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
        width: '100%',
        display: 'flex',
      }}
    >
      <CardActionArea
        onClick={openGameIfClicked}
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
        }}
      >
        <CardMedia
          sx={{ maxWidth: '140px', maxHeight: '140px' }}
          component="img"
          image="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
          alt={game.name}
        />
        <Stack sx={{ flexGrow: 1, height: '100%' }}>
          <CardHeader
            sx={{
              height: '100%',
              display: 'flex',
              overflow: 'hidden',
              // allow underlying typography components to handle text overflow with noWrap
              // https://stackoverflow.com/questions/61675880/react-material-ui-cardheader-title-overflow-with-dots/70321025#70321025
              '& .MuiCardHeader-content': {
                overflow: 'hidden',
              },
            }}
            title={game.name}
            titleTypographyProps={{
              noWrap: true,
              onClick: openGameIfClicked,
            }}
            subheader={`${game.description}`}
            subheaderTypographyProps={{
              noWrap: true,
              onClick: openGameIfClicked,
            }}
            action={(<GameCardActions game={game} onDelete={onDelete} onUpdate={onUpdate} />)}
          />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default DevGameCard;
