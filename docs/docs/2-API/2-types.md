---
description: objects that are used by the client and room functions
---

# Types

Objects that are used by the [client](/docs/API/client) and [room functions](/docs/API/room-functions)

## RoomState

`RoomState` object is provided to each [room function](/docs/API/room-functions), and will have the fields:

- `roomState.joinable`: *bool*
  - **default**: `true`
  - If true, new users will be able to join this game instance.
  - If false, new users can not join this game instance via a private room or matchmaking.
- `roomState.finished`: *bool*
  - **default**: `false`.
  - If true, no new functions will be called for the room (e.g. no new players can join, players can't make moves anymore, etc.). Marking a room finished is important for UrTurn to index each room properly.
  - If false, the game will show in the "Active Games" list for players.
- `roomState.state`: *JSON object*
  - **default**: `{}`
  - Can hold any valid JSON object, and is designed for you to put any data you want to make your game logic possible.
  - If you try to store non JSON serializable values like `functions`, they will be parsed out.
  - Max size is `15mb`.
- `roomState.players`: [*Player[]*](#player), **read-only**
  - **default**: `[]`
  - UrTurn manages this field and will add a player object to the list before calling `onPlayerJoin` and removes the player object from the list before calling `onPlayerQuit`.
  - Sorted in the order players joined the room (earliest player first with later players further in the array).
- `roomState.version`: *int*, **read-only**
  - **default**: 0
  - UrTurn manages this field and increments the `version` by 1 every time a function successfully modifies it.
- `roomState.roomStartContext`: [*RoomStartContext*](#roomstartcontext), **read-only**
  - **default**: {}
  - Provides crucial information on context of how this room was created
  - For example, private rooms will set `roomState.roomStartContext.private = true`.
- `roomState.logger`: [*RoomLogger*](#roomlogger), **read-only**, **room functions only**
  - Logger object used to log out metadata or message.
  - This helps us correlate logs in the same function call.

## RoomStartContext

`RoomStartContext` is an object that is defined by how the player created the room. This is useful whenever you want your game to behave differently depending on how the room started.

- `RoomStartContext.private` **bool**
  - `true` if the room is private (other players will not be able to access the room without the link)
  - `false` if the room is public. This means players can queue up and join this room.

```js
// Example 1. Default (User clicks `Play`)
roomState.roomStartContext = { private: false }

// Example 2. Private Rooms (User clicks `Create Private Room`)
roomState.roomStartContext = { private: true }
```

:::caution

It is not possible to have custom `RoomStartContext`. We are still brainstorming on a good solution for this.

Please join our [discord](https://discord.gg/myWacjdb5S) to tell us about your use case.

:::

## RoomLogger

`RoomLogger` is an object to be used to log any metadata or message

- `RoomLogger.info` *(...args) => void*
  - Logs at the `info` level
- `RoomLogger.warn` *(...args) => void*
  - Logs at the `warn` level
- `RoomLogger.error` *(...args) => void*
  - Logs at the `error` level

:::caution

Viewing production logs is not supported yet. Provide details on your use case at our [discord](https://discord.gg/myWacjdb5S).

:::

## RoomStateResult

`RoomStateResult` object is returned by every exported function. All fields are optional (omitting a field will make no edits to the current value). This object can have all the non `read-only` fields as the [`RoomState`](#roomstate).

## Player

- `player.id`: *string*
  - **Unique** identification string for the player.
  - No two players will have the same `id`.
  - Player's cannot ever change their `id`.
- `player.username`: *string*
  - **Unique** amongst any player at a point in time.
  - Player may change their `username`.

```json
{ // example
  "id": "90123018123dsf",
  "username": "billy"
}
```

## Move

Any `JSON` serializable object.

Example:

```json
{
  "y": 1,
  "nested": {"field": "hello world"}
  // ... any other field
}
```
