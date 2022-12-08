import React, {
  useEffect, useState, useContext,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LinearProgress, Typography } from '@mui/material';
import {
  RoomState,
  Game, Room, RoomUser, User, WatchRoomRes,
} from '@urturn/types-common';

import { RoomPlayer } from '@urturn/ui-common';
import { useSnackbar } from 'notistack';
import { logEvent } from 'firebase/analytics';
import {
  joinRoom, getRoom, makeMove, generateRoomState, quitRoom,
} from '../../models/room';
import { UserContext } from '../../models/user';
import logger from '../../logger';
import { GITHACK_BASE_URL, SOCKET_IO_REASON_IO_CLIENT_DISCONNECT } from '../../util';
import useSocket from '../../models/useSocket';
import { analytics } from '../../firebase/setupFirebase';

const shouldJoinPrivateRoom = (user?: User, room?: Room): boolean => Boolean(
  (room != null)
  && (user != null)
  && room.joinable
  && room.private
  && !room.players.some((p: RoomUser) => p.id === user.id),
);

function getIframeSrc(game: Game): string {
  const { githubURL, commitSHA } = game;
  const parsedGithubURL = new URL(githubURL);
  const repoOwner = parsedGithubURL.pathname.split('/')[1];
  const repo = parsedGithubURL.pathname.split('/')[2];
  return `${GITHACK_BASE_URL}/${repoOwner}/${repo}/${commitSHA}/frontend/build/index.html`;
}

function GamePlayer(): React.ReactElement {
  const { roomId } = useParams();
  const [room, setRoom] = useState<Room | undefined>();
  const [roomState, setRoomState] = useState<RoomState | undefined>();
  const userContext = useContext(UserContext);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    async function setupRoom(): Promise<void> {
      if (roomId == null) return;
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
      if (shouldJoinPrivateRoom(userContext.user, roomRaw)) {
        const joinedRoomResult = await joinRoom(roomId);
        setRoom(joinedRoomResult);
      } else if ((userContext.user !== undefined)
         && !roomRaw.players.some((p: RoomUser) => p.id === userContext.user?.id)) {
        enqueueSnackbar('Spectating 👀', {
          variant: 'info',
          persist: true,
        });
      }
    }
    setupRoom().catch(logger.error);

    return () => closeSnackbar();
  }, [userContext.user]);

  const onSocketDisconnect = (reason: string): void => {
    // client decided to disconnect, no reason to think this was an error
    if (reason === SOCKET_IO_REASON_IO_CLIENT_DISCONNECT) {
      return;
    }
    enqueueSnackbar(`Refresh page. We lost Connection: ${reason}`, {
      variant: 'error',
      persist: true,
    });
  };

  const [socket, socketConnected] = useSocket(userContext.user, onSocketDisconnect);

  const [childClient, setChildClient] = useState<any | null>();
  useEffect(() => {
    if (childClient == null || room == null || room.game == null || socket == null) {
      return () => {};
    }

    function handleNewRoomState(newRoomState: any): void {
      childClient.stateChanged(newRoomState);
      setRoomState(newRoomState);
    }

    socket.on('room:latestState', handleNewRoomState);

    // A socket can only watch one room in it's lifetime
    socket.emit('watchRoom', { roomId }, (res: null | WatchRoomRes) => {
      if (res != null) {
        logger.error('error trying to watch room', res.error);
      }
    });
    handleNewRoomState(generateRoomState(room, room.latestState));

    return () => {
      socket.off('room:latestState', handleNewRoomState);
    };
  }, [childClient, socket]);

  if (room == null || userContext.user == null || socket == null || !socketConnected) {
    return (<LinearProgress />);
  }
  if (roomId == null || room.game == null) {
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
  return (
    <RoomPlayer
      src={getIframeSrc(room.game)}
      user={userContext.user}
      setChildClient={setChildClient}
      makeMove={async (move: any) => {
        await makeMove(room.id, move);
      }}
      quitRoom={async () => {
        try {
          const noOp = roomState == null
           || roomState.finished
           || roomState.players.every(({ id }: RoomUser) => id !== userContext.user?.id);
          if (!noOp) {
            await quitRoom(room.id);
          }
        } catch (err) {
          enqueueSnackbar('Error when trying to quit room', {
            variant: 'error',
            autoHideDuration: 3000,
          });
        }
        navigate(`/games${(room.game != null) ? `/${room.game.id}` : ''}`);
      }}
      players={roomState?.players}
      onOtherGamesClick={() => logEvent(analytics, 'other_games_button_click', {
        name: (room.game != null) ? room.game.id : 'NO GAME ID FOUND',
      })}
    />
  );
}

export default GamePlayer;
