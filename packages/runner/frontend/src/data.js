import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

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

export const useGameState = () => {
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState(null);
  async function reloadGameState() {
    setLoading(true);
    const state = await getState();
    setGameState(state);
    setLoading(false);
  }
  useEffect(() => {
    const socket = io(BASE_URL);
    socket.on('stateChanged', reloadGameState);
    reloadGameState();

    return () => {
      socket.off('stateChanged', reloadGameState);
      socket.disconnect();
    };
  }, []);

  return [gameState, loading];
};
