---
description: Understanding the backend API
---

# Backend

The `backend` for all games is compromised of functions exported by the **index.js** file.

## Functions

### Pure Functions

All functions are `pure`:

1. the function return values are identical for identical arguments.
2. the function has no side effects within the function itself.

:::caution

Avoid modifying any variables scoped outside of the function, as there is **no guarantee** those modifications will last within the same room and may affect other rooms.

:::

Using **global constants is fine**, or loading in constants from an external file.

:::caution

Common mistake is to forget returning the [`roomStateResult`](#roomstateresult). Make sure you are returning any resulting state, otherwise the changes will not be applied!

:::

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


## Types

### RoomState

`RoomState` object is provided to each operation, and will have the fields:

- `roomState.joinable`: *bool*
  - **default**: `true`
  - If true, new users will be able to join this game instance.
  - If false, new users can not join this game instance via a private room or matchmaking.
- `roomState.finished`: *bool*
  - **default**: `false`.
  - If true, no new operations will be handled for the room (e.g. no new players can join, players can't make moves anymore, etc.). Marking a room finished is important for UrTurn to index each room properly.
  - If false, the game will show in the "Active Games" list for players.
- `roomState.state`: *JSON object*
  - **default**: `{}`
  - Can hold any valid JSON object, and is designed for you to put any data you want to make your game logic possible.
  - If you try to store non JSON serializable values like `functions`, they will be parsed out.
  - Max size is `15mb`.
- `roomState.players`: [*Player[]*](#player), **read-only**
  - **default**: `[]`
  - UrTurn manages this field and will add a player object to the list before calling `onPlayerJoin` and removes the player object from the list before calling `onPlayerQuit`.
  - sorted in the order players joined the room (earliest player first with later players further in the array).
- `roomState.version`: *int*, **read-only**
  - **default**: 0
  - UrTurn manages this field and increments the `version` by 1 every time there is a room operation applied to it.

### RoomStateResult

`RoomStateResult` object is returned by every exported function. All fields are optional (omitting a field will make no edits to the current value). This object can have all the non `read-only` fields as the [`RoomState`](#roomstate).

### Player

- `player.id`: *string*
  - **unique** identification string for the player.
  - no two players will have the same `id`.
  - player's cannot ever change their `id`.
- `player.username`: *string*
  - **unique** amongst any player at a point in time.
  - player may change their `username`.

```json
{ // example
  "id": "90123018123dsf",
  "username": "billy"
}
```

### Move

Any `JSON` serializable object.

Example:

```json
{
  "y": 1,
  "nested": {"field": "hello world"}
  // ... any other field
}
```
