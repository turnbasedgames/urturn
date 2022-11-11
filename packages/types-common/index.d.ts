import { User as FirebaseUser } from 'firebase/auth'

// this User class is meant to describe the current authenticated user
export interface User {
  id: string
  username: string
  firebaseID: string
  firebaseUser: FirebaseUser
  signInProvider: string
  urbux: number
}

// fields in RoomUser are visible publicly, and used to describe ANY user (e.g. playing game with)
export interface RoomUser {
  id: string
  username: string
}

export interface MoveResult {
  success?: boolean
  error: any
}

export interface LatestState {
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
  latestState: LatestState
}

export interface RoomState {
  players: RoomUser[]
  joinable: boolean
  finished: boolean
  state: any
  version: number
}

export interface Game {
  id: string
  name: string
  description: string
  creator: User
  githubURL: string
  commitSHA: string
  activePlayerCount: Number
}

export interface WatchRoomRes {
  error: string
}

export const DISCORD_URL: string
export const DOCS_URL: string
