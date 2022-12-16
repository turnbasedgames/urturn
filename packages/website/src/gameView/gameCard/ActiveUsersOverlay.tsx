import React from 'react';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { keyframes } from '@emotion/react';
import { red } from '@mui/material/colors';

const blink = keyframes`
  0% {
    opacity: 100%;
  }
  50% {
    opacity: 70%;
    animation-timing-function: ease-out;
  }
  100% {
    opacity: 100%;
    animation-timing-function: ease-in;
  }
`;

type Placement = 'top-left' | 'top-right';
interface PlacementStyle {
  right?: number
  left?: number
  top?: number
}

type PlacementMap = {
  [K in Placement]: PlacementStyle;
};

const PLACEMENT_TO_STYLE: Readonly<PlacementMap> = Object.freeze({
  'top-left': {
    left: 0,
  },
  'top-right': {
    right: 0,
  },
});

function ActiveUsersOverlay({
  placement,
  activePlayerCount,
}: { activePlayerCount: Number, placement: Placement }): React.ReactElement {
  return (
    <Box sx={{
      position: 'absolute',
      backgroundColor: red[700],
      animation: `${blink} 2s ease-in infinite`,
      m: 1,
      p: 0.25,
      borderRadius: 1,
      display: 'flex',
      ...PLACEMENT_TO_STYLE[placement],
    }}
    >
      <PersonIcon fontSize="small" sx={{ margin: 'auto' }} />
      <Typography sx={{ mx: 0.5 }}>
        {activePlayerCount}
      </Typography>
    </Box>
  );
}

export default ActiveUsersOverlay;
