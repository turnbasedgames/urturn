import React, { useCallback, useMemo } from 'react';
import { connectToChild } from 'penpal';
import axios from 'axios';

import logger from '../../logger';
import { RoomPlayerProps, Errors } from './RoomPlayer.types';
import PlayerMenu from './PlayerMenu';

function RoomPlayer({
  user, src, setChildClient, makeMove, quitRoom, players, finished, roomStartContext, playAgain,
  onOtherGamesClick, getServerTime,
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
          async getServerTimeOffsetMS() {
            // The goal is for the client is to be able to expose a synchronous "now()" function.
            // Because by the nature of window.postMessage(), communication must be asynchronous
            // https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
            // https://github.com/Aaronius/penpal#penpal
            // So defining the "now()" function here, would have to be async (ie return a promise),
            // which would make client <=> iframe parent more complicated, requiring a way to
            // turn this promise call to be synchronous (not currently possible in javascript).
            // Time offset from server to client is calculated using simple Cristian's algorithm
            // https://en.wikipedia.org/wiki/Cristian%27s_algorithm
            // We assume roundtrip time is symmetrical (which is not always true), but close enough.
            const requestTimeMS = new Date().getTime();

            const serverTimeMs: number = await new Promise((resolve) => {
              getServerTime(({ serverDate }: {
                serverDate: string
              }) => {
                const serverTimeMS = new Date(serverDate).getTime();
                resolve(serverTimeMS);
              });
            });
            const latency = (new Date().getTime() - requestTimeMS) / 2;
            const offset = serverTimeMs - latency - requestTimeMS;
            return offset;
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
        playAgain={playAgain}
        onOtherGamesClick={onOtherGamesClick}
        players={players ?? []}
        curPlayer={user}
        finished={finished}
        roomStartContext={roomStartContext}
      />
      {iframeMemo}
    </>
  );
}

export default RoomPlayer;
