import React from 'react';

import {
  Typography, Stack, List, ListItem, ListItemText, Paper,
} from '@mui/material';
import PropTypes from 'prop-types';

function PlayerList({ players }) {
  return (
    <Paper>
      <Stack padding={1} sx={{ minWidth: '100px' }}>
        <Typography disableGutter color="text.primary">Players</Typography>
        <List dense disablePadding padding={0}>
          {players.map((player, ind) => (
            <ListItem dense disablePadding key={player.id}>
              <ListItemText primary={`${ind + 1}: ${player.username}`} />
            </ListItem>
          ))}
        </List>
      </Stack>
    </Paper>
  );
}

PlayerList.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  })),
};

PlayerList.defaultProps = {
  players: [],
};

export default PlayerList;
