---
description: Create your first multiplayer game
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Multiplayer TicTacToe

## What you are making

Play it [here](https://www.urturn.app/games/626eac7c65667f00160a6b42).

:::success
Playing the game will help you envision what the underlying logic will look like. Ask yourself:

- How do you define what happens when a player moves?
- How can you tell if a player won the game?
:::

## Setup

Run to generate a simple tictactoe template:

```bash
npx @urturn/runner init --tutorial tictactoe first-game
cd first-game
```

The UI is provided for you. Your goal is to implement the underlying logic (i.e. [room functions](/docs/API/room-functions)) which determine the resulting state after any event (e.g. player move, joins, etc.).

### File/Folder structure

```bash
game
└───src # room logic goes here
│   │   main.js # room functions (e.g. onRoomStart, onPlayerMove, etc.)
│   
└───frontend # Tictactoe UI code lives here
|   │   ...frontend files
|   ...other files # not important for this tutorial
```

## Defining how state changes

:::success
With UrTurn, you only need to provide logic for how a single [room](/docs/Introduction/Concepts#room) behaves. UrTurn takes care of the rest.
:::

Start up the game and play around.

```bash
npm run dev
```

:::info
The [runner](/docs/API/runner) will immediately open a new window.

You will see a console that let's you easily debug/inspect the global state of your game.
:::

### Initializing state

We need to define what the initial state of the room looks like.

All state related to a room is held within the [RoomState](/docs/API/types#roomstate). We modify this object by returning the [RoomStateResult](/docs/API/types#roomstateresult).

:::success
Notice that you didn't have to worry about:

- How to communicate between two players
- How to manage room creation, matchmaking, and scaling

Just focus on your game logic! This will let you build better games and implement that faster.
[More info.](/docs#what-urturn-is)
:::

Your game state is held in the [RoomState](/docs/API/types#roomstate) object. You can tell UrTurn if your game is joinable and/or if it is finished. You can also define the "state" object that will define the way the board currently looks. For this tic-tac-toe game, the roomState state will look like this:

```json
{
  "players": "[]", // controlled by UrTurn
  "version": 0, // controlled by UrTurn
  "joinable": true,
  "finished": false,
  "state": {
    "board": "[
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]",
    "winner": null
  }
}
```

We will be manipulating the ```joinable```, ```finished```, and ```state``` properties of this object to control our game.

### Four Functions - That's It!

All of our game logic can be encompassed by the following four functions:

#### 1. onRoomStart

This [function](/docs/API/room-functions#onroomstart-required) will be called whenever a room is created. When the game starts, we want to initialize our empty roomState, which includes the following for tic-tac-toe:

1. The Board: A 3x3 square, initialized with null values.
2. The Winner: The winner's ID, if there is a winner. Initially null.

```js title="index.js"
function onRoomStart() {
  return {
    state: {
      board: [
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ],
      winner: null
    }
  };
}
```

#### 2. onPlayerJoin

This function will be called whenever a player actually joins the game. It provides us with the ID of the player who joined as well as the current [RoomState](/docs/API/types#roomstate).

If this is the first player to join, we will just return an empty object. If this is the second player to join, then the game has all the necessary players and should be marked as not joinable.

```js title="index.js"
function onPlayerJoin(plr, roomState) {
  const { players } = roomState;

  if (players.length === 2) {
    return { joinable: false };
  }
  return { };
}
```


#### 3. onPlayerMove

This function will be called whenever a player makes a move. It provides us with the ID of the player who made the move, the move object, and the current board game state. We can define the move object as any valid JSON object - for tic-tac-toe, it will be an object containing the x- and y-coordinates of the square they selected.

After the move is completed, if we determine the game is over and there is a winner, we will add the winner's ID to our state so it can be displayed on the frontend.

<Tabs>
<TabItem value="snippet" label="Snippet">

```js title="index.js"
function onPlayerMove(plr, move, roomState) {
  const { state, players } = roomState;
  const { board, plrToMoveIndex } = state;

  const { x, y } = move;

  const plrMark = getPlrMark(plr, players);

  board[x][y] = plrMark;

  const [isEnd, winner] = isEndGame(board, players);

  if (isEnd) {
    state.winner = winner;

    return { state, finished: true };
  }

  return { state };
}
```

</TabItem>
<TabItem value="full" label="Full Code">

```js title="index.js"
function getPlrMark(plr, plrs) {
  if (plr.id === plrs[0].id) { // for simplicity, the first player will be 'X'
    return 'X';
  }
  return 'O';
}

function isEndGame(board, plrs) {
  function getPlrFromMark(mark, plrs) {
    return mark === 'X' ? plrs[0] : plrs[1];
  }

  function isWinningSequence(arr) {
    return arr[0] !== null && arr[0] === arr[1] && arr[1] === arr[2];
  }

  // check rows and cols
  for (let i = 0; i < board.length; i += 1) {
    const row = board[i];
    const col = [board[0][i], board[1][i], board[2][i]];

    if (isWinningSequence(row)) {
      return [true, getPlrFromMark(row[0], plrs)];
    } if (isWinningSequence(col)) {
      return [true, getPlrFromMark(col[0], plrs)];
    }
  }

  // check diagonals
  const d1 = [board[0][0], board[1][1], board[2][2]];
  const d2 = [board[0][2], board[1][1], board[2][0]];
  if (isWinningSequence(d1)) {
    return [true, getPlrFromMark(d1[0], plrs)];
  } if (isWinningSequence(d2)) {
    return [true, getPlrFromMark(d2[0], plrs)];
  }

  // check for tie
  if (board.some((row) => row.some((mark) => mark === null))) {
    return [false, null];
  }
  return [true, null];
}

function onPlayerMove(plr, move, roomState) {
  const { state, players } = roomState;
  const { board, plrToMoveIndex } = state;

  const { x, y } = move;

  const plrMark = getPlrMark(plr, players);

  board[x][y] = plrMark;

  const [isEnd, winner] = isEndGame(board, players);

  if (isEnd) {
    state.winner = winner;
    return { state, finished: true };
  }
  return { state };
}
```

</TabItem>
</Tabs>

#### 4. onPlayerQuit

This [function](/docs/API/room-functions#onplayerquit-required) will be called whenever a player quits the game. It provides us with the player who quit and the current board game state.

For tic-tac-toe, the game will end if one of the players quits. The game will be marked as not joinable and finished, and the remaining player will be marked the winner.

```js title="index.js"
function onPlayerQuit(plr, roomState) {
  const { state, players } = roomState;

  if (players.length === 1) {
    const [winner] = players;
    state.winner = winner;
    return { state, joinable: false, finished: true };
  }
  return { joinable: false, finished: true };
}
```

