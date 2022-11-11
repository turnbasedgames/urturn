import { useState, useEffect } from 'react'
import client from '@urturn/client'

function Game() {
  const [roomState, setRoomState] = useState(client.getRoomState() || {});
  console.log("roomState:", roomState)

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
  console.log("curPlr:", curPlr)

  // load current player, which is initially null
  useEffect(() => {
    const setupCurPlr = async () => {
      const newCurPlr = await client.getLocalPlayer();
      setCurPlr(newCurPlr);
    };
    setupCurPlr();
  }, []);

  return (
    <div>
      <h1 color="white">TODO: Implement your game UI here!</h1>
      <p color="white">Current Plr: {curPlr?.username}</p>
    </div>
  );
}

export default Game;
