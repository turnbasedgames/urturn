import React, { useCallback, useEffect, useState } from 'react';
import { connectToChild } from 'penpal';
import { io } from 'socket.io-client';
import axios from 'axios';
import {
  Errors, makeMove, Room, RoomState,
} from '../../../models/room';

const socket = io();

type WatchRoomRes = {
  error: string
};

type UnwatchRoomRes = {
  error: string
};

interface Props {
  room: Room
}

const IFrame = ({
  room,
}: Props) => {
  console.log('rerender');
  const roomId = room.id;
  const { game: { githubURL, commitSHA } } = room;
  const parsedGithubURL = new URL(githubURL);
  const repoOwner = parsedGithubURL.pathname.split('/')[1];
  const repo = parsedGithubURL.pathname.split('/')[2];
  const cdnURL = `https://rawcdn.githack.com/${repoOwner}/${repo}/${commitSHA}/frontend/dist/index.html`;
  const [childClient, setChildClient] = useState<any | null>();

  useEffect(() => {
    let curLatestState: RoomState | undefined;
    const setLatestStateWithContender = (contender: RoomState) => {
      if (!curLatestState || (curLatestState.version < contender.version)) {
        if (childClient) {
          childClient.stateChanged(contender);
        }
      }
    };

    async function setupRoomSocket() {
      socket.on('room:latestState', setLatestStateWithContender);
      socket.emit('watchRoom', { roomId }, (res: null | WatchRoomRes) => {
        if (res) {
          console.error('error trying to watch room', res.error);
        }
      });
      setLatestStateWithContender(room.latestState);
    }

    setupRoomSocket();
    return () => {
      socket.emit('unwatchRoom', { roomId }, (res: null | UnwatchRoomRes) => {
        if (res) {
          console.error('error trying to unwatch room', res.error);
        }
      });
      socket.off('room:latestState', setLatestStateWithContender);
    };
  }, [childClient]);

  const iframeRef = useCallback((iframe: HTMLIFrameElement | null) => {
    if (iframe) {
      // eslint-disable-next-line no-param-reassign
      iframe.src = cdnURL;
      const connection = connectToChild({
        iframe,
        methods: {
          getStates() {
            // TODO: need to implement this
            // 1. do we make a request to get all the states?
            // 2. do we just check what we tracked locally?
            //   a. on roomPlayer load we get all the latest states
            //   b. maintain a list of states
            //      (what to do if we receive a state with version greater by 2 than the previous?)
            console.log('parent: getStates');
          },
          getLatestState() {
            // TODO: our implementation here should be based on the above
            console.log('parent: getLatestState');
          },
          async makeMove(move: any) {
            try {
              await makeMove(roomId, move);
              return { success: true };
            } catch (err) {
              if (
                axios.isAxiosError(err) && err.response
              ) {
                if (err.response.data.name === Errors.CreatorInvalidMove) {
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
  }, [room]);

  return (
    <iframe
      ref={iframeRef}
      title="gameFrame"
      sandbox="allow-scripts allow-forms allow-same-origin" // TODO: concept of least privelege, why do we need these?
      id="gameFrame"
      style={{ height: 'calc(100vh - 50px)', width: '100%', border: 'none' }}
    />
  );
};

export default IFrame;
