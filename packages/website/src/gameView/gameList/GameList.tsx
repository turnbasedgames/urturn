import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Col,
  Row,
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Game, getGames } from '../../models/game';
import classes from './GameList.module.css';

const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  useEffect(() => {
    async function setupGames() {
      const gamesRaw = await getGames();
      setGames(gamesRaw);
    }
    setupGames();
  }, []);
  const history = useHistory();

  return (
    <div className={classes.root}>
      <Container style={{ marginTop: '100px' }}>
        <Row style={{ paddingBottom: '70px' }}>
          <Col xs={6} md={4} lg={3}>
            <Card
              onClick={(ev: React.ChangeEvent<any>) => {
                ev.preventDefault();
                history.push('/create');
              }}
              className={classes.card}
              style={{ backgroundColor: 'transparent', border: 'none' }}
            >
              <div className={classes.createButton}>
                +
              </div>
            </Card>
          </Col>
          {games.map((game) => (
            <Col xs={6} md={4} lg={3}>
              <Card
                onClick={() => history.push(`/games/${game.id}`)}
                key={game.id}
                className={classes.card}
                style={{ backgroundColor: 'transparent', border: 'none' }}
              >
                <div className={classes.imgContainer}>
                  <Card.Img
                    style={{ borderRadius: '10%' }}
                    className={classes.cardImg}
                    src="https://images.unsplash.com/photo-1570989614585-581ee5f7e165?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=334&q=80"
                    alt={game.name}
                  />
                </div>
                <Card.Body>
                  <Card.Title>{game.name}</Card.Title>
                  <Card.Text>
                    {`by: ${game.creator.id}`}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default GameList;
