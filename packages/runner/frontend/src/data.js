import axios from 'axios';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const getBaseUrlPromise = (async () => {
  if (!process.env.REACT_APP_BACKEND_PORT) {
    const response = await axios.get('/.well-known/get-server-port');
    return `http://localhost:${response.data.backendPort}`;
  }
  return `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`;
})();

export const getBaseUrl = () => getBaseUrlPromise;

export const addPlayer = async () => {
  const { data } = await axios.post(`${await getBaseUrl()}/player`);
  return data;
};

export const getState = async () => {
  const { data } = await axios.get(`${await getBaseUrl()}/state`);
  return data;
};

export const setState = async (state) => axios.post(`${await getBaseUrl()}/state`, state);

export const makeMove = async (player, move) => axios.post(`${await getBaseUrl()}/player/${player.id}/move`, move);

export const resetState = async () => axios.delete(`${await getBaseUrl()}/state`);

export const removePlayer = async (player) => axios.delete(`${await getBaseUrl()}/player/${player.id}`);

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

  async function updateGameState(state) {
    setLoading(true);

    await setState(JSON.parse(state));
    setGameState(state);

    setLoading(false);
  }

  useEffect(async () => {
    const socket = io(await getBaseUrl());
    socket.on('stateChanged', reloadGameState);
    reloadGameState();

    return () => {
      socket.off('stateChanged', reloadGameState);
      socket.disconnect();
    };
  }, []);

  return [gameState, updateGameState, loading];
};
