import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export const addPlayer = () => axios.post(`${BASE_URL}/player`);

export const getState = async () => {
  const { data } = await axios.get(`${BASE_URL}/state`);
  return data;
};

export const resetState = async () => axios.delete(`${BASE_URL}/state`);

export const removePlayer = (playerId) => axios.delete(`${BASE_URL}/player/${playerId}`);
