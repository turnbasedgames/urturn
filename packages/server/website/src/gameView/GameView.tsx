import React from 'react';
import {
  GridList, GridListTile, GridListTileBar, IconButton, Theme, withStyles, createStyles,
} from '@material-ui/core';
import { Info as InfoIcon } from '@material-ui/icons';
import {
  Switch,
  Route,
  useRouteMatch,
  useHistory,
} from 'react-router-dom';

import GamePlayer from './gamePlayer';

type Game = {
  id: string,
  img: string,
  title: string,
  author: string
};

type Props = {
  classes: any
};

const GameView = ({ classes }: Props) => {
  const gamesList: Game[] = new Array(100).fill({
    id: '1',
    img: 'https://miro.medium.com/max/700/1*Quh2GlRDeXuzdD4IoJu93g.jpeg',
    title: 'title',
    author: 'author',
  } as Game);
  const match = useRouteMatch();
  const history = useHistory();

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <div className={classes.root}>
          <GridList cols={0} spacing={20} cellHeight={250} className={classes.gridList}>
            {gamesList.map((game) => (
              <GridListTile onClick={() => history.push(`/games/${game.id}`)} key={game.id} className={classes.tile}>
                <img src={game.img} alt={game.title} />
                <GridListTileBar
                  title={game.title}
                  subtitle={(
                    <span>
                      by:
                      {game.author}
                    </span>
                  )}
                  actionIcon={(
                    <IconButton aria-label={`info about ${game.title}`} className={classes.icon}>
                      <InfoIcon />
                    </IconButton>
                  )}
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      </Route>
      <Route path={`${match.path}/:gameId`}>
        <GamePlayer />
      </Route>
    </Switch>

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

export default withStyles(styles)(GameView);
