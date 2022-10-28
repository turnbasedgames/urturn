import React from 'react';
import {
  Paper, TableContainer, Table, TableRow, TableHead, TableCell, TableBody, LinearProgress,
} from '@mui/material';
import PropTypes from 'prop-types';

function GuessesTable({ dense, guessesData }) {
  const { latestGuess, sortedGuesses } = guessesData;
  return (
    <TableContainer component={Paper} sx={{ marginTop: 1, flexGrow: 1 }}>
      <Table stickyHeader sx={{ minWidth: dense ? 100 : { xs: 100, sm: 400 } }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell align="right">Guess</TableCell>
            <TableCell align="right">Similarity</TableCell>
            <TableCell align="right">Getting Close?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(latestGuess != null) && (sortedGuesses?.length > 1) && (
          <TableRow
            key="latest-guess"
          >
            <TableCell scope="row" sx={{ marginButton: 1 }}>
              ( latest )
            </TableCell>
            <TableCell align="right" sx={{ color: '#CE93D8' }}>{latestGuess.guess}</TableCell>
            <TableCell align="right">
              {latestGuess.similarity.toFixed(3)}
            </TableCell>
            <TableCell align="right">{latestGuess.message}</TableCell>
          </TableRow>
          )}
          {sortedGuesses.map(({
            guess, similarity, message, topPosition, hint,
          }, ind) => (
            <TableRow
              key={guess}
              sx={{ '& td': { border: 0 } }}
            >
              <TableCell scope="row">
                {`${ind}${hint ? ' (hint)' : ''}`}
              </TableCell>
              <TableCell align="right">{guess}</TableCell>
              <TableCell align="right">{similarity.toFixed(3)}</TableCell>
              <TableCell align="right">
                {message}
                <LinearProgress variant="determinate" value={topPosition} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const guessShape = PropTypes.shape({
  guess: PropTypes.string,
  similarity: PropTypes.number,
  message: PropTypes.string,
  topPosition: PropTypes.number,
});
GuessesTable.propTypes = {
  guessesData: PropTypes.shape({
    latestGuess: guessShape,
    sortedGuesses: PropTypes.arrayOf(guessShape),
  }).isRequired,
  dense: PropTypes.bool,
};

GuessesTable.defaultProps = {
  dense: false,
};

export default GuessesTable;
