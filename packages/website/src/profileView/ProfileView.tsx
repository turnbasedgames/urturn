import {
  Button, Card, CardActionArea, CardHeader, LinearProgress, Paper, Stack, Tab, Tabs,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useHistory } from 'react-router-dom';

import { useSnackbar } from 'notistack';
import { auth } from '../firebase/setupFirebase';
import { User } from '../models/user';
import withUser from '../withUser';
import { getRooms, quitRoom, Room } from '../models/room';

interface Props {
  user: User
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

enum ProfileTab {
  Active = 0,
  Inactive,
}

const capitalizeUsername = (username: string): string => {
  let newUsername = username[0].toLocaleUpperCase();
  for (let index = 1; index < username.length; index += 1) {
    const curChar = username[index];
    if (username[index - 1] === '_') {
      newUsername += curChar.toLocaleUpperCase();
    } else {
      newUsername += curChar;
    }
  }
  return newUsername;
};

function ProfileView({ user, setUser }: Props): React.ReactElement {
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const [activeTab, setActiveTab] = React.useState(0);
  const handleChange = (event: any, newValue: number): void => {
    setActiveTab(newValue);
  };

  const [activeRooms, setActiveRooms] = useState<Room[] | null>(null);
  const [inactiveRooms, setInactiveRooms] = useState<Room[] | null>(null);
  const displayedRooms = activeTab === ProfileTab.Active ? activeRooms : inactiveRooms;
  const displayedRoomsLoading = displayedRooms == null;
  const setupActiveRooms = async (): Promise<void> => {
    const roomsRaw = await getRooms({ containsPlayer: user.id });
    setActiveRooms(roomsRaw);
  };
  const setupInactiveRooms = async (): Promise<void> => {
    const roomsRaw = await getRooms({ containsInactivePlayer: user.id });
    setInactiveRooms(roomsRaw);
  };
  useEffect(() => {
    Promise.all([setupActiveRooms(), setupInactiveRooms()]).catch(console.error);
  }, []);

  const onRoomQuit = async (room: Room): Promise<void> => {
    try {
      await quitRoom(room.id);
    } catch (err) {
      enqueueSnackbar('Error when trying to quit room', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }
    await Promise.all([setupActiveRooms(), setupInactiveRooms()]);
  };

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
            // TODO: handle updating username
            title={capitalizeUsername(user.username)}
            subheader={`id: ${user.id}`}
            action={(
              <Button
                onClick={() => {
                  setUser(null);
                  signOut(auth).catch(console.error);
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
              label={`${(inactiveRooms != null) ? inactiveRooms.length : ''} Played Game${(inactiveRooms != null) && inactiveRooms.length === 1 ? '' : 's'}`}
            />
          </Tabs>
          <LinearProgress sx={{
            position: 'relative',
            visibility: displayedRoomsLoading ? 'visible' : 'hidden',
          }}
          />
          <Stack>
            {!displayedRoomsLoading && displayedRooms
              // The game may not exist. We should not display the room.
              .filter((room) => room.game)
              .map((room) => (
                <Card key={room.id} sx={{ display: 'flex' }} color="">
                  <CardActionArea onClick={() => {
                    // TODO: Handling rejoins (say a player leaves to prevent from causing a loss)
                    // - support a reconnect and disconnect event
                    // - reconnect happens when a player connects a session to the original game
                    // - disconnect happens when no session a player is connected is in the game
                    // (e.g. multiple tabs should only trigger it once)

                    // when game is hard deleted, we show a snackbar error because players can't
                    // play a game that has been deleted
                    if (room.game != null) {
                      history.push(`/games/${room.game.id}/room/${room.id}`);
                    } else {
                      enqueueSnackbar('This game was deleted', {
                        variant: 'error',
                        autoHideDuration: 3000,
                      });
                    }
                  }}
                  >
                    <CardHeader
                      title={(room.game != null) ? room.game.name : '[Deleted Game]'}
                      subheader={room.id}
                      action={((activeTab === ProfileTab.Active) && (
                        <Button
                          onClick={(event) => {
                            event.stopPropagation();
                            onRoomQuit(room).catch(console.error);
                          }}
                          color="error"
                          variant="text"
                          onMouseDown={(event) => event.stopPropagation()}
                        >
                          Quit
                        </Button>
                      ))}
                    />
                  </CardActionArea>
                </Card>
              ))}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
}

export default withUser(ProfileView, { redirectOnAnonymous: true });
