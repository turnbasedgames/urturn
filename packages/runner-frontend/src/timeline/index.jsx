import React from 'react';
import {
  AppBar, Toolbar, Typography, Stack, Paper, MenuList, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ReactJson from 'react-json-view';

// TODO: MAIN-88 diff viewer may require us to switch to monoco editor https://microsoft.github.io/monaco-editor/
function Timeline() {
  const theme = useTheme();
  const actions = [{ name: 'player billy joined' }];
  const curActionInd = 0;
  const curDiffViewer = {};
  return (
    <Stack height="50%">
      <AppBar position="relative">
        <Toolbar variant="dense">
          <Typography color="text.primary">
            Timeline
          </Typography>
        </Toolbar>
      </AppBar>
      <Stack margin={1} spacing={1} direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Paper sx={{ overflow: 'auto', minWidth: '200px' }}>
          <Stack marginTop={1} marginBottom={1}>
            <Typography paddingLeft={1} paddingRight={1} color="text.primary">
              Actions
            </Typography>
            <MenuList
              id="basic-menu"
              open
              variant="selectedMenu"
            >
              {actions.map((action, ind) => (
                <MenuItem selected={curActionInd === ind}>
                  <Typography color="text.primary">
                    {`${ind}. ${action.name}`}
                  </Typography>
                </MenuItem>
              ))}
            </MenuList>
          </Stack>
        </Paper>
        <Paper sx={{ flexGrow: 1, overflow: 'auto', maxWidth: '60%' }}>
          <ReactJson
            style={{ margin: theme.spacing(1) }}
            name={false}
            theme="twilight"
            src={curDiffViewer}
          />
        </Paper>
        <Paper sx={{ flexGrow: 1, overflow: 'auto', maxWidth: '60%' }}>
          <ReactJson
            style={{ margin: theme.spacing(1) }}
            name={false}
            theme="twilight"
            src={actions[curActionInd]}
          />
        </Paper>
      </Stack>
    </Stack>
  );
}

export default Timeline;
