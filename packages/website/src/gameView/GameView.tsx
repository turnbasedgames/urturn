import React from 'react';
import {
  Switch,
  Route,
  useRouteMatch,
} from 'react-router-dom';

import GamePlayer from './gamePlayer';
import GameList from './gameList';

function GameView(): React.ReactElement {
  const match = useRouteMatch();
  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <GameList />
      </Route>
      <Route path={`${match.path}/:gameId`}>
        <GamePlayer />
      </Route>
    </Switch>
  );
}

export default GameView;
