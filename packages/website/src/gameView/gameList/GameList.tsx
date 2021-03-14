import React, { useEffect, useState } from 'react';
import {
  GridList, GridListTile, GridListTileBar, IconButton, Theme, withStyles, createStyles,
} from '@material-ui/core';
import { Info as InfoIcon } from '@material-ui/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { User } from '../../models/user';

type Game = {
  id: string,
  name: string,
  description: string,
  creator: User
};

type Props = {
  classes: any
};

const GameList = ({ classes }: Props) => {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    async function getGames() {
      const res = await axios.get('/api/game?skip=0&limit=10');
      setGames(res.data.games);
    }
    getGames();
  }, []);
  const history = useHistory();

  return (
    <div className={classes.root}>
      <GridList cols={0} spacing={20} cellHeight={250} className={classes.gridList}>
        {games.map((game) => (
          <GridListTile onClick={() => history.push(`/games/${game.id}`)} key={game.id} className={classes.tile}>
            <img src="https://miro.medium.com/max/700/1*Quh2GlRDeXuzdD4IoJu93g.jpeg" alt={game.name} />
            <GridListTileBar
              title={game.name}
              subtitle={(
                <span>
                  by:
                  {game.creator.id}
                </span>
                  )}
              actionIcon={(
                <IconButton aria-label={`info about ${game.name}`} className={classes.icon}>
                  <InfoIcon />
                </IconButton>
                  )}
            />
          </GridListTile>
        ))}
      </GridList>
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

export default withStyles(styles)(GameList);
