import React, { useEffect, useState } from 'react';
import {
  Stack, Paper, Typography, ToggleButton, Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import PropTypes from 'prop-types';
import LoadingButton from '@mui/lab/LoadingButton';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import client from '@urturn/client';

const MAX_HINT_INDEX = 70;
const MAX_STALE_HINT_REJECTION_MS = 10000;

function InGameMenu({
  secret, curPlr, otherPlr, plrToHintRequest, plrToRejectHintResponse, hintIndex, setRecentErrorMsg,
}) {
  const curPlrRequestedHint = plrToHintRequest[curPlr.id];
  const otherPlrRequestedHint = plrToHintRequest[otherPlr.id];
  const plrRejectedHintAt = plrToRejectHintResponse[otherPlr.id];
  useEffect(() => {
    // only show player rejected request for hint notification if the last rejection is not stale
    if (plrRejectedHintAt != null) {
      const timeMs = new Date(plrRejectedHintAt).getTime();
      const diffMs = Date.now() - timeMs;
      if (diffMs <= MAX_STALE_HINT_REJECTION_MS) {
        setRecentErrorMsg('player rejected your request for hint!');
      }
    }
  }, [plrRejectedHintAt]);

  const [secretRevealed, setSecretRevealed] = useState(false);
  return (
    <Paper>
      <Stack direction="row" margin={1} spacing={1} alignItems="center">
        <LoadingButton
          onClick={async () => {
            if (hintIndex >= MAX_HINT_INDEX) {
              setRecentErrorMsg('No more hints left.');
            } else {
              const { error } = await client.makeMove({ hintRequest: true });
              if (error != null) {
                setRecentErrorMsg(error.message ?? 'Unknown error occurred!');
              }
            }
          }}
          loading={curPlrRequestedHint}
          variant="outlined"
          loadingPosition="end"
          endIcon={<QuestionMarkIcon />}
        >
          {curPlrRequestedHint ? 'Hint request sent' : 'Hint'}
        </LoadingButton>
        <ToggleButton
          size="small"
          value="check"
          selected={secretRevealed}
          onChange={() => {
            setSecretRevealed(!secretRevealed);
          }}
        >
          {secretRevealed ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </ToggleButton>
        {secretRevealed && <Typography color="text.disabled" align="center">{secret}</Typography>}
      </Stack>
      {otherPlrRequestedHint
        && (
        <Stack direction="row" margin={1} spacing={1} alignItems="center">
          <Typography>Accept Hint Request? </Typography>
          <Button
            onClick={async () => {
              const { error } = await client.makeMove({ acceptHint: true });
              if (error != null) {
                setRecentErrorMsg(error.message ?? 'Unknown error occurred!');
              }
            }}
            variant="outlined"
          >
            <CheckIcon />
          </Button>
          <Button
            onClick={async () => {
              const { error } = await client.makeMove({ acceptHint: false });
              if (error != null) {
                setRecentErrorMsg(error.message ?? 'Unknown error occurred!');
              }
            }}
            variant="outlined"
            color="error"
          >
            <ClearIcon />
          </Button>
        </Stack>
        )}
      {curPlrRequestedHint
        && (
        <Stack direction="row" margin={1} spacing={1} alignItems="center">
          <Button
            onClick={async () => {
              const { error } = await client.makeMove({ hintRequest: false });
              if (error != null) {
                setRecentErrorMsg(error.message ?? 'Unknown error occurred!');
              }
            }}
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
          >
            Cancel Hint Request
          </Button>
        </Stack>
        )}
    </Paper>
  );
}

InGameMenu.propTypes = {
  setRecentErrorMsg: PropTypes.func.isRequired,
  curPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  otherPlr: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
  plrToHintRequest: PropTypes.objectOf(PropTypes.bool).isRequired,
  plrToRejectHintResponse: PropTypes.objectOf(PropTypes.string).isRequired,
  hintIndex: PropTypes.number.isRequired,
  secret: PropTypes.string.isRequired,
};

export default InGameMenu;
