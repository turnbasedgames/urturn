import axios from 'axios';
import { User } from './user';

export interface Game{
  id: string,
  name: string,
  description: string,
  creator: User,
  githubURL: string,
  commitSHA: string
}

export interface GameReqBody{
  name: string,
  description: string,
  githubURL: string,
  commitSHA: string
}

export const createGame = async (game: GameReqBody): Promise<Game> => {
  const res = await axios.post('/api/game', game);
  return res.data.game as Game;
};

export const getGame = async (gameId: string): Promise<Game> => {
  const res = await axios.get(`/api/game/${gameId}`);
  return res.data.game;
};

export const getGames = async (): Promise<Game[]> => {
  const res = await axios.get('/api/game?skip=0&limit=10');
  return res.data.games;
};
