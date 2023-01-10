import React, { useState } from 'react';
import {
  Stack, Typography, Box, Card,
} from '@mui/material';
import TerminalIcon from '@mui/icons-material/Terminal';
import SpeedIcon from '@mui/icons-material/Speed';
import CodeIcon from '@mui/icons-material/Code';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import StepCard from './StepCard';
import StepOneInitialize from './StepOneInitialize';

const stepsConfig = [
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
    contentElement:
    (
      <StepOneInitialize />
    ),
  },
  {
    title: '2. Iterate with the Runner',
    body: 'Run your game locally, and manage the JSON-based room state',
    docsLink: '/docs/API/runner',
    iconComponent: SpeedIcon,
    contentElement:
    (
      <Stack>
        TODO: THis
      </Stack>
    ),
  },
  {
    title: '3. Programming Room Functions',
    body: 'Define the logic for a single instance of your room. UrTurn handles the rest!',
    docsLink: '/docs/API/room-functions',
    iconComponent: CodeIcon,
    contentElement:
    (
      <Stack>
        TODO: THis
      </Stack>
    ),
  },
  {
    title: '4. Deploy your game in seconds',
    body: 'Now your game can be shared and played with anyone',
    docsLink: '/docs/Getting-Started/deploying-your-game',
    iconComponent: DynamicFormIcon,
    contentElement:
    (
      <Stack>
        TODO: THis
      </Stack>
    ),
  },
];

export default function WalkThrough() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { contentElement } = stepsConfig[selectedIndex];
  return (
    <Stack backgroundColor="var(--ifm-color-emphasis-100)" direction="row" padding={4} spacing={2} justifyContent="center">
      <Stack spacing={2} margin={2} maxWidth="550px">
        <Typography color="var(--ifm-color-primary)" variant="subtitle" fontWeight="bold">
          How It Works
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          Supercharged development flow
          <Box color="var(--ifm-color-primary)">every step of the way</Box>
        </Typography>
        <Typography variant="body1">
          Build at an accelerated pace while still using your preferred
          IDE (e.g. VSCode), and NPM packages
        </Typography>
        {stepsConfig.map(({
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
      <Card variant="outlined" sx={{ backgroundColor: 'var(--ifm-color-emphasis-200)', flexGrow: 1, maxWidth: '800px' }}>
        {contentElement}
      </Card>
    </Stack>
  );
}
