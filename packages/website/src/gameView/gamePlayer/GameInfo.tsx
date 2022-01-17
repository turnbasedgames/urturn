import {
  Button, Card, CardActions, CardHeader, CardMedia,
  CircularProgress,
  LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { Game, getGame } from '../../models/game';
import { joinOrCreateRoom } from '../../models/room';
import GameCardActions from '../../creatorView/GameCardActions';
import { UserContext } from '../../models/user';

type GameURLParams = {
  gameId: string
};

const GameInfo = () => {
  const { gameId } = useParams<GameURLParams>();
  const [game, setGame] = useState<null | Game>(null);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(false);
  const location = useLocation();
  const history = useHistory();
  const gameLoading = !game;

  async function setupGame() {
    const gameRaw = await getGame(gameId);
    setGame(gameRaw);
  }

  useEffect(() => {
    setupGame();
  }, []);

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
          <Card sx={{
            width: '100%',
            display: 'flex',
          }}
          >
            <CardMedia
              sx={{ width: '60%', aspectRatio: '1920/1080', flexShrink: 0 }}
              component="img"
              image="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
              alt={game.name}
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
                subheader={`by ${game.creator.id}`}
                subheaderTypographyProps={{ noWrap: true }}
                action={(
                  <GameCardActions
                    game={game}
                    onUpdate={() => setupGame()}
                    onDelete={() => history.push('/develop')}
                  />
                )}
              />
              <CardActions>
                <UserContext.Consumer>
                  {({ user }) => (
                    user
                    && (
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={loadingRoom}
                      onClick={async (ev) => {
                        ev.preventDefault();
                        try {
                          setLoadingRoom(true);
                          const room = await joinOrCreateRoom(game.id, user.id);
                          setLoadingRoom(false);
                          history.push(`${location.pathname}/room/${room.id}`);
                        } catch (error) {
                          setLoadingRoom(false);
                        }
                      }}
                    >
                      {loadingRoom ? <CircularProgress size={24} /> : 'Play'}
                    </Button>
                    )
                  )}
                </UserContext.Consumer>
              </CardActions>
            </Stack>
          </Card>
          )}
        </Paper>
        <Paper sx={{ padding: 1 }}>
          <Typography gutterBottom variant="h6">Description</Typography>
          <Typography gutterBottom variant="body2">{game && game.description}</Typography>
        </Paper>
      </Stack>
    </>
  );
};

export default GameInfo;
