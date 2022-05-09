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
  players: User[],
  finished: Boolean,
  joinable: Boolean,
  latestState: RoomState,
}

export const generateBoardGame = (room: Room, roomState: RoomState) => {
  const { players, joinable, finished } = room;
  const { state, version } = roomState;
  return {
    players: players.map((player) => player.id),
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

export const createRoom = async (gameId: String): Promise<Room> => {
  const res = await axios.post('room', { game: gameId });
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
