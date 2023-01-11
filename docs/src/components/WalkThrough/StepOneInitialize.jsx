import React from 'react';
import {
  Stack, Typography, Box,
} from '@mui/material';
import CodeBlock from '@theme/CodeBlock';

function StepOneInitialize() {
  return (
    <Stack height="100%" justifyContent="center" m={2} spacing={1}>
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
    </Stack>
  );
}

export default StepOneInitialize;
