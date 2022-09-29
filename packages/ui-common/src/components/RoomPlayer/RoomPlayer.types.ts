// TODO: common types should be pulled into a separate package, because they are used by many
// packages, not necessarily needing this common component library
export interface PublicPlayer {
  id: string
  username: string
}

export interface MoveResult {
  success?: boolean
  error: any
}

export interface RoomPlayerProps {
// TODO:kevin todo put all the expected props for the player
  src: string
  getLocalPlayer: () => PublicPlayer
  makeMove: (move: any) => MoveResult
}
