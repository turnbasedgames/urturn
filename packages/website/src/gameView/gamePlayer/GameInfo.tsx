/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import {
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';
import {
  Image,
  Row,
  Col,
  Button,
  ListGroup,
} from 'react-bootstrap';
import { Game, getGame } from '../../models/game';
import {
  createRoom, getRooms, joinRoom, Room, userInRoom,
} from '../../models/room';
import { UserContext } from '../../models/user';
import classes from './GameInfo.module.css';

type GameURLParams = {
  gameId: string
};

const GameInfo = () => {
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
    return (
      <Row className={classes.gameContainer}>
        <Col xs={6}>
          <Row style={{ justifyContent: 'flex-end' }}>
            <Image
              className={classes.gameImg}
              src="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
            />
          </Row>
          <Row className={classes.createButton}>
            <Button
              onClick={async (ev) => {
                ev.preventDefault();
                const room = await createRoom(game.id);
                history.push(`${location.pathname}/room/${room.id}`);
              }}
            >
              + Create Room
            </Button>
          </Row>
        </Col>
        <Col xs={6}>
          <Row style={{ display: 'inline' }}>
            <h1>
              <a href={game.githubURL}><i className="fab fa-github" /></a>
              {' '}
              {game.name}
            </h1>
            <p>{game.description}</p>
          </Row>
          <Row>
            <div style={{ paddingLeft: '15px' }}>
              <h4>Active Rooms:</h4>
              <UserContext.Consumer>
                {({ user }) => (
                  <ListGroup className={classes.roomsList}>
                    {rooms.map((room: Room) => {
                      const listContent = `Join Room: ${room.id.substr(room.id.length - 5)}`;
                      return (
                        <ListGroup.Item
                          key={room.id}
                          action
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
                          <div className={classes.roomUser}>
                            <i className="fas fa-user" />
                            {` ${room.leader.id}`}
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </UserContext.Consumer>
            </div>
          </Row>
        </Col>
      </Row>
    );
  }
  return (
    <div>
      <h1>Loading...</h1>
    </div>
  );
};

export default GameInfo;
