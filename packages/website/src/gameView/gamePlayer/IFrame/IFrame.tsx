import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Typography } from '@mui/material';
import { Game, Room, User } from '@urturn/types-common';
import { RoomPlayer } from '@urturn/ui-common';

// TODO:KEVIN figure out why tf we aer getting the react error with dispatcher.useCallback:
/**
 * Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
 *  This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app

 */
import {
  makeMove, generateBoardGame,
} from '../../../models/room';
import API_URL from '../../../models/util';
import { GITHACK_BASE_URL } from '../../../util';
import logger from '../../../logger';

const socket = io(API_URL, { transports: ['websocket'] });

socket.on('connect', () => {
  logger.log('socket connected: ', socket.id);
});

socket.on('disconnect', (reason) => {
  logger.log('socket disconnected with reason: ', reason);
  if (reason === 'io server disconnect') {
    logger.log('manually trying to reconnect socket');
    socket.connect();
  }
});

interface WatchRoomRes {
  error: string
}

interface UnwatchRoomRes {
  error: string
}

interface Props {
  room: Room
  user: User
}

function getIframeSrc(game: Game): string {
  const { githubURL, commitSHA } = game;
  const parsedGithubURL = new URL(githubURL);
  const repoOwner = parsedGithubURL.pathname.split('/')[1];
  const repo = parsedGithubURL.pathname.split('/')[2];
  return `${GITHACK_BASE_URL}/${repoOwner}/${repo}/${commitSHA}/frontend/build/index.html`;
}

function IFrame({
  room,
  user,
}: Props): React.ReactElement {
  if (room?.game == null) {
    return (
      <Typography
        marginTop="10px"
        variant="h4"
        align="center"
        color="text.primary"
      >
        Game not found
      </Typography>
    );
  }

  const roomId = room.id;
  const [childClient, setChildClient] = useState<any | null>();

  useEffect(() => {
    if (childClient == null) {
      return () => {};
    }

    function handleNewBoardGame(boardGame: any): void {
      childClient.stateChanged(boardGame);
    }

    async function setupRoomSocket(): Promise<void> {
      socket.on('room:latestState', handleNewBoardGame);
      socket.emit('watchRoom', { roomId }, (res: null | WatchRoomRes) => {
        if (res != null) {
          logger.error('error trying to watch room', res.error);
        }
      });
      childClient.stateChanged(generateBoardGame(room, room.latestState));
    }

    setupRoomSocket().catch(logger.error);
    return () => {
      socket.emit('unwatchRoom', { roomId }, (res: null | UnwatchRoomRes) => {
        if (res != null) {
          logger.error('error trying to unwatch room', res.error);
        }
      });
      socket.off('room:latestState', handleNewBoardGame);
    };
  }, [childClient]);

  return (
    <RoomPlayer
      src={getIframeSrc(room?.game)}
      user={user}
      setChildClient={setChildClient}
      makeMove={async (move: any) => {
        await makeMove(room.id, move);
      }}
    />
  );
}

export default IFrame;
