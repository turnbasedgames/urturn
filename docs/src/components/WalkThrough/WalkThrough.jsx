import React, { useState } from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import StepCard from './StepCard';

const Steps = [
  {
    title: '1. Initialize Template Game',
    body:
    (
      <>
        Generate a game with
        <Box fontWeight="bold" component="span"> one </Box>
        command
      </>
    ),
    docsLink: '/docs/Getting-Started/runner-init',
    iconComponent: TerminalIcon,
  },
  {
    title: '2. Iterate with the Runner',
    body: 'Run your game locally, and manage the JSON based room state',
    docsLink: '/docs/API/runner',
    iconComponent: SpeedIcon,
  },
  {
    title: '3. Programming Room Functions',
    body: 'Define the logic for a single instance of your room. UrTurn handles the rest!',
    docsLink: '/docs/API/room-functions',
    iconComponent: CodeIcon,
  },
  {
    title: '4. Deploy your game in seconds',
    body: 'Now your game can be shared and played with anyone',
    docsLink: '/docs/Getting-Started/deploying-your-game',
    iconComponent: DynamicFormIcon,
  },
];

export default function WalkThrough() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  return (
    <Stack backgroundColor="var(--ifm-color-emphasis-100)" direction="row" padding={4} justifyContent="space-around">
      <Stack spacing={2} margin={2} maxWidth="550px">
        <Typography color="var(--ifm-color-primary)" variant="subtitle" fontWeight="bold">
          How It Works
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          Supercharged development flow
          <Box color="var(--ifm-color-primary)">every step of the way</Box>
        </Typography>
        <Typography variant="body1">
          Build at an accelerated pace while still using your favorite
          IDE (e.g. VSCode), and NPM packages
        </Typography>
        {Steps.map(({
          title, body, docsLink, iconComponent,
        }, index) => (
          <StepCard
            key={title}
            Icon={iconComponent}
            title={title}
            body={body}
            docsLink={docsLink}
            selected={selectedIndex === index}
            onClick={() => { setSelectedIndex(index); }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
