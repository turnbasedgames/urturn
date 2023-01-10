import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import CodeBlock from '@theme/CodeBlock';
import RunnerSvg from '../Hero/runner-init.svg';

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
        Choose a frontend framework or start with vanilla HTML5:
      </Typography>
      <Box width="100%" maxWidth="600px">
        <RunnerSvg />
      </Box>
    </Stack>
  );
}

export default StepOneInitialize;
