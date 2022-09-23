import React from 'react'
import {
  Switch,
  Route,
  useRouteMatch
} from 'react-router-dom'

import GamePlayer from './gamePlayer'
import GameList from './gameList'

const GameView = () => {
  const match = useRouteMatch()
  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <GameList />
      </Route>
      <Route path={`${match.path}/:gameId`}>
        <GamePlayer />
      </Route>
    </Switch>
  )
}

export default GameView
