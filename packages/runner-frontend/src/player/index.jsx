/* eslint-disable no-param-reassign */
import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
} from 'react-router-dom';
import { connectToChild } from 'penpal';
import { Typography, LinearProgress } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  getPlayerInGameById, makeMove, getBaseUrl,
} from '../data';

function Player() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState(undefined);
  const [loading, setLoading] = useState(true);

  const setupPlayer = async (id) => {
    const plr = await getPlayerInGameById(id);
    setPlayer(plr);
    setLoading(false);
  };

  useEffect(() => {
    setupPlayer(playerId);
  }, [playerId]);

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

  const iframeRef = useCallback(async (iframe) => {
    if (iframe) {
      if (!process.env.REACT_APP_USER_PORT) {
        const response = await axios.get('/.well-known/get-frontend-port');
        iframe.src = `http://localhost:${response.data.frontendPort}`;
      } else {
        iframe.src = `http://localhost:${process.env.REACT_APP_USER_PORT}`;
      }

      // TODO: MAIN-85 dynamically set the src url
      const connection = connectToChild({
        iframe,
        methods: {
          async getLocalPlayer() {
            return { id: player.id, username: player.username };
          },
          async makeMove(move) {
            try {
              console.log('making move with player', player);
              await makeMove(player, move);
              return { success: true };
            } catch (err) {
              console.log(player, err);
              if (
                axios.isAxiosError(err) && err.response
              ) {
                // TODO: MAIN-90 good candidate for common constants across server and clients
                // server, website, runner, and client uses these error names

                // assume that if the error field is provided in response body then it
                // must be a creator error
                if (err.response.data.name === 'CreatorError') {
                  return { error: err.response.data.creatorError };
                }
                return { error: err.response.data };
              }
              return { error: err };
            }
          },
        },
        // debug: true,
        // childOrigin: 'null',
      });
      connection.promise.then((child) => {
        setChildClient(child);
      });
    }
  }, [player]);

  if (loading) {
    return (
      <LinearProgress />
    );
  } if (player !== undefined) {
    // TODO: MAIN-91 can we pull this into a common component used by both local runner and website?
    return (
      <iframe
        ref={iframeRef}
        title="gameFrame"
        sandbox="allow-scripts allow-forms allow-same-origin"
        id="gameFrame"
        style={{ height: '100vh', width: '100%', border: 'none' }}
      />
    );
  }
  return (
    <Typography variant="h3" align="center" color="text.primary">
      {`${playerId} does not exist!`}
    </Typography>
  );
}

export default Player;
