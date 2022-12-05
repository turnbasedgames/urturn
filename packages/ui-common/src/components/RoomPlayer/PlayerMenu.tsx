import React, { useState } from 'react';
import {
  IconButton, Paper, Stack, Modal, Card, CardHeader,
  Tooltip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Game, RoomUser } from '@urturn/types-common';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PeopleIcon from '@mui/icons-material/People';
import logger from '../../logger';
import Theme from '../Theme';

interface PlayerMenuProps {
  quitRoom: () => Promise<void>
  players: RoomUser[]
  curPlayer: RoomUser
  game?: Game
}

function PlayerMenu({
  quitRoom, players, curPlayer, game,
}: PlayerMenuProps): React.ReactElement {
  const [playersModalOpen, setPlayersModalOpen] = useState(false);
  const spectating = players.every(({ id }) => id !== curPlayer.id);
  return (
    <ThemeProvider theme={Theme}>
      <Modal
        open={playersModalOpen}
        onClose={() => setPlayersModalOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          variant="outlined"
          sx={{
            padding: 1,
            minWidth: '300px',
            maxHeight: '70%',
            overflowY: 'auto',
          }}
        >
          <CardHeader
            title="Players"
            subheader={spectating ? 'Spectating' : 'Playing with'}
            sx={{ padding: 1 }}
          />
          <Stack spacing={1}>
            {players.map(({ username, id }, idx) => (
              <Card variant="outlined">
                <CardHeader
                  title={`${idx + 1}. ${username}${id === curPlayer.id ? ' (you)' : ''}`}
                  titleTypographyProps={{ variant: 'h6' }}
                  subheader={id}
                  subheaderTypographyProp={{ variant: 'subtitle2' }}
                  sx={{ padding: 1 }}
                />
              </Card>
            ))}
          </Stack>
        </Card>
      </Modal>
      <Paper
        sx={{
          opacity: 0.4,
          ':hover': {
            opacity: 1,
          },
          position: 'absolute',
          padding: 0.5,
        }}
        square
      >
        <Stack direction="column">
          <Tooltip disableFocusListener placement="right" title="More Games">
            <IconButton
              size="small"
              sx={{ borderRadius: 1 }}
              href="/"
              onClick={() => logger.info(
                `Platform link clicked from game: ${game?.id ?? 'NO ID FOUND'}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SportsEsportsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip disableFocusListener placement="right" title="Players">
            <IconButton
              size="small"
              onClick={() => setPlayersModalOpen(true)}
              sx={{ borderRadius: 1 }}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip disableFocusListener placement="right" title="Quit">
            <IconButton
              size="small"
              onClick={() => {
                quitRoom().catch(logger.error);
              }}
              sx={{
                borderRadius: 1,
                transform: 'rotate(-180deg)',
              }}
            >
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
    </ThemeProvider>
  );
}

export default PlayerMenu;
