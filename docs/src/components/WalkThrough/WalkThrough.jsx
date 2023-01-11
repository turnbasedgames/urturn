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
import StepTwoIterate from './StepTwoIterate';
import StepThreeFunctions from './StepThreeFunctions';
import StepFourDeploy from './StepFourDeploy';

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
      <StepTwoIterate />
    ),
  },
  {
    title: '3. Programming Room Functions',
    body: 'Define the logic for a single instance of your room. UrTurn handles the rest!',
    docsLink: '/docs/API/room-functions',
    iconComponent: CodeIcon,
    contentElement:
    (
      <StepThreeFunctions />
    ),
  },
  {
    title: '4. Deploy your game in seconds',
    body: 'Now your game can be shared and played with anyone',
    docsLink: '/docs/Getting-Started/deploying-your-game',
    iconComponent: DynamicFormIcon,
    contentElement:
    (
      <StepFourDeploy />
    ),
  },
];

export default function WalkThrough() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { contentElement } = stepsConfig[selectedIndex];
  return (
    <Stack
      backgroundColor="var(--ifm-color-emphasis-100)"
      direction={{ sm: 'column', md: 'row' }}
      padding={4}
      spacing={2}
      justifyContent="center"
    >
      <Stack
        spacing={2}
        margin={{ xs: 0, sm: 0, md: 2 }}
        maxWidth={{ sm: undefined, md: '380px' }}
      >
        <Typography color="var(--ifm-color-primary)" variant="subtitle" fontWeight="bold">
          How It Works
        </Typography>
        <Typography variant="h4" fontWeight="bold">
          Supercharged development flow
          <Box color="var(--ifm-color-primary)" component="span"> every step of the way</Box>
        </Typography>
        <Typography variant="body1">
          Build at an accelerated pace while still using your preferred
          IDE (e.g. VSCode), and NPM packages
        </Typography>
        <Stack
          direction={{ xs: 'row', sm: 'row', md: 'column' }}
          overflow="auto"
          sx={{
            paddingBottom: 1,
            gap: 1,
            scrollbarWidth: 'thin',
          }}
        >
          {stepsConfig.map(({
            title, body, docsLink, iconComponent,
          }, index) => (
            <StepCard
              sx={{ minWidth: '230px' }}
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
      <Card sx={{ flexGrow: 1, maxWidth: '700px' }}>
        {contentElement}
      </Card>
    </Stack>
  );
}
