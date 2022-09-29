import React, {
  useEffect, useState, useMemo, useContext,
} from 'react';
import { useParams } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { Room, RoomUser, User } from '@urturn/types-common';
import IFrame from './IFrame/IFrame';

import {
  joinRoom, getRoom,
} from '../../models/room';
import { UserContext } from '../../models/user';
import logger from '../../logger';

interface RoomURLParams {
  roomId: string
}

const shouldJoinPrivateRoom = (user?: User, room?: Room): boolean => Boolean(
  (room != null)
  && (user != null)
  && room.joinable
  && room.private
  && !room.players.some((p: RoomUser) => p.id === user.id),
);

function RoomPlayer(): React.ReactElement {
  const { roomId } = useParams<RoomURLParams>();
  const [room, setRoom] = useState<Room | undefined>();
  const userContext = useContext(UserContext);

  useEffect(() => {
    async function setupRoom(): Promise<void> {
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
      if (shouldJoinPrivateRoom(userContext.user, roomRaw)) {
        const joinedRoomResult = await joinRoom(roomId);
        setRoom(joinedRoomResult);
      }
    }
    setupRoom().catch(logger.error);
  }, [userContext.user]);

  const iframeMemo = useMemo(() => {
    if (userContext.user == null || room == null) {
      // disabled because typescript typing thinks iframeMemo can be undefined otherwise
      // eslint-disable-next-line react/jsx-no-useless-fragment
      return <></>;
    }
    return (
      <IFrame
        user={userContext.user}
        room={room}
      />
    );
  }, [room, userContext.user]);

  if (room != null || userContext.user != null || iframeMemo !== undefined) {
    // TODO: information header? and the Iframe takes entire screen?
    //       information header provides:
    //       1. exit the game
    //       2. view other users in the game (in the future send friend requests to user,
    //          open user profiles)
    //       3. we should remove the original navbar, it feels unnecessary
    //       4. escape keybinding, but also physical button
    return iframeMemo;
  }

  return (<LinearProgress />);
}

export default RoomPlayer;
