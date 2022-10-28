import React, { useState } from 'react';
import {
  Stack, Paper, Typography, ToggleButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PropTypes from 'prop-types';

function RevealSecret({ secret }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <Paper>
      <Stack direction="row" spacing={2} margin={1} alignItems="center">
        <ToggleButton
          size="small"
          value="check"
          selected={revealed}
          onChange={() => {
            setRevealed(!revealed);
          }}
        >
          {revealed ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </ToggleButton>
        {revealed && <Typography color="text.disabled" align="center">{secret}</Typography>}
      </Stack>
    </Paper>
  );
}

RevealSecret.propTypes = {
  secret: PropTypes.string.isRequired,
};

export default RevealSecret;
