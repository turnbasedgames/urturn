import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  LinearProgress, Modal, Paper, Typography,
} from '@mui/material';
import IFrame from './IFrame/IFrame';
import {
  getRoom, Room,
} from '../../models/room';

type RoomURLParams = {
  roomId: string
};

const RoomPlayer = () => {
  const { roomId } = useParams<RoomURLParams>();
  const [room, setRoom] = useState<null | Room>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  useEffect(() => {
    async function setupRoom() {
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
    }
    setupRoom();
  }, []);

  const iframeMemo = useMemo(() => (
    room
    && (
    <IFrame
      room={room}
    />
    )
  ), [room]);

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
