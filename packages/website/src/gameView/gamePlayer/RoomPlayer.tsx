import React, {
  useEffect, useState, useMemo, useContext,
} from 'react';
import { useParams } from 'react-router-dom';

import {
  LinearProgress, Modal, Paper, Typography,
} from '@mui/material';
import IFrame from './IFrame/IFrame';
import {
  joinRoom, getRoom, Room,
} from '../../models/room';
import { RoomUser, User, UserContext } from '../../models/user';

type RoomURLParams = {
  roomId: string
};

const shouldJoinPrivateRoom = (user?: User, room?: Room): boolean => Boolean(
  room
  && user
  && room.joinable
  && room.private
  && !room.players.some(((p: RoomUser) => p.id === user.id)),
);

const RoomPlayer = () => {
  const { roomId } = useParams<RoomURLParams>();
  const [room, setRoom] = useState<Room | undefined>();
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const userContext = useContext(UserContext);

  useEffect(() => {
    async function setupRoom() {
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
      if (shouldJoinPrivateRoom(userContext.user, roomRaw)) {
        const joinedRoomResult = await joinRoom(roomId);
        setRoom(joinedRoomResult);
      }
    }
    setupRoom();
  }, [userContext.user]);

  const iframeMemo = useMemo(() => (
    room
    && userContext.user
    && (
    <IFrame
      user={userContext.user}
      room={room}
    />
    )
  ), [room, userContext.user]);

  if (room) {
    // TODO: information header? and the Iframe takes entire screen?
    //       information header provides:
    //       1. exit the game
    //       2. view other users in the game (in the future send friend requests to user,
    //          open user profiles)
    //       3. we should remove the original navbar, it feels unnecessary
    //       4. escape keybinding, but also physical button
    return (
      <>
        <Modal
          open={openMenu}
          onClose={() => setOpenMenu(false)}
        >
          <Paper>
            <Typography>
              this is a test modal
            </Typography>
          </Paper>
        </Modal>
        {iframeMemo}
      </>
    );
  }

  return (<LinearProgress />);
};

export default RoomPlayer;
