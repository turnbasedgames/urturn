import React, { ReactElement } from 'react';
import { Typography } from '@mui/material';
import { RoomPlayerProps } from './RoomPlayer.types';

function RoomPlayer({
  src,
  getLocalPlayer,
  makeMove,
}: RoomPlayerProps): ReactElement {
  console.log('props:', { src, getLocalPlayer, makeMove });
  return (
    <Typography>
      RoomPlayer
      {' '}
      {src}
    </Typography>
  );
}
// TODO: KEVIN setup rollup on tutorial
export default RoomPlayer;
