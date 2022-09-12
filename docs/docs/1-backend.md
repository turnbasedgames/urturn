---
title: Understanding the Backend
---

## Overview

The "backend" for all games is compromised of four functions found in the highest level **index.js** file. Currently, for this file to work you cannot import any outside functions - all of your code must be in this file.

## Objects

### BoardGame

```ts
{
  joinable: boolean,
  finished: boolean,
  players: Player[],
  version: number,
  state: {}
}
```

A JSON object provided to you that contains information about the current board game state.

#### joinable: *boolean*

Initially true. 

If true, new users will be able to join this game instance. If false, new users can not join this game instance via a private room or matchmaking.

#### finished: *boolean*

Initially false. 

If true, no new changes can be made to the board game state, no new players can join, and the game instance will show in the "Played Games" list. If false, the game will show in the "Active Games" list for players.

#### players: *Player[]*

Initially empty.

A list of the [player objects](#player) in the game in the order the players joined. Will update as players join and leave the game instance. 

#### version: *int*

Initially 0.

The current version of the board game state. Incremented with every change. Is used to keep all players in sync with the current board game state.

#### state: *JSON object*

Initially empty, can be modified to any configuration.

Can hold any valid JSON object and is only used internally in your game logic.

### BoardGameResult

```ts
{
  joinable: boolean,
  finished: boolean,
  state: {}
}
```

A JSON object that your functions can return - contains the aspects of the BoardGame that have been modified. Will be used to update your [BoardGame](#boardgame) object.

### Player

```ts
{
  id: string,
  username: string
}
```

An object representing a single player.

## Functions

### onRoomStart

```ts
onRoomStart = () => BoardGameResult
```

Runs when the room is first initialized, as triggered by these actions:
1. When a private room is created (player clicks *Create Private Room*)
2. When a room is created for the matchmaking queue (player clicks *Play*)

Returns the [BoardGameResult](#boardgameresult). Use this function to initialize your board game state.

### onPlayerJoin

```ts
onPlayerJoin = (player: Player, boardGame: object) => BoardGameResult
```

Runs when a player joins the room, including when the room is created (i.e. the player clicks *Play* or *Create Private Room*). Reveals the player who joined and the current [BoardGame](#boardgame) state. Returns the [BoardGameResult](#boardgameresult).

### onPlayerQuit

```ts
onPlayerQuit = (player: Player, boardGame: object) => BoardGameResult
```

Runs when a player quits the game. A player **only** quits the game by manually clicking the ***quit*** button - closing the browser or tab will not end the game session. Reveals the player who quit and the current [BoardGame](#boardgame) state. Returns the [BoardGameResult](#boardgameresult).

### onPlayerMove

```ts
onPlayerMove = (player: Player, move: object, boardGame: object) => BoardGameResult
```

Runs when a player moves (i.e. when ```client.makeMove()``` is called). Reveals the player that made the move, the object containing the move, and the current [BoardGame](#boardgame) state. The move object is defined by you and can be any JSON object. Returns the [BoardGameResult](#boardgameresult).
