import {
  Card, CardHeader, CardMedia,
} from '@mui/material';
import React, { SyntheticEvent } from 'react';
import { useHistory } from 'react-router-dom';

import { Game } from '../models/game';
import GameCardActions from './GameCardActions';

type Props = {
  onDelete?: () => void
  onUpdate?: () => void
  game: Game
};

const DevGameCard = ({ game, onDelete, onUpdate }: Props) => {
  const history = useHistory();
  const openGameIfClicked = (event: SyntheticEvent) => event.currentTarget === event.target && history.push(`/games/${game.id}`);

  return (
    <>
      <Card
        sx={{
          width: '100%',
          display: 'flex',
        }}
      >
        <CardMedia
          sx={{ maxWidth: '140px', maxHeight: '140px' }}
          component="img"
          image="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
          alt={game.name}
          onClick={openGameIfClicked}
        />
        <CardHeader
          sx={{
            display: 'flex',
            flexGrow: 1,
            overflow: 'hidden',
            // allow underlying typography components to handle text overflow with noWrap
            // https://stackoverflow.com/questions/61675880/react-material-ui-cardheader-title-overflow-with-dots/70321025#70321025
            '& .MuiCardHeader-content': {
              overflow: 'hidden',
            },
          }}
          onClick={openGameIfClicked}
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
      </Card>
    </>
  );
};

export default DevGameCard;
