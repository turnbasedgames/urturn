import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import client from '@urturn/client';
import styles from './Game.module.css';

const isPromotion = (chessGame, from, to) => chessGame.moves({ verbose: true })
  .filter((move) => move.from === from
                    && move.to === to
                    && move.flags.includes('p')).length > 0;

const getBoardOrientation = (curPlr, plrIdToColor) => {
  if (curPlr == null || plrIdToColor?.[curPlr.id] == null) {
    return 'white';
  }
  return plrIdToColor[curPlr.id];
};

function Game() {
  const [roomState, setRoomState] = useState(client.getRoomState() || {});
  const [chessGame, setChessGame] = useState(new Chess());
  const { state: { fen, plrIdToColor } = {} } = roomState;
  console.log('roomState:', roomState);

  useEffect(() => {
    if (fen != null) {
      setChessGame(new Chess(fen));
    }
  }, [fen]);

  // setup event listener for updating roomState when client fires
  useEffect(() => {
    const onStateChanged = (newBoardGame) => {
      setRoomState(newBoardGame);
    };
    client.events.on('stateChanged', onStateChanged);
    return () => {
      client.events.off('stateChanged', onStateChanged);
    };
  }, []);

  const [curPlr, setCurPlr] = useState();
  console.log('curPlr:', curPlr);

  // load current player, which is initially null
  useEffect(() => {
    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      setCurPlr(newCurPlr);
    };
    setupCurPlr();
  }, []);

  const boardOrientation = getBoardOrientation(curPlr, plrIdToColor);
  console.log(boardOrientation);
  return (
    <div className={styles.container}>
      <Chessboard
        boardOrientation={boardOrientation}
        position={chessGame.fen()}
        onPieceDrop={(sourceSquare, targetSquare) => {
          const chessGameCopy = new Chess(chessGame.fen());
          const move = {
            from: sourceSquare,
            to: targetSquare,
          };
          if (isPromotion(chessGameCopy, sourceSquare, targetSquare)) {
            move.promotion = 'q';
          }
          const result = chessGameCopy.move(move);
          setChessGame(chessGameCopy);
          if (result != null) {
            client.makeMove(move);
          }
          return result; // null if the move was illegal, the move object if the move was legal
        }}
        id="BasicBoard"
      />
    </div>
  );
}

export default Game;
