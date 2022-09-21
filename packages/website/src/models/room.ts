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
  // The game may be hard deleted, so we have to assume its possible for this to be null
  game?: Game,
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

export interface CreateRoomReqBody {
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
  finished?: Boolean,
  omitPlayer?: String,
  containsPlayer?: String,
  containsInactivePlayer?: String,
  privateRooms?: Boolean,
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
      const [roomsAlreadyJoinedRaw, availableRooms] = await Promise.all([
        getRooms({ gameId, finished: false, containsPlayer: userId }),
        getRooms({
          gameId, joinable: true, omitPlayer: userId, privateRooms: false,
        }),
      ]);

      if (roomsAlreadyJoinedRaw && roomsAlreadyJoinedRaw.length > 0) {
        const [alreadyJoinedRoom] = roomsAlreadyJoinedRaw;
        return alreadyJoinedRoom;
      }

      let roomToJoin;

      if (availableRooms && availableRooms.length > 0) {
        [roomToJoin] = availableRooms;
      } else {
        const newRoom = await createRoom({ game: gameId });
        return newRoom;
      }

      const newRoom = await joinRoom(roomToJoin.id);
      return newRoom;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.data.name === Errors.RoomNotJoinable) {
          // eslint-disable-next-line no-console
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
