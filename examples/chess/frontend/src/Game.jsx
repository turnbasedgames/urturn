import React, { useEffect, useState, useRef } from 'react';
import {
  List, ListItem, ListItemText, Paper, Typography, Stack, ThemeProvider, useMediaQuery,
} from '@mui/material';
import { Chess } from 'chess.js';
import client from '@urturn/client';
import Board from './Board';
import theme from './theme';

const CHESS_WIDTH_PADDING_PX = 40;
const CHESS_WIDTH_DEFAULT_PX = 560;
const CHESS_WIDTH_MAX_MED_PX = 450;
const CHESS_WIDTH_MAX_PX = CHESS_WIDTH_DEFAULT_PX;

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

const getStatusMessage = ({
  curPlr, winner, finished, players, chessGame,
}) => {
  if (finished) {
    if (winner != null) {
      if (winner.id === curPlr.id) {
        return 'You Won!';
      }
      return 'You Lost.';
    }
    return 'Stalemate.';
  }
  if (players.length !== 2) {
    return 'Waiting for another player...';
  }
  return `${chessGame.turn() === 'w' ? 'White' : 'Black'} to move...`;
};

function Game() {
  const largerThanMd = useMediaQuery(theme.breakpoints.up('md'));

  const containerRef = useRef(null);
  const [chessBoardWidth, setChessBoardWidth] = useState(CHESS_WIDTH_DEFAULT_PX);
  useEffect(() => {
    const setChessBoardWidthWithContainerWidth = () => {
      const maxWidth = largerThanMd ? CHESS_WIDTH_MAX_PX : CHESS_WIDTH_MAX_MED_PX;
      setChessBoardWidth(Math.min(
        (containerRef?.current?.offsetWidth ?? CHESS_WIDTH_DEFAULT_PX)
        - (CHESS_WIDTH_PADDING_PX * 2),
        maxWidth,
      ));
    };
    window.addEventListener('resize', () => {
      setChessBoardWidthWithContainerWidth();
    });
    setChessBoardWidthWithContainerWidth();
  }, [containerRef.current, largerThanMd]);

  const [roomState, setRoomState] = useState(client.getRoomState() || {});
  const [chessGame, setChessGame] = useState(new Chess());
  const {
    players = [], state: { fen, plrIdToColor, winner } = {}, finished,
  } = roomState;
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
    <ThemeProvider theme={theme}>
      <Stack
        direction={{ sm: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="center"
        padding={2}
        ref={containerRef}
      >
        <Stack margin={1} spacing={2}>
          <Board
            boardWidth={chessBoardWidth}
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
          <Paper>
            <Stack padding={1}>
              <Typography>
                {getStatusMessage({
                  curPlr, winner, finished, players, chessGame,
                })}
              </Typography>
            </Stack>
          </Paper>
        </Stack>
        <Paper>
          <Stack padding={1} sx={{ minWidth: '100px' }}>
            <Typography color="text.primary">Players</Typography>
            <List dense disablePadding padding={0}>
              {players.map((player, ind) => (
                <ListItem dense disablePadding key={player.id}>
                  <ListItemText primary={`${ind + 1}: ${player.username} (${plrIdToColor[player.id]})`} />
                </ListItem>
              ))}
            </List>
          </Stack>
        </Paper>
      </Stack>
    </ThemeProvider>
  );
}

export default Game;
