import React, {
  useEffect, useState, useRef, createRef,
} from 'react';
import {
  Box, Typography, Stack, ThemeProvider, useMediaQuery,
  IconButton, Slide,
} from '@mui/material';
import { Chess } from 'chess.js';
import client from '@urturn/client';
import { SnackbarProvider } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import Board from './Board';
import theme from './theme';
// TODO: should display last move
const CHESS_WIDTH_PADDING_PX = 0;
const CHESS_WIDTH_DEFAULT_PX = 560;
const CHESS_WIDTH_MAX_MED_PX = 450;
const CHESS_WIDTH_MAX_PX = CHESS_WIDTH_DEFAULT_PX;

const getOtherPlayer = (players, curPlr) => players.find(({ id }) => id !== curPlr.id);

function CloseSnackBarButton(snackbarProviderRef) {
  return function SnackBarButton(key) {
    return (
      <IconButton onClick={() => {
        if (snackbarProviderRef?.current != null) {
          snackbarProviderRef.current.closeSnackbar(key);
        }
      }}
      >
        <CloseIcon />
      </IconButton>
    );
  };
}
const getBoardOrientation = (curPlr, plrIdToColor) => {
  if (curPlr == null || plrIdToColor?.[curPlr.id] == null) {
    return 'white';
  }
  return plrIdToColor[curPlr.id];
};

const getStatusMessage = ({
  curPlr, winner, finished, players,
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
  return '';
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
  console.log('roomState:', roomState);

  // load current player, which is initially null
  useEffect(() => {
    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      setCurPlr(newCurPlr);
    };
    setupCurPlr();
  }, []);
  const snackbarProviderRef = createRef();

  const boardOrientation = getBoardOrientation(curPlr, plrIdToColor);
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        ref={snackbarProviderRef}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        TransitionComponent={Slide}
        action={CloseSnackBarButton(snackbarProviderRef)}
        maxSnack={3}
      >
        <Stack
          height="100%"
          direction={{ sm: 'column', md: 'row' }}
          alignItems="center"
          justifyContent="center"
          ref={containerRef}
        >
          <Stack spacing={1}>
            <Typography textAlign="center" color="text.primary">
              {getStatusMessage({
                curPlr, winner, finished, players, chessGame,
              })}
            </Typography>
            <Typography color="text.primary">
              {players.length >= 1 && curPlr != null ? getOtherPlayer(players, curPlr)?.username : ''}
            </Typography>
            <Box>
              <Board
                boardWidth={chessBoardWidth}
                boardOrientation={boardOrientation}
                chessGame={chessGame}
              />
            </Box>
            <Typography color="text.primary">{curPlr?.username}</Typography>
          </Stack>
        </Stack>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default Game;
