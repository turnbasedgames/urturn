import React from 'react';
import PropTypes from 'prop-types';
import {
  Typography, Stack, Paper, TableContainer, Table, TableRow, TableHead, TableCell, TableBody,
  LinearProgress,
} from '@mui/material';
import { Buffer } from 'buffer';
import { getGuessesData, getClosenessMessage } from '../utils';

const getBestGuess = (plrId, plrToGuessToInfo) => {
  const { sortedGuesses } = getGuessesData(plrToGuessToInfo[plrId]);
  if (sortedGuesses.length > 0) {
    return sortedGuesses[0];
  }
  return undefined;
};
function EndGame({
  winner, players, plrToSecretHash, plrToGuessToInfo,
}) {
  const rows = players.map(({ id, username }) => ({
    id,
    username,
    secret: plrToSecretHash[id] != null ? Buffer.from(plrToSecretHash[id], 'base64').toString('ascii') : 'N/A',
    totalGuesses: Object.keys(plrToGuessToInfo[id]).length,
    winner: winner?.id === id,
    bestGuessInfo: getBestGuess(id, plrToGuessToInfo),
  }));
  return (
    <Stack spacing={2} alignItems="center">
      <Typography variants="h5" color="secondary">We keep secrets from each other but they somehow find a way to be revealed...</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="End game stats">
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell align="right">Secret</TableCell>
              <TableCell align="right">Total Guesses</TableCell>
              <TableCell align="right">Highest Similarity</TableCell>
              <TableCell align="right">Closest Guess</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.username + (row.winner ? ' (winner)' : '')}
                </TableCell>
                <TableCell align="right">
                  <Typography color="text.secondary" variant="body">
                    {row.secret}
                  </Typography>
                </TableCell>
                <TableCell align="right">{row.totalGuesses}</TableCell>
                <TableCell align="right">{row.bestGuessInfo?.similarity.toFixed(3) ?? 'N/A'}</TableCell>
                <TableCell align="right">
                  {row.bestGuessInfo != null ? `${row.bestGuessInfo.guess} - ` : 'N/A'}
                  {row.bestGuessInfo != null && getClosenessMessage(row.bestGuessInfo.index)}
                  {row.bestGuessInfo != null && row.bestGuessInfo.index >= 0
                 && <LinearProgress variant="determinate" value={row.bestGuessInfo.index} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}

EndGame.propTypes = {
  players: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
  })).isRequired,
  plrToSecretHash: PropTypes.objectOf(PropTypes.string).isRequired,
  plrToGuessToInfo: PropTypes.objectOf(PropTypes.objectOf(PropTypes.shape({
    lastUpdateTime: PropTypes.string,
    count: PropTypes.number,
  }))).isRequired,
  winner: PropTypes.shape({ id: PropTypes.string, username: PropTypes.string }).isRequired,
};

export default EndGame;
