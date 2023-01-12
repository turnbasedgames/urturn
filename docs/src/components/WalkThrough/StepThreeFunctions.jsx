import React from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import CodeBlock from '@theme/CodeBlock';

function StepThreeFunctions() {
  return (
    <Stack height="100%" justifyContent="center" m={2} spacing={1}>
      <Typography variant="body1">
        Define your game using just
        <Box color="var(--ifm-color-primary)" fontWeight="bold" component="span"> four functions. </Box>
        Look how simple handling a player move is for TicTacToe:
      </Typography>
      <CodeBlock
        title="tictactoe/src/main.js onPlayerMove"
        language="js"
      >
        {`function onPlayerMove(player, move, roomState) {
  // Mark the board, and return the updates! UrTurn will persist the state
  const { state } = roomState;
  state.board[x][y] = plrIdToPlrMark[player.id];
  return {
    state
  };
}`}
      </CodeBlock>
      Export your function definitions:
      <CodeBlock
        title="tictactoe/src/main.js"
        language="js"
      >
        {`export default {
  onRoomStart,
  onPlayerJoin,
  onPlayerQuit,
  onPlayerMove,
};`}
      </CodeBlock>
    </Stack>
  );
}

export default StepThreeFunctions;
