/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button, Card, CardActionArea, CardHeader, LinearProgress, Paper, Stack, Tab, Tabs,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import { useHistory } from 'react-router-dom';

import { User } from '../models/user';
import withUser from '../withUser';
import { getRooms, quitRoom, Room } from '../models/room';

type Props = {
  user: User,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
};

enum ProfileTab {
  Active = 0,
  Inactive,
}

const ProfileView = ({ user, setUser }: Props) => {
  const history = useHistory();

  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: any, newValue: number) => {
    setActiveTab(newValue);
  };

  const [activeRooms, setActiveRooms] = useState<Room[] | null>(null);
  const [inactiveRooms, setInactiveRooms] = useState<Room[] | null>(null);
  const displayedRooms = activeTab === ProfileTab.Active ? activeRooms : inactiveRooms;
  const displayedRoomsLoading = !displayedRooms;
  const setupActiveRooms = async () => {
    const roomsRaw = await getRooms({ containsPlayer: user.id });
    setActiveRooms(roomsRaw);
  };
  const setupInactiveRooms = async () => {
    const roomsRaw = await getRooms({ containsInactivePlayer: user.id });
    setInactiveRooms(roomsRaw);
  };
  useEffect(() => {
    setupActiveRooms();
    setupInactiveRooms();
  }, []);

  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      justifyContent="center"
    >
      <Stack
        direction="column"
        spacing={1}
        m={2}
        justifyContent="flex-start"
        minWidth="600px"
        maxWidth="800px"
      >
        <Card>
          <CardHeader
            title={`UserId: ${user.id}`}
            action={(
              <Button
                onClick={() => {
                  setUser(null);
                  firebase.auth().signOut();
                  history.push('/');
                }}
                variant="outlined"
                color="error"
              >
                Sign Out
              </Button>
              )}
          />
        </Card>
        <Paper>
          <Tabs value={activeTab} onChange={handleChange} variant="fullWidth">
            <Tab label="Active Games" />
            <Tab
              label={`${inactiveRooms ? inactiveRooms.length : ''} Played Game${inactiveRooms && inactiveRooms.length === 1 ? '' : 's'}`}
            />
          </Tabs>
          <LinearProgress sx={{
            position: 'relative',
            visibility: displayedRoomsLoading ? 'visible' : 'hidden',
          }}
          />
          <Stack>
            {!displayedRoomsLoading && displayedRooms.map((room) => (
              <Card key={room.id} sx={{ display: 'flex' }} color="">
                <CardActionArea onClick={() => {
                  // TODO: Handling rejoins (say a player leaves to prevent from causing a loss)
                  // - support a reconnect and disconnect event
                  // - reconnect happens when a player connects a session to the original game
                  // - disconnect happens when no session a player is connected is in the game
                  // (e.g. multiple tabs should only trigger it once)
                  history.push(`/games/${room.game.id}/room/${room.id}`);
                }}
                >
                  <CardHeader
                    title={room.game.name}
                    subheader={room.id}
                    action={((activeTab === ProfileTab.Active) && (
                      <Button
                        onClick={async (event) => {
                          event.stopPropagation();
                          await quitRoom(room.id);
                          setupActiveRooms();
                          setupInactiveRooms();
                        }}
                        color="error"
                        variant="text"
                        onMouseDown={(event) => event.stopPropagation()}
                      >
                        Quit
                      </Button>
                    )
                    )}
                  />
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default withUser(ProfileView, { redirectOnAnonymous: true });
