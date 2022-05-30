import axios from 'axios';

export const BASE_URL = 'http://localhost:3100';

export const addPlayer = async () => {
  const { data } = await axios.post(`${BASE_URL}/player`);
  return data;
};

export const getState = async () => {
  const { data } = await axios.get(`${BASE_URL}/state`);
  return data;
};

export const makeMove = (player, move) => axios.post(`${BASE_URL}/player/${player.id}/move`, move);

export const resetState = async () => axios.delete(`${BASE_URL}/state`);

export const removePlayer = (player) => axios.delete(`${BASE_URL}/player/${player.id}`);

export const getPlayerInGameById = async (plrId) => {
  const { players } = await getState();
  return players.find((somePlr) => somePlr.id === plrId);
};
