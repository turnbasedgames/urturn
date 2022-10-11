import React from 'react';

import {
  Typography, Stack, List, ListItem, ListItemText, Paper, Chip,
} from '@mui/material';
import PropTypes from 'prop-types';

function PlayerList({ players, plrToStatus }) {
  return (
    <Paper>
      <Stack padding={1} sx={{ minWidth: '100px' }}>
        <Typography color="text.primary">Players</Typography>
        <List dense disablePadding padding={0}>
          {players.map((player, ind) => {
            const plrStatus = plrToStatus.get(player.id);
            return (
              <ListItem dense disablePadding key={player.id}>
                <ListItemText primary={`${ind + 1}: ${player.username}`} />
                {plrToStatus.has(player.id)
                && (
                <Chip
                  sx={{ marginLeft: 1 }}
                  label={plrStatus.message}
                  color={plrStatus.color}
                  variant="outlined"
                  size="small"
                />
                )}
              </ListItem>
            );
          })}
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
  plrToStatus: PropTypes.objectOf(Map),
};

PlayerList.defaultProps = {
  players: [],
  plrToStatus: new Map(),
};

export default PlayerList;
