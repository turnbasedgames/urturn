import React, { useEffect, useState } from 'react';
import {
  Theme, withStyles, createStyles, Typography, List, Button, ListItem,
} from '@material-ui/core';
import {
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { Game, getGame } from '../../models/game';
import {
  createRoom, getRooms, joinRoom, Room, userInRoom,
} from '../../models/room';
import { UserContext } from '../../models/user';

type Props = {
  classes: any
};

type GameURLParams = {
  gameId: string
};

const GameInfo = ({ classes }: Props) => {
  const { gameId } = useParams<GameURLParams>();
  const [game, setGame] = useState<null | Game>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    async function setupGame() {
      const gameRaw = await getGame(gameId);
      setGame(gameRaw);
    }
    async function setupRooms() {
      const roomsRaw = await getRooms(gameId);
      setRooms(roomsRaw);
    }
    setupGame();
    setupRooms();
  }, []);

  if (game) {
    const gitHubInfo = `GitHub Info: ${game.githubURL} ${game.commitSHA}`;
    return (
      <div className={classes.root}>
        <Typography variant="h3">
          {game.name}
        </Typography>
        <Typography variant="body1">{game.description}</Typography>
        <Typography variant="body1">{gitHubInfo}</Typography>
        <div>
          <Button
            variant="contained"
            disableElevation
            className={classes.button}
            onClick={async (ev) => {
              ev.preventDefault();
              const room = await createRoom(game.id);
              history.push(`${location.pathname}/room/${room.id}`);
            }}
          >
            Create Room
          </Button>
          <UserContext.Consumer>
            {({ user }) => (
              <List>
                <Typography variant="h4">
                  {`${rooms.length} Active Rooms`}
                </Typography>
                {rooms.map((room: Room) => {
                  const listContent = `Join Room: ${room.id.substr(room.id.length - 5)}`;
                  return (
                    <ListItem
                      key={room.id}
                      button
                      onClick={async (ev) => {
                        if (!user) return;
                        ev.preventDefault();
                        const roomJoined = await userInRoom(room.id, user.id);
                        if (!roomJoined) {
                          await joinRoom(room.id);
                        }
                        history.push(`${location.pathname}/room/${room.id}`);
                      }}
                    >
                      {listContent}
                    </ListItem>
                  );
                })}
              </List>
            )}
          </UserContext.Consumer>
        </div>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <h1>Loading...</h1>
    </div>
  );
};

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: theme.palette.background.paper,
    margin: '0 auto 0 auto',
  },
  button: {
    margin: '5px',
  },
});

export default withStyles(styles)(GameInfo);
