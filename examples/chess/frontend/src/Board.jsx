import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Chessboard } from 'react-chessboard';
import client from '@urturn/client';
import { Chess } from 'chess.js';
import { useSnackbar } from 'notistack';

const isPromotion = (clientChessGame, from, to) => clientChessGame.moves({ verbose: true })
  .filter((move) => move.from === from
                    && move.to === to
                    && move.flags.includes('p')).length > 0;

export default function Board({
  boardWidth,
  chessGame,
  boardOrientation,
}) {
  const [clientChessGame, setClientChessGame] = useState(chessGame);
  useEffect(() => {
    setClientChessGame(chessGame);
  }, [chessGame != null && chessGame.fen()]);

  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [moveFrom, setMoveFrom] = useState();
  const { enqueueSnackbar } = useSnackbar();

  const ownsPiece = (sourceSquare) => {
    const piece = clientChessGame.get(sourceSquare);
    if (piece === false) {
      return false;
    }
    return piece.color === 'w' ? boardOrientation === 'white' : boardOrientation === 'black';
  };

  const getMoveOptions = (square) => {
    if (!ownsPiece(square)) {
    // don't show move options for other color
      return;
    }
    const moves = clientChessGame.moves({
      square,
      verbose: true,
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          clientChessGame.get(move.to)
          && clientChessGame.get(move.to).color !== clientChessGame.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
  };

  const resetFirstMove = (square) => {
    setMoveFrom(square);
    getMoveOptions(square);
  };
  const onDrop = (sourceSquare, targetSquare) => {
    // client side validation to save time
    if (!ownsPiece(sourceSquare)) {
      return null;
    }
    resetFirstMove(undefined);

    const gameCopy = new Chess(clientChessGame.fen());
    const move = {
      from: sourceSquare,
      to: targetSquare,
    };
    if (isPromotion(clientChessGame, sourceSquare, targetSquare)) {
      move.promotion = 'q';
    }
    const result = gameCopy.move(move);
    if (result === null) return null;

    // update immediately client side as a form of client side prediction
    setClientChessGame(gameCopy);

    // If there was an error trying to make the move just display the error and reset the game
    client.makeMove(move).then(({ error }) => {
      if (error != null) {
        throw new Error(error.message);
      }
    }).catch((error) => {
      enqueueSnackbar(error.message, {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setClientChessGame(clientChessGame);
    });
    return true;
  };

  // Only set squares to {} if not already set to {}
  const onMouseOutSquare = () => {
    if (Object.keys(optionSquares).length !== 0) setOptionSquares({});
  };

  const onMouseOverSquare = (square) => {
    getMoveOptions(square);
  };

  const onSquareClick = (square) => {
    setRightClickedSquares({});

    // set piece we are about to move
    if (moveFrom == null) {
      if (!ownsPiece(square)) {
        resetFirstMove(undefined);
        return;
      }
      resetFirstMove(square);
      return;
    }

    onDrop(moveFrom, square);
  };

  const onSquareRightClick = (square) => {
    const color = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === color
          ? undefined
          : { backgroundColor: color },
    });
  };

  return (
    <Chessboard
      isDraggablePiece={({ sourceSquare }) => ownsPiece(sourceSquare)}
      boardOrientation={boardOrientation}
      animationDuration={200}
      boardWidth={boardWidth}
      position={clientChessGame.fen()}
      onMouseOverSquare={onMouseOverSquare}
      onMouseOutSquare={onMouseOutSquare}
      onSquareClick={onSquareClick}
      onSquareRightClick={onSquareRightClick}
      onPieceDrop={onDrop}
      customBoardStyle={{
        borderRadius: '4px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
      }}
      customSquareStyles={{
        ...optionSquares,
        ...rightClickedSquares,
      }}
    />
  );
}

Board.propTypes = {
  boardWidth: PropTypes.number.isRequired,
  chessGame: PropTypes.shape({
    fen: PropTypes.func.isRequired,
    get: PropTypes.func.isRequired,
  }).isRequired,
  boardOrientation: PropTypes.string.isRequired,
};
