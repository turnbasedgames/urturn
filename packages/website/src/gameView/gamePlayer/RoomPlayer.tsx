import React, { useEffect, useState } from 'react';
import {
  Theme, withStyles, createStyles, Typography, List, ListItem,
} from '@material-ui/core';
import {
  useParams,
} from 'react-router-dom';

import IFrame from './IFrame/IFrame';
import {
  getRoom, getRoomUsers, Room,
} from '../../models/room';
import { User } from '../../models/user';

type Props = {
  classes: any
};

type RoomURLParams = {
  roomId: string
};

const RoomPlayer = ({ classes }: Props) => {
  const { roomId } = useParams<RoomURLParams>();
  const [room, setRoom] = useState<null | Room>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function setupRoom() {
      const roomRaw = await getRoom(roomId);
      setRoom(roomRaw);
    }
    async function setupUsers() {
      const usersRaw = await getRoomUsers(roomId);
      setUsers(usersRaw);
    }

    setupRoom();
    setupUsers();
  }, []);

  if (room) {
    return (
      <div className={classes.root}>
        <Typography variant="h4">{`Room: ${room.id}`}</Typography>
        <IFrame githubURL={room.game.githubURL} commitSHA={room.game.commitSHA} />
        <List>
          <Typography variant="h4">
            {`${users.length} Users in Room`}
          </Typography>
          {users.map((user: User) => (
            <ListItem
              key={user.id}
            >
              {`User-${user.id}`}
            </ListItem>
          ))}
        </List>
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

export default withStyles(styles)(RoomPlayer);
