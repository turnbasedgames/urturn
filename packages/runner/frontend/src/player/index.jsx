import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
} from 'react-router-dom';
import { connectToChild } from 'penpal';
import { Typography, LinearProgress } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  getPlayerInGameById, makeMove, BASE_URL,
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

  useEffect(() => {
    if (!childClient) {
      return () => {};
    }

    const handleNewBoardGame = (boardGame) => {
      childClient.stateChanged(boardGame);
    };
    const socket = io(BASE_URL);
    socket.on('stateChanged', handleNewBoardGame);

    return () => {
      socket.off('stateChanged', handleNewBoardGame);
      socket.disconnect();
    };
  }, [childClient]);

  const iframeRef = useCallback((iframe) => {
    if (iframe) {
      // TODO: MAIN-85 dynamically set the src url
      // eslint-disable-next-line no-param-reassign
      iframe.src = 'http://localhost:3000';
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
