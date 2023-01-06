import {
  User, RoomUser, RoomStartContext,
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
  quitRoom: () => Promise<void>
  playAgain: () => Promise<void>
  players?: RoomUser[]
  roomStartContext?: RoomStartContext
  finished?: boolean
  onOtherGamesClick?: () => void
  getServerTime: (cb: Function) => void
}
