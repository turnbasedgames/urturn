import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export const addPlayer = async () => {
  const { data } = await axios.post(`${BASE_URL}/player`);
  return data;
};

export const getState = async () => {
  const { data } = await axios.get(`${BASE_URL}/state`);
  return data;
};

export const makeMove = (playerId, move) => axios.post(`${BASE_URL}/player/${playerId}/move`, move);

export const resetState = async () => axios.delete(`${BASE_URL}/state`);

export const removePlayer = (playerId) => axios.delete(`${BASE_URL}/player/${playerId}`);

export const isPlayerInGame = async (playerId) => {
  const { players } = await getState();
  return players.includes(playerId);
};
