import React, {
  ReactElement, useEffect, useMemo, useState,
} from 'react';
import { LinearProgress, Typography } from '@mui/material';
import { Room, RoomPlayerProps } from './RoomPlayer.types';
import logger from '../../logger';
import IFrame from './IFrame';

function RoomPlayer({
  user,
  src,
  setupRoom,
  getLocalPlayer,
  makeMove,
}: RoomPlayerProps): ReactElement {
  if (user == null) {
    return <Typography>Waiting for User to be authenticated...</Typography>;
  }

  const [room, setRoom] = useState<Room | undefined>();
  useEffect(() => {
    setupRoom().then(setRoom).catch(logger.error);
  }, [user.id]);

  const iframeMemo = useMemo(() => {
    if (user == null || room == null) {
      return <LinearProgress />;
    }
    return (
      <IFrame
        user={user}
        room={room}
      />
    );
  }, [room, user]);

  return iframeMemo;
}

export default RoomPlayer;
