import {
  Button, Card, CardActions, CardHeader, Box,
  CircularProgress, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Game } from '@urturn/types-common';
import { logEvent } from 'firebase/analytics';
import { Helmet } from 'react-helmet';
import { analytics } from '../../firebase/setupFirebase';
import { getGames } from '../../models/game';
import { queueUpRoom, queueUpPrivateRoom } from '../../models/room';
import GameCardActions from '../../creatorView/GameCardActions';
import { UserContext } from '../../models/user';
import CardMediaWithFallback from '../gameCard/CardMediaWithFallback';
import ActiveUsersOverlay from '../gameCard/ActiveUsersOverlay';
import logger from '../../logger';
import GameStats from './GameStats';

function GameInfo(): React.ReactElement {
  const { customURL } = useParams();
  const [game, setGame] = useState<null | Game>(null);
  const [loadingPrivateRoom, setloadingPrivateRoom] = useState<boolean>(false);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(false);
  const navigate = useNavigate();
  const gameLoading = game == null;
  const { enqueueSnackbar } = useSnackbar();

  async function setupGame(): Promise<void> {
    if (customURL == null) { return; }
    const games = await getGames({ customURL });
    setGame(games[0]);
  }
  useEffect(() => {
    setupGame().catch(logger.error);
  }, [customURL]);

  async function onPlay(): Promise<void> {
    if (game == null) {
      throw new Error("game is null and probably still loading, can't play game");
    }
    setLoadingRoom(true);
    const room = await queueUpRoom({ game: game.id });
    setLoadingRoom(false);
    navigate(`/rooms/${room.id}`);
  }

  async function onPrivatePlay(): Promise<void> {
    if (game == null) {
      throw new Error("game is null and probably still loading, can't play game");
    }
    setloadingPrivateRoom(true);
    const room = await queueUpPrivateRoom(game.id);
    setloadingPrivateRoom(false);
    navigate(`/rooms/${room.id}`);
    try {
      await navigator.clipboard.writeText(window.location.href);
      enqueueSnackbar('Copied URL To Clipboard!', {
        variant: 'success',
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar('Share browser link with other players.', {
        variant: 'info',
        autoHideDuration: 3000,
      });
    }
  }
  return (
    <>
      <LinearProgress sx={{
        position: 'relative',
        visibility: gameLoading ? 'visible' : 'hidden',
      }}
      />
      <Stack
        direction="column"
        spacing={2}
        sx={{
          marginLeft: 'auto',
          marginRight: 'auto',
          width: '80%',
          maxWidth: '900px',
        }}
      >
        <Paper
          sx={{
            marginTop: 1,
            padding: 1,
          }}
        >
          {!gameLoading && (
            <Helmet>
              <title>{game.name}</title>
              <meta name="description" content={game.description} />
            </Helmet>
          )}
          {!gameLoading && (
            <Card
              sx={{
                boxShadow: 0,
                width: '100%',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                position: 'relative',
              }}
            >
              {
                game.activePlayerCount !== 0
                && (
                <ActiveUsersOverlay
                  activePlayerCount={game.activePlayerCount}
                  placement="top-left"
                />
                )
              }
              <CardMediaWithFallback
                sx={{ width: { xs: '100%', sm: '300px', md: '400px' }, aspectRatio: '1/1', flexShrink: 0 }}
                game={game}
              />
              <Stack sx={{ overflow: 'hidden' }} flexGrow="1" direction="column" justifyContent="space-between">
                <CardHeader
                  sx={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    flexGrow: 1,
                    overflow: 'hidden',
                    // allow underlying typography components to handle text overflow with noWrap
                    // https://stackoverflow.com/questions/61675880/react-material-ui-cardheader-title-overflow-with-dots/70321025#70321025
                    '& .MuiCardHeader-content': {
                      overflow: 'hidden',
                    },
                  }}
                  title={game.name}
                  titleTypographyProps={{ noWrap: true }}
                  subheader={`by ${game.creator.username}`}
                  subheaderTypographyProps={{ noWrap: true }}
                  action={(
                    <GameCardActions
                      game={game}
                      onUpdate={() => { setupGame().catch(logger.error); }}
                      onDelete={() => navigate('/develop')}
                    />
                  )}
                />
                <CardActions>
                  <UserContext.Consumer>
                    {({ user }) => (
                      (user != null)
                      && (
                        <Stack width="100%" spacing={1} padding={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            disabled={loadingRoom}
                            onClick={(ev) => {
                              ev.preventDefault();
                              onPlay().catch((error) => {
                                setLoadingRoom(false);
                                enqueueSnackbar('Failed to start game: Contact Developers.', {
                                  variant: 'error',
                                  autoHideDuration: 3000,
                                });
                                logger.error(error);
                              });
                              logEvent(analytics, 'play_button_click', {
                                private_room: true,
                                game_id: game.id ?? '(empty)',
                                game_name: game.name ?? '(empty)',
                              });
                            }}
                          >
                            {loadingRoom ? <CircularProgress size={24} /> : 'Play'}
                          </Button>
                          <Button
                            fullWidth
                            variant="text"
                            disabled={loadingRoom}
                            onClick={(ev) => {
                              ev.preventDefault();
                              onPrivatePlay().catch((error) => {
                                setloadingPrivateRoom(false);
                                enqueueSnackbar('Failed to start private game: Contact Developers.', {
                                  variant: 'error',
                                  autoHideDuration: 3000,
                                });
                                logger.error(error);
                              });
                              logEvent(analytics, 'play_button_click', {
                                private_room: true,
                                game_id: game.id ?? '(empty)',
                                game_name: game.name ?? '(empty)',
                              });
                            }}
                          >
                            {loadingPrivateRoom ? <CircularProgress size={24} /> : 'Create Private Room'}
                          </Button>
                        </Stack>
                      )
                    )}
                  </UserContext.Consumer>
                </CardActions>
              </Stack>
            </Card>
          )}
        </Paper>
        {!gameLoading && (
        <Paper sx={{ padding: 1 }}>
          <Stack spacing={2}>
            <GameStats game={game} />
            <Box>
              <Typography variant="body1" fontWeight="bold">
                Description
              </Typography>
              <Typography
                sx={{
                  whiteSpace: 'pre-wrap', // display multiline text
                }}
                gutterBottom
                variant="body1"
              >
                {game?.description}
              </Typography>
            </Box>
          </Stack>
        </Paper>
        )}
      </Stack>
    </>
  );
}

export default GameInfo;
