import React from 'react';
import { Paper, Stack, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { red, orange, green } from '@mui/material/colors';

// eslint-disable-next-line react/prop-types
function BrowserView({ children, sx, url }) {
  return (
    <Paper
      elevation={4}
      sx={{
        backgroundColor: 'var(--ifm-color-emphasis-100)',
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Stack direction="column">
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} m={1}>
            <CircleIcon fontSize="5" sx={{ color: red[500] }} />
            <CircleIcon fontSize="5" sx={{ color: orange[500] }} />
            <CircleIcon fontSize="5" sx={{ color: green[500] }} />
          </Stack>
          <Paper
            elevation={0}
            sx={{
              paddingTop: 0.1,
              paddingLeft: 1,
              paddingRight: 5,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" alignItems="center">
              <Typography variant="caption">
                {url ?? 'http://localhost:3101'}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

export default BrowserView;
