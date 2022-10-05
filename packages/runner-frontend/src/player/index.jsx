/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { RoomPlayer } from '@urturn/ui-common';
import {
  getPlayerInGameById, makeMove, getBaseUrl, removePlayer,
} from '../data';

function Player() {
  const { playerId } = useParams();

  const [player, setPlayer] = useState();
  useEffect(() => {
    const setupPlayer = async (id) => {
      const plr = await getPlayerInGameById(id);
      setPlayer(plr);
    };

    setupPlayer(playerId);
  }, [playerId]);

  const [iframeSrc, setIframeSrc] = useState();
  useEffect(() => {
    if (!process.env.REACT_APP_USER_PORT) {
      axios.get('/.well-known/get-frontend-port').then((response) => setIframeSrc(`http://localhost:${response.data.frontendPort}`));
    } else {
      setIframeSrc(`http://localhost:${process.env.REACT_APP_USER_PORT}`);
    }
  });

  const [childClient, setChildClient] = useState(null);
  useEffect(async () => {
    if (!childClient) {
      return () => {};
    }

    const handleNewBoardGame = (boardGame) => {
      // we should close the tab when the player is no longer in the game
      // this happens usually when the backend is hot reloaded and the state is reset
      if (!boardGame.players.some((p) => p.id === playerId)) {
        window.close();
      }
      childClient.stateChanged(boardGame);
    };
    const socket = io(await getBaseUrl());
    socket.on('stateChanged', handleNewBoardGame);

    return () => {
      socket.off('stateChanged', handleNewBoardGame);
      socket.disconnect();
    };
  }, [childClient]);

  if (iframeSrc == null || player == null) {
    return (
      <LinearProgress />
    );
  }
  return (
    <RoomPlayer
      src={iframeSrc}
      user={player}
      setChildClient={setChildClient}
      makeMove={async (move) => {
        await makeMove(player, move);
      }}
      quitRoom={async () => {
        await removePlayer(player);
      }}
    />
  );
}

export default Player;
