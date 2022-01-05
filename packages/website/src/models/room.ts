import axios from 'axios';

import { Game } from './game';
import { User } from './user';

export interface Room {
  id: string
  game: Game,
  latestState: any,
  users: User[],
  joinable: Boolean
}

export const joinRoom = async (roomId: String): Promise<Room> => {
  const res = await axios.post(`/api/room/${roomId}/join`);
  return res.data.room;
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
      console.error('Error when joining a room');
      console.error(err);
      // TODO: error where room was no longer joinable should not add to the retries
      tries += 1;
      lastErr = err;
    }
  }
  /* eslint-enable no-await-in-loop */

  throw lastErr;
};
