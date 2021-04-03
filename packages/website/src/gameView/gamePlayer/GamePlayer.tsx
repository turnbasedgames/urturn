import React, { useEffect, useState } from 'react';
import {
  Theme, withStyles, createStyles, Typography,
} from '@material-ui/core';
import {
  useParams,
} from 'react-router-dom';
import { Game, getGame } from '../../models/game';
import IFrame from './IFrame/IFrame';

type Props = {
  classes: any
};

type GamesURLParams = {
  gameId: string
};

const GamePlayer = ({ classes }: Props) => {
  const { gameId } = useParams<GamesURLParams>();
  const [game, setGame] = useState<null | Game>(null);

  useEffect(() => {
    async function setupGame() {
      const gameRaw = await getGame(gameId);
      setGame(gameRaw);
    }
    setupGame();
  }, []);

  if (game) {
    return (
      <div className={classes.root}>
        <Typography variant="h3">
          {game.name}
        </Typography>
        <Typography variant="body1">{game.description}</Typography>
        <IFrame githubURL={game.githubURL} commitSHA={game.commitSHA} />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <h1>Loading...</h1>
    </div>
  );
};

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: theme.palette.background.paper,
    margin: '0 auto 0 auto',
  },
});

export default withStyles(styles)(GamePlayer);
