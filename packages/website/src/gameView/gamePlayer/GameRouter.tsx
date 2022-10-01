import React from 'react';
import {
  Route,
  Switch,
  useRouteMatch,
} from 'react-router-dom';
import NavBar from '../../navBar';

import GameInfo from './GameInfo';
import GamePlayer from './GamePlayer';

function GameRouter(): React.ReactElement {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <NavBar />
        <GameInfo />
      </Route>
      <Route path={`${match.path}/room/:roomId`}>
        <GamePlayer />
      </Route>
    </Switch>
  );
}

export default GameRouter;
