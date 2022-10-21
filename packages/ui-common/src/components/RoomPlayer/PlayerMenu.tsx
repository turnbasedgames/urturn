import React, { useState } from 'react';
import {
  IconButton, Paper, Stack, Modal, Card, Typography, CardContent, CardActions, Button, CardHeader,
} from '@mui/material';
import { SiDiscord } from 'react-icons/si';
import { ThemeProvider } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { TbLetterU } from 'react-icons/tb';
import { DISCORD_URL, DOCS_URL } from '@urturn/types-common';
import logger from '../../logger';
import Theme from '../Theme';

interface PlayerMenuProps {
  quitRoom: () => Promise<void>
}

function PlayerMenu({ quitRoom }: PlayerMenuProps): React.ReactElement {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
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
          <IconButton
            size="small"
            sx={{ borderRadius: 1 }}
            onClick={() => {
              setAboutModalOpen(!aboutModalOpen);
            }}
          >
            <TbLetterU />
          </IconButton>
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
        </Stack>
      </Paper>
    </ThemeProvider>
  );
}

export default PlayerMenu;
