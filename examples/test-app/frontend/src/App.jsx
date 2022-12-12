import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Stack,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import client, { events } from '@urturn/client';
import Editor from '@monaco-editor/react';
import theme from './theme';

const DEFAULT_MOVE_TEXT = '// put move JSON here';

function App() {
  const [moveObj, setMoveObj] = useState(null);
  useEffect(() => {
    const testServerDate = async () => {
      console.log('LOCAL DATE: ', Date.now());
      console.log('SERVER DATE: ', await client.now());
    };

    testServerDate();

    events.on('stateChanged', console.log);
    return () => {
      events.off('stateChanged', console.log);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Stack height="100vh">
        <AppBar position="relative">
          <Toolbar variant="dense" sx={{ justifyContent: 'space-between' }}>
            <Typography color="text.primary">
              Test Game Frontend
            </Typography>
            <Stack spacing={1} direction="row">
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  const result = await client.makeMove(moveObj);
                  console.log('result from move:', { moveObj, result });
                }}
              >
                Make Move
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <Stack sx={{ flexGrow: 1 }}>
          <Editor
            onChange={(jsonStr) => {
              try {
                const jsonObj = JSON.parse(jsonStr);
                setMoveObj(jsonObj);
              } catch (e) {
                setMoveObj(null);
              }
            }}
            height="100%"
            defaultLanguage="json"
            defaultValue={DEFAULT_MOVE_TEXT}
            theme="vs-dark"
          />
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}

export default App;
