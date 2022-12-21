import React, { useRef, useState } from 'react';
import Chess from 'chess.js';
import PropTypes from 'prop-types';
import { Chessboard } from 'react-chessboard';

export default function Board({ boardWidth }) {
  const chessboardRef = useRef();
  const [game, setGame] = useState(new Chess());

  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  const onDrop = (sourceSquare, targetSquare) => {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q', // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    // illegal move
    if (move === null) return false;
    setMoveSquares({
      [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
    });
    return true;
  };

  // Only set squares to {} if not already set to {}
  const onMouseOutSquare = () => {
    if (Object.keys(optionSquares).length !== 0) setOptionSquares({});
  };

  const getMoveOptions = (square) => {
    const moves = game.moves({
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
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
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

  const onMouseOverSquare = (square) => {
    getMoveOptions(square);
  };

  const onSquareClick = () => {
    setRightClickedSquares({});
  };

  const onSquareRightClick = (square) => {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    });
  };

  return (
    <Chessboard
      id="SquareStyles"
      arePremovesAllowed
      animationDuration={200}
      boardWidth={boardWidth}
      position={game.fen()}
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
        ...moveSquares,
        ...optionSquares,
        ...rightClickedSquares,
      }}
      ref={chessboardRef}
    />
  );
}

Board.propTypes = {
  boardWidth: PropTypes.number.isRequired,
};
