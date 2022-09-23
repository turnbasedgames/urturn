import React from 'react'
import {
  Route,
  Switch,
  useRouteMatch
} from 'react-router-dom'

import GameInfo from './GameInfo'
import RoomPlayer from './RoomPlayer'

const GameRouter = () => {
  const match = useRouteMatch()

  return (
    <Switch>
      <Route exact path={`${match.path}`}>
        <GameInfo />
      </Route>
      <Route path={`${match.path}/room/:roomId`}>
        <RoomPlayer />
      </Route>
    </Switch>
  )
}

export default GameRouter
