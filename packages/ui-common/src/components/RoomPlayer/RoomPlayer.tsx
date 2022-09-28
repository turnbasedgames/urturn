import React from 'react';
import { Typography } from '@mui/material';
import { RoomPlayerProps } from './RoomPlayer.types';

const RoomPlayer = ({
  src,
  getLocalPlayer,
  makeMove
}: RoomPlayerProps) => {
  console.log("props:", {src, getLocalPlayer, makeMove});
  return <Typography>
    RoomPlayer {src} {getLocalPlayer} {makeMove}
  </Typography>
}
// TODO: KEVIN setup rollup on tutorial
export default RoomPlayer
