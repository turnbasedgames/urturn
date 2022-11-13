import axios from 'axios';
import { RoomState, Room, LatestState } from '@urturn/types-common';

export enum Errors {
  RoomNotJoinable = 'RoomNotJoinable',
  CreatorError = 'CreatorError',
}

export const generateRoomState = (room: Room, roomState: LatestState): RoomState => {
  const {
    players, joinable, finished, roomStartContext,
  } = room;
  const { state, version } = roomState;

  return {
    players,
    joinable,
    finished,
    state,
    version,
    roomStartContext,
  };
};

export const joinRoom = async (roomId: string): Promise<Room> => {
  const res = await axios.post(`room/${roomId}/join`);
  return res.data.room;
};

export const quitRoom = async (roomId: string): Promise<Room> => {
  const res = await axios.post(`room/${roomId}/quit`);
  return res.data.room;
};

export const makeMove = async (roomId: string, move: any): Promise<Room> => {
  const res = await axios.post(`room/${roomId}/move`, move);
  return res.data.room;
};

export interface CreateRoomReqBody {
  private?: boolean
  game: string
}

export const queueUpRoom = async (room: CreateRoomReqBody): Promise<Room> => {
  const res = await axios.put('room', room);
  return res.data.room;
};

export interface RoomsQuery {
  gameId?: string
  joinable?: Boolean
  finished?: Boolean
  omitPlayer?: string
  containsPlayer?: string
  containsInactivePlayer?: string
  privateRooms?: Boolean
}

export const getRooms = async (query: RoomsQuery): Promise<Room[]> => {
  const res = await axios.get('room', { params: { ...query } });
  return res.data.rooms;
};

export const getRoom = async (roomId: string): Promise<Room> => {
  const res = await axios.get(`room/${roomId}`);
  return res.data.room;
};

export const queueUpPrivateRoom = async (gameId: string): Promise<Room> => queueUpRoom({
  game: gameId,
  private: true,
});
