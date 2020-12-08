import React from 'react';
import {
  Theme, withStyles, createStyles,
} from '@material-ui/core';
import {
  useParams,
} from 'react-router-dom';

type Props = {
  classes: any
};

type GamesURLParams = {
  gameId: string
};

const GamePlayer = ({ classes }: Props) => {
  const { gameId } = useParams<GamesURLParams>();
  return (
    <div>
      hello this is game
      {' '}
      {gameId}
    </div>
  );
};

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    backgroundColor: theme.palette.background.paper,
    height: '100%',
    margin: '20px',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  gridList: {
    justifyContent: 'center',
    transform: 'translateZ(0)',
  },
  tile: {
    width: '250px',
  },
});

export default withStyles(styles)(GamePlayer);
