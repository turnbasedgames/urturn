import axios from 'axios';

export interface Game{
  id: string,
  name: string,
  description: string,
  creatorId: string
}

export interface GameReqBody{
  name: string,
  description: string,
}

export const createGame = async (game: GameReqBody): Promise<Game> => {
  const res = await axios.post('/api/game', game);
  return res.data.game as Game;
};

export const getGame = async (gameId: string): Promise<Game> => {
  const res = await axios.get(`/api/game/${gameId}`);
  return res.data.game;
};
