# Concepts

## RoomState

All room states follow a structure like this:

```json

{
  "joinable": true, // boolean
  "finished": true, // boolean
  "state": {}, // any JSON object that you define
  "version": 0, // number
  "players": [], // array of player objects
}

```

All [`Room`](#room) operations modify or use the [`roomState`](/docs/API/backend#roomstate) to create a new [`roomState`](/docs/API/backend#roomstate).

## Room

- Rooms are instances of games.
- Rooms will have an associated RoomState to track the current state of the room.
- Players create new rooms whenever they click play on your game. UrTurn will automatically place players together in a room if it is public.
- `private` rooms are created by players when they click `create private room`, and are usually played with people they already know. You can handle private rooms differently than public rooms; for example, you might want to let the player who created the private room determine the settings of the room.
- If a user accidentally closes their browser, they may reopen it to view the room again (exception: see [disconnectTimeout](/docs/Introduction/Concepts#automatic-disconnect-handling))

## Game

Each game can have a thumbnail, title, description, and specific code related to it that is run whenever a room is created.

## Automatic Disconnect Handling

- When a user is disconnected from a `public` room, the user will be automatically kicked from the room with `onPlayerQuit` after `30 seconds`.
- This does not apply to `private` rooms! Meaning, even if a player disconnects from a private room indefinitely, they will not be forced out of it.
