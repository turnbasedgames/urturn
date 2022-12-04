import React, { useCallback, useMemo } from 'react';
import { connectToChild } from 'penpal';
import axios from 'axios';

import logger from '../../logger';
import { RoomPlayerProps, Errors } from './RoomPlayer.types';
import PlayerMenu from './PlayerMenu';

function RoomPlayer({
  user, src, setChildClient, makeMove, quitRoom, players, game,
}: RoomPlayerProps): React.ReactElement {
  const iframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframe != null) {
      // eslint-disable-next-line no-param-reassign
      iframe.src = src;
      const connection = connectToChild({
        iframe,
        methods: {
          async getLocalPlayer() {
            return { id: user.id, username: user.username };
          },
          async makeMove(move: any) {
            try {
              await makeMove(move);
              return { success: true };
            } catch (err) {
              if (
                axios.isAxiosError(err) && (err.response != null)
              ) {
                const data: any = err.response?.data;
                if (data?.name === Errors.CreatorError) {
                  return { error: data?.creatorError };
                }
                return { error: err.response.data };
              }
              return { error: err };
            }
          },
        },
      });
      connection.promise.then((child) => {
        setChildClient(child);
      }).catch(logger.error);
    }
  }, []);

  const iframeMemo = useMemo(() => (
    <iframe
      ref={iframeRef}
      title="gameFrame"
      sandbox="allow-scripts allow-forms allow-same-origin"
      id="gameFrame"
      style={{ height: '100vh', width: '100%', border: 'none' }}
    />
  ), [src, user.id]);

  return (
    <>
      <PlayerMenu
        quitRoom={quitRoom}
        players={players ?? []}
        curPlayer={user}
        game={game}
      />
      {iframeMemo}
    </>
  );
}

export default RoomPlayer;
