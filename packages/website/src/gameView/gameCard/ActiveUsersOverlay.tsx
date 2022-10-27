import React from 'react';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

function ActiveUsersOverlay({
  activePlayerCount,
}: { activePlayerCount: Number }): React.ReactElement {
  return (
    <Box sx={{
      position: 'absolute',
      backgroundColor: '#00000070',
      m: 1,
      p: 0.5,
      right: 0,
      borderRadius: 1,
      display: 'flex',
    }}
    >
      <PersonIcon fontSize="small" />
      <Typography sx={{ mx: 0.5 }}>
        {activePlayerCount}
      </Typography>
    </Box>
  );
}

export default ActiveUsersOverlay;
