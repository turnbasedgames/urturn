import React, { useEffect, useState } from 'react';
import {
  useParams,
} from 'react-router-dom';

import IFrame from './IFrame/IFrame';
import {
  getRoom, getRoomUsers, Room,
} from '../../models/room';
import { User } from '../../models/user';
import classes from './RoomPlayer.module.css';

type RoomURLParams = {
  roomId: string
};

const RoomPlayer = () => {
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
      <div className={classes.container}>
        <h3>{room.game.name}</h3>
        <h5 style={{ color: 'white' }}>{`Room: ${room.id}`}</h5>
        <IFrame githubURL={room.game.githubURL} commitSHA={room.game.commitSHA} />
        <h5 style={{ color: 'white' }}>
          {`${users.length} Users in Room`}
        </h5>
        {users.map((user: User) => (
          <p
            key={user.id}
          >
            {`User-${user.id}`}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

export default RoomPlayer;
