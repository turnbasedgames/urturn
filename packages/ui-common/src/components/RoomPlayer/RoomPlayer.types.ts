import {
  User,
} from '@urturn/types-common';

export enum Errors {
  RoomNotJoinable = 'RoomNotJoinable',
  CreatorError = 'CreatorError',
}
export interface RoomPlayerProps {
  user: User
  src: string
  makeMove: (move: any) => Promise<void>
  setChildClient: (childClient: any) => void
  // when socket changes we should send to childClient that the stateChanged
  // note: runner frontend checks if player is still in list of players and closes the window
  // when state changes. We should rely on the onPlayerQuit socket event instead to pull that
  // that logic out

  // child client depends on whether or not the player exist, we should destroy the client user
  // changes.

  // iframeRef: this is necessary because we need to get the iframeRef before we can
  // use penpal to connect to the child. we set the src of the iframe before we attempt to
  // connect to 0he child

  // 1. iframeRef is defined (look into how refs work)
  // 2. iframe calls the iframeRef callback (useCallback) with the iframe element
  // 3. we set the iframe.src to load user code
  // 4. we attempt to make a connection to the child
  // 5. state change fires asynchronously
}
