---
title: Client
description: Simple client to leverage all of UrTurn infrastructure
---

# @UrTurn/client

[![npm version](https://badge.fury.io/js/@urturn%2Fclient.svg)](https://badge.fury.io/js/@urturn%2Fclient)

## Fields

### `client.events` [**EventEmitter**](https://nodejs.org/api/events.html#class-eventemitter)

#### `client.events.on('onStateChanged', (newRoomState: RoomState) => {})`

- Calls the callback anytime the current [RoomState](/docs/API/types#roomstate) changes for the room

## Methods

### `client.makeMove(move: Move)`

- [Move](/docs/API/types#move) is any JSON serializable object
- returns [`Promise<MoveResult>`](#moveresult) if the move is accepted

### `client.getLocalPlayer()`

- returns the local player object

:::info

You can tell if the local player is a spectator or a regular player if they are not in the players list. This will help you display a different view if the game is in spectator mode.

:::

### `client.getRoomState()`

- returns the current [`RoomState`](/docs/API/types#roomstate)

### `client.now()`

- returns the milliseconds from epoch (equivalent to `Date.now()`)

:::success
`client.now()` is clocked synced with our servers. You **should** rely on this for timing mechanisms over the built in `Date.now()` because the local user clock can be off by seconds or even minutes!
:::

## Types

### MoveResult

- `error`
  - `Error` object if an error occurred
  - `undefined` if no error ocurred
- `success`
  - `true` if successful (no error ocurred)
  - `undefined` if an error occurred

Example:

```json
// successful move
{
  "success": true
}
// error occurred
{
  "error": {
    "name": "invalid move",
    "message": "player billy made an invalid move, it wasn't their turn
  }
}
```
