import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
} from 'react-router-dom';
import { connectToChild } from 'penpal';
import { Typography, LinearProgress } from '@mui/material';
import axios from 'axios';
import { io } from 'socket.io-client';
import { isPlayerInGame, makeMove, BASE_URL } from '../data';

function Player() {
  const { playerId } = useParams();
  const [found, setFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const setupPlayer = async (id) => {
    const plrFound = await isPlayerInGame(id);
    setFound(plrFound);
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

    const setLatestStateWithContender = (contender) => {
      childClient.stateChanged(contender);
    };
    const socket = io(BASE_URL);
    socket.on('stateChanged', setLatestStateWithContender);

    return () => {
      socket.off('stateChanged', setLatestStateWithContender);
      socket.disconnect();
    };
  }, [childClient]);

  const iframeRef = useCallback((iframe) => {
    if (iframe) {
      // TODO: MAIN-85 dynamically set the src url
      // eslint-disable-next-line no-param-reassign
      iframe.src = 'http://localhost:3101';
      const connection = connectToChild({
        iframe,
        methods: {
          async makeMove(move) {
            try {
              await makeMove(playerId, move);
              return { success: true };
            } catch (err) {
              if (
                axios.isAxiosError(err) && err.response
              ) {
                // TODO: MAIN-90 good candidate for common constants across server and clients
                // server, website, localrunner, and tbg-client uses these error names
                if (err.response.data.name === 'CreatorInvalidMove') {
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
  }, [playerId]);

  if (loading) {
    return (
      <LinearProgress />
    );
  } if (found) {
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
