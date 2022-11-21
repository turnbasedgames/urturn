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

export const refreshState = async () => axios.put(`${await getBaseUrl()}/state/refresh`);

export const handleRoomFunctionError = async (err, setRecentErrorMsg) => {
  let errorMsg = 'Unknown Error Happened';
  if (
    axios.isAxiosError(err) && (err.response != null)
  ) {
    const data = err.response?.data;
    if (data?.name === 'CreatorError') {
      errorMsg = data?.creatorError.message;
    } else {
      errorMsg = data?.message;
    }
  }
  setRecentErrorMsg(errorMsg);
};

export const SPECTATOR_USER = { id: 'spectator1', username: 'billywatchesyou' };

export const removePlayer = async (player) => axios.delete(`${await getBaseUrl()}/player/${player.id}`);

export const getPlayerInGameById = async (plrId) => {
  if (plrId === SPECTATOR_USER.id) {
    return SPECTATOR_USER;
  }
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

  async function refreshGameState() {
    setLoading(true);
    await refreshState();
    await reloadGameState();
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

  return [gameState, updateGameState, refreshGameState, loading];
};
