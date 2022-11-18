---
description: Create your first multiplayer game
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Multiplayer TicTacToe

## What you are making

:::success
Play the [final version](https://www.urturn.app/games/626eac7c65667f00160a6b42). Playing the game will help you envision what the underlying logic will look like. Ask yourself:

- How do you define what happens when a player moves?
- How can you tell if a player won the game?
:::

## Setup

Run to generate a simple tictactoe template:

```bash
npx @urturn/runner init --tutorial first-game # answer prompts
cd first-game
```

The UI is provided for you. Your goal is to implement the underlying logic ([room functions](/docs/API/room-functions)) which determine the resulting state after any event (e.g. player move, joins, etc.).

### File/Folder structure

```bash
game
└───src # room logic goes here
│   │   main.js # room functions (e.g. onRoomStart, onPlayerMove, etc.)
|   |   util.js # helper functions
│   
└───frontend # Tictactoe UI code lives here
|   │   ...frontend files
|   ...other files # not important for this tutorial
```

:::info
There are several `// TODO:` statements scattered across `src/main.js` and `src/util.js` to help guide you.
:::

## Defining how state changes

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


### What's Next?

:::success
Notice that you didn't have to worry about:

- How to communicate between two players
- How to manage room creation, matchmaking, and scaling

Just focus on your game logic! This will let you build better games and implement that faster.
[More info.](/docs#what-urturn-is)
:::
