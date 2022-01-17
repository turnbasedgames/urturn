import axios from 'axios';

import { Game } from './game';
import { User } from './user';

export enum Errors {
  RoomNotJoinable = 'RoomNotJoinable',
  CreatorInvalidMove = 'CreatorInvalidMove',
}

export interface RoomState {
  room: string,
  state: any,
  version: number,
}

export interface Room {
  id: string
  game: Game,
  users: User[],
  joinable: Boolean
  latestState: RoomState,
}

export const joinRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.post(`/api/room/${roomId}/join`);
  return res.data.room;
};

export const makeMove = async (roomId: String, move: any) => {
  const res = await axios.post(`/api/room/${roomId}/move`, move);
  return res;
};

export const createRoom = async (gameId: String): Promise<Room> => {
  const res = await axios.post('/api/room', { game: gameId });
  return res.data.room;
};

export const getRooms = async (
  gameId: String,
  joinable: Boolean = true,
  omitUser?: String,
): Promise<Room[]> => {
  const res = await axios.get('/api/room', { params: { gameId, joinable, omitUser } });
  return res.data.rooms;
};

export const getRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.get(`/api/room/${roomId}`);
  return res.data.room;
};

// TODO: should this just be a part of join endpoint?
export const joinOrCreateRoom = async (gameId: String, userId: String): Promise<Room> => {
  const maxRetries = 10;
  let tries = 0;
  let lastErr;

  /* eslint-disable no-await-in-loop */
  while (tries < maxRetries) {
    try {
      const roomsRaw = await getRooms(gameId, true, userId);
      if (roomsRaw && roomsRaw.length === 0) {
        const newRoom = await createRoom(gameId);
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
