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
    state,
    // finished: false
    // joinable: true
    // We support special boolean metadata fields that you can return to
    // tell the UrTurn matchmaker on-the-fly if players can join the room!
  };
}`}
      </CodeBlock>
      Export your function definitions:
      <CodeBlock
        title="tictactoe/src/main.js"
        language="js"
      >
        {`export default {
  // Handle the initial state of your game with no players in it
  onRoomStart,
  // Change state or start the game when you have enough players
  onPlayerJoin,
  // Player Quit is triggered when players quit the room or are disconnected for 30-seconds
  onPlayerQuit,
  // Validate moves and modify state based on them
  onPlayerMove,
};
`}
      </CodeBlock>
    </Stack>
  );
}

export default StepThreeFunctions;
