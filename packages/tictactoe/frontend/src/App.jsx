import React, { useState, useEffect } from 'react';
import {
  Paper, Typography, Stack, Box,
} from '@mui/material';

import client, { events } from '@turnbasedgames/client';

function App() {
  const [grid, setGrid] = useState([[null, null, null], [null, null, null], [null, null, null]]);

  useEffect(() => {
    const onStateChanged = (state) => {
      console.log('child: state changed:', state);
      setGrid(state.state.board);
    };
    events.on('stateChanged', onStateChanged);
    return () => {
      events.off('stateChanged', onStateChanged);
    };
  }, []);

  return (
    <Paper>
      <Typography>TicTacToe 1</Typography>
      {grid.map((row, rowNum) => (
        <Stack direction="row" spacing={2}>
          {row.map((val, colNum) => (
            <Box onClick={async (event) => {
              event.preventDefault();
              const move = { x: rowNum, y: colNum };
              console.log(`child: ${rowNum}, ${colNum} onClick: attempting move`, move);
              const res = await client.makeMove(move);
              console.log(`child: ${rowNum},${colNum} onClick: move result`, res);
            }}
            >
              {`val: ${val}`}
            </Box>
          ))}
        </Stack>
      ))}
    </Paper>
  );
}

export default App;
