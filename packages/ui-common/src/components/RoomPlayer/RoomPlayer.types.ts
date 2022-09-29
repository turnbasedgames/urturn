import { User as FirebaseUser } from 'firebase/auth';

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

export interface User {
  id: string
  username: string
  firebaseID: string
  firebaseUser: FirebaseUser
  signInProvider: string
  urbux: number
}
export interface Game {
  id: string
  name: string
  description: string
  creator: User
  githubURL: string
  commitSHA: string
}

export interface RoomState {
  room: string
  state: any
  version: number
}

export interface Room {
  id: string
  // The game may be hard deleted, so we have to assume its possible for this to be null
  game?: Game
  private: boolean
  players: RoomUser[]
  finished: boolean
  joinable: boolean
  latestState: RoomState
}

export interface RoomUser {
  id: string
  username: string
}

export interface RoomPlayerProps {
  user?: User
  src: string
  setupRoom: () => Promise<Room>
  getLocalPlayer: () => PublicPlayer
  makeMove: (move: any) => MoveResult
}
