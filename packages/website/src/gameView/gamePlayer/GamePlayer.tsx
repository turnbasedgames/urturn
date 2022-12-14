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
  queueUpRoom, joinRoom, getRoom, makeMove, generateRoomState, quitRoom, resetPrivateRoom,
} from '../../models/room';
import { UserContext } from '../../models/user';
import logger from '../../logger';
import { GITHACK_BASE_URL, SOCKET_IO_REASON_IO_CLIENT_DISCONNECT } from '../../util';
import useSocket from '../../models/useSocket';
import { analytics } from '../../firebase/setupFirebase';
import useDateOffset from '../../models/useDateOffset';

const shouldJoinPrivateRoom = (user?: User, roomState?: RoomState, room?: Room): boolean => Boolean(
  (room != null)
  && (roomState != null)
  && (user != null)
  && room.private
  // use roomState instead of room, because it is updated by websockets and will be the latest
  // only on initial load will the room be the latest
  && roomState.joinable
  && !roomState.players.some((p: RoomUser) => p.id === user.id),
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
  const [offset] = useDateOffset();

  logger.info('OFFSET: ', offset);

  useEffect(() => {
    async function setupRoom(): Promise<void> {
      if (roomId == null) return;
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
    }
    setupRoom().catch(logger.error);
  }, [roomId]);

  useEffect(
    () => {
      if (room == null || roomId == null) return () => undefined;
      if (
        !shouldJoinPrivateRoom(userContext.user, generateRoomState(room, room.latestState), room)
      && (userContext.user !== undefined)
      && !room.players.some((p: RoomUser) => p.id === userContext.user?.id)
      ) {
        enqueueSnackbar('Spectating 👀', {
          variant: 'info',
          persist: true,
        });
      }
      return () => closeSnackbar();
    },
    // Run only on initial room load to display snackbar to a user that they are a spectator.
    // This avoids spamming the user with snackbars.
    [userContext.user, room],
  );

  useEffect(
    () => {
      async function handleJoinPrivateRoom(): Promise<void> {
        if (room == null || roomState == null || roomId == null) return;
        if (shouldJoinPrivateRoom(userContext.user, roomState, room)) {
          const joinedRoomResult = await joinRoom(roomId);
          setRoom(joinedRoomResult);
        }
      }
      handleJoinPrivateRoom().catch((error) => {
        logger.error(error);
        enqueueSnackbar('Error joining private room, try refreshing!', {
          variant: 'info',
          persist: true,
        });
      });
    },
    // listen if roomState.joinable changes to re-evaluate if we should join the private room
    // which mostly happens when a user "restarts private room", and all other players will be
    // re-added to the room
    [userContext.user, roomState?.joinable],
  );

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
        navigate((room.game != null) ? `/play/${room.game.customURL}` : '/games');
      }}
      players={roomState?.players}
      finished={roomState?.finished}
      roomStartContext={roomState?.roomStartContext}
      playAgain={async () => {
        if (room.game == null) {
          enqueueSnackbar('Error, game no longer exists!', {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        if (roomState?.roomStartContext == null) {
          enqueueSnackbar('Error occurred as the current room state has not loaded properly, try refreshing!', {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        if (roomState?.roomStartContext.private) {
          // recreate the match
          try {
            const newRoom = await resetPrivateRoom(room.id);
            logger.info('successfully created newRoom', { roomId: newRoom.id });

            // force a refresh to avoid handling all the edge cases with coordinating our useSocket
            // hook, childClient (penpal), and various useMemo/useRef hooks in RoomPlayer component
            navigate(0);
          } catch (error) {
            enqueueSnackbar('Error, unable to reset private room!', {
              variant: 'error',
              autoHideDuration: 3000,
            });
            logger.error(error);
          }
          logEvent(analytics, 'play_again_button_click', {
            private_room: true,
            game_id: room.game.id,
            game_name: room.game.name,
          });
        } else {
          try {
            // requeue player up in new room
            const newRoom = await queueUpRoom({ game: room.game.id });
            navigate(`/rooms/${newRoom.id}`);

            // force a refresh to avoid handling all the edge cases with coordinating our useSocket
            // hook, childClient (penpal), and various useMemo/useRef hooks in RoomPlayer component
            navigate(0);
          } catch (error) {
            enqueueSnackbar('Error, unable to queue up!', {
              variant: 'error',
              autoHideDuration: 3000,
            });
            logger.error(error);
          }
          logEvent(analytics, 'play_again_button_click', {
            private_room: false,
            game_id: room.game.id,
            game_name: room.game.name,
          });
        }
      }}
      onOtherGamesClick={() => logEvent(analytics, 'other_games_button_click', {
        game_id: room.game?.id ?? '(empty)',
        game_name: room.game?.name ?? '(empty)',
      })}
    />
  );
}

export default GamePlayer;
