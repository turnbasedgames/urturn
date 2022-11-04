---
description: Understanding the backend API
---

# Backend

The `backend` for all games is compromised of functions exported by the **index.js** file.

## Functions

### All Functions Are Pure Functions

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

### All Functions Are ACID Transactions

1. `Atomic`: either all updates returned are fully completed or completely fail. This is important for handling operations like player purchases; you don’t want a player to be charged Urbux and fail to give them their desired item. This prevents data corruption of your roomState.
2. `Consistent`: your functions will never be given partial data or corrupt data; they will always get the latest roomState for the room.
3. `Isolated`: you are guaranteed that operations on a roomState for a given room are handled one by one. No two operations can corrupt each other.
4. `Durable`: successful roomState operations are guaranteed to survive system failure. Even if UrTurn goes down, or has partial outages, your data for each room should survive.

### `onRoomStart` **Required**

```ts
onRoomStart = () => RoomStateResult
```

- Use this function to initialize your board game state.
- Runs when the room is first initialized, as triggered by these actions:
  1. When a private room is created (player clicks *Create Private Room*).
  2. When a room is created for the matchmaking queue (player clicks *Play*).
- Operation fails on error (when user clicks play or attempts start a game, it will show them an error and will not start the game). This should never error, but the operation is not forced because it may start your game in a corrupt state.
- `Returns` the [RoomStateResult](#roomstateresult).

### `onPlayerJoin` **Required**

```ts
onPlayerJoin = (player: Player, roomState: RoomState) => RoomStateResult
```

- Runs when a player joins the room, including when the room is created (i.e. the player clicks *Play* or *Create Private Room*).
- Operation fails on error (when user clicks play and joins a game, it will show them an error snackbar). This should never error, but the operation is not forced.
- If `roomState.joinable` or `roomState.finished` is `true` then it is **guaranteed** that no player will be added to the room and `onPlayerJoin` will never be called for a player.
- `Returns` the [RoomStateResult](#roomstateresult).

### `onPlayerQuit` **Required**

```ts
onPlayerQuit = (player: Player, roomState: RoomState) => RoomStateResult
```

- Runs when a player quits the game.
- A player can quit the game by manually clicking the ***quit*** button.
- Only players in the room, can quit the room (e.g. we can't call `onPlayerQuit` with a player not known to the room).
- `Returns` the [RoomStateResult](#roomstateresult).

:::caution

`onPlayerQuit` is **forced**. Even if an error occurs in your code, we will force our own logic to be executed (e.g. removing `player` from the `roomState.players` list).

This may put the `roomState` for the room in a corrupt state depending on your code, so you should avoid erroring in this function.

:::

### `onPlayerMove` **Required**

```ts
onPlayerMove = (player: Player, move: Move, roomState: RoomState) => RoomStateResult
```

- Runs when a player moves (i.e. when `client.makeMove()` is called with the [`move`](#move) JSON object).
- Operation fails on error. The client triggering this will receive your error as a return value.
- `Returns` the [RoomStateResult](#roomstateresult).

:::info

If a player is trying to do something impossible/against game rules, then it is **recommended** to throw an error, so you can handle it in the game frontend.

:::

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
