import axios from 'axios';

import { Game } from './game';
import { RoomUser } from './user';

export enum Errors {
  RoomNotJoinable = 'RoomNotJoinable',
  CreatorError = 'CreatorError',
}

export interface RoomState {
  room: string,
  state: any,
  version: number,
}

export interface Room {
  id: string
  game: Game,
  private: boolean,
  players: RoomUser[],
  finished: boolean,
  joinable: boolean,
  latestState: RoomState,
}

export const generateBoardGame = (room: Room, roomState: RoomState) => {
  const { players, joinable, finished } = room;
  const { state, version } = roomState;

  return {
    players,
    joinable,
    finished,
    state,
    version,
  };
};

export const joinRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.post(`room/${roomId}/join`);
  return res.data.room;
};

export const quitRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.post(`room/${roomId}/quit`);
  return res.data.room;
};

export const makeMove = async (roomId: String, move: any) => {
  const res = await axios.post(`room/${roomId}/move`, move);
  return res.data.room;
};

export interface CreateRoomReqBody{
  private?: boolean;
  game: String;
}

export const createRoom = async (room: CreateRoomReqBody): Promise<Room> => {
  const res = await axios.post('room', room);
  return res.data.room;
};

export type RoomsQuery = {
  gameId?: String,
  joinable?: Boolean,
  omitPlayer?: String,
  containsPlayer?: String,
  containsInactivePlayer?: String,
};

export const getRooms = async (query: RoomsQuery): Promise<Room[]> => {
  const res = await axios.get('room', { params: { ...query } });
  return res.data.rooms;
};

export const getRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.get(`room/${roomId}`);
  return res.data.room;
};

export const createPrivateRoom = async (gameId: String): Promise<Room> => createRoom({
  game: gameId,
  private: true,
});

// TODO: should this just be a part of join endpoint?
export const joinOrCreateRoom = async (gameId: String, userId: String): Promise<Room> => {
  const maxRetries = 10;
  let tries = 0;
  let lastErr;

  /* eslint-disable no-await-in-loop */
  while (tries < maxRetries) {
    try {
      const roomsRaw = await getRooms({ gameId, joinable: true, omitPlayer: userId });
      if (roomsRaw && roomsRaw.length === 0) {
        const newRoom = await createRoom({ game: gameId });
        return newRoom;
      }
      const room = roomsRaw[0];
      const newRoom = await joinRoom(room.id);
      return newRoom;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.data.name === Errors.RoomNotJoinable) {
          console.log(err.response.data.message);
        }
      }
      tries += 1;
      lastErr = err;
    }
  }
  /* eslint-enable no-await-in-loop */

  throw lastErr;
};
