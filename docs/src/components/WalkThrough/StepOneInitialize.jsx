import React from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import CodeBlock from '@theme/CodeBlock';
import useBaseUrl from '@docusaurus/useBaseUrl';
import BrowserView from '../BrowserView/BrowserView';

function StepOneInitialize() {
  return (
    <Stack m={2} spacing={1}>
      <Typography variant="body1">
        To create a game called
        <Box fontWeight="bold" component="span"> my-game</Box>
        , run:
      </Typography>
      <Box maxWidth="350px">
        <CodeBlock language="bash">
          npx @urturn/runner init my-game
        </CodeBlock>
      </Box>
      <Typography variant="body1">
        Start your game:
      </Typography>
      <Box width="100%" maxWidth="600px">
        <CodeBlock language="bash">
          {`cd my-game
npm run dev`}
        </CodeBlock>
      </Box>
      <Typography variant="body1">
        This will simulates you game and start the
        <Box color="var(--ifm-color-primary)" fontWeight="bold" component="span"> Runner </Box>
        on localhost
      </Typography>
      <BrowserView elevation={2} sx={{ maxWidth: '650px' }}>
        <img src={useBaseUrl('/img/runner-room-state.svg')} alt="gif of terminal initializing game" />
      </BrowserView>
    </Stack>
  );
}

export default StepOneInitialize;
