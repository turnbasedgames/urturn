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
  quitRoom: () => Promise<void>
}
