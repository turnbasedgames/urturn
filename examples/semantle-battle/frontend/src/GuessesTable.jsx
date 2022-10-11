import React from 'react';
import {
  Paper, TableContainer, Table, TableRow, TableHead, TableCell, TableBody,
} from '@mui/material';
import PropTypes from 'prop-types';

function GuessesTable({ dense, guessesData }) {
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
          {guessesData.map(({ guess, similarity, closenessMsg }, ind) => (
            <TableRow
              key={guess}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {ind}
              </TableCell>
              <TableCell align="right">{guess}</TableCell>
              <TableCell align="right">{similarity}</TableCell>
              <TableCell align="right">{closenessMsg}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

GuessesTable.propTypes = {
  guessesData: PropTypes.arrayOf(PropTypes.shape({
    guess: PropTypes.string,
    similarity: PropTypes.number,
    closenessMsg: PropTypes.string,
  })).isRequired,
  dense: PropTypes.bool,
};

GuessesTable.defaultProps = {
  dense: false,
};

export default GuessesTable;
