import React, { useState } from 'react';
import {
  IconButton, Paper, Stack, Modal, Card, Typography, CardContent, CardActions, Button, CardHeader,
  Tooltip,
} from '@mui/material';
import { SiDiscord } from 'react-icons/si';
import { ThemeProvider } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
  DISCORD_URL, DOCS_URL, RoomUser, RoomStartContext,
} from '@urturn/types-common';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ConstructionIcon from '@mui/icons-material/Construction';
import PeopleIcon from '@mui/icons-material/People';
import logger from '../../logger';
import Theme from '../Theme';
import PlayAgainMenu from './PlayAgainMenu';

interface PlayerMenuProps {
  quitRoom: () => Promise<void>
  playAgain: () => Promise<void>
  onOtherGamesClick?: () => void
  players: RoomUser[]
  curPlayer: RoomUser
  roomStartContext?: RoomStartContext
  finished?: boolean
}

function PlayerMenu({
  quitRoom, players, curPlayer, finished, roomStartContext, playAgain, onOtherGamesClick,
}: PlayerMenuProps): React.ReactElement {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [playersModalOpen, setPlayersModalOpen] = useState(false);
  const spectating = players.every(({ id }) => id !== curPlayer.id);
  return (
    <ThemeProvider theme={Theme}>
      <Modal
        open={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ maxWidth: '400px' }}>
          <CardHeader
            title="UrTurn"
            subheader="Where you make and play games"
            action={(
              <IconButton
                href={DISCORD_URL}
                target="_blank"
              >
                <SiDiscord />
              </IconButton>
            )}
            sx={{ paddingBottom: 0.5 }}
          />
          <CardContent>
            <Typography variant="body2">
              UrTurn handles all the backend infrastructure for hosting and monetizing
              your game so you can make games just like this one.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button size="small" href={DOCS_URL} target="_blank">Start Building</Button>
          </CardActions>
        </Card>
      </Modal>
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
              <Card key={id} variant="outlined">
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
              target="_blank"
              rel="noopener"
              onClick={onOtherGamesClick}
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
          <Tooltip disableFocusListener placement="right" title="About">
            <IconButton
              size="small"
              sx={{ borderRadius: 1 }}
              onClick={() => {
                setAboutModalOpen(!aboutModalOpen);
              }}
            >
              <ConstructionIcon />
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
      {finished != null && roomStartContext != null && finished && (
        <PlayAgainMenu
          roomStartContext={roomStartContext}
          playAgain={playAgain}
          spectating={spectating}
        />
      )}
    </ThemeProvider>
  );
}

export default PlayerMenu;
