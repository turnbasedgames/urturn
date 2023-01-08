---
description: it's ur turn, but ur taking too long to move!
---

# Server-Side Move Timers

:::caution
This is an experimental feature! To use, you will need to use a special `@urturn/runner` version:
```bash
npm i -S @urturn/runner@0.6.0-test.0
```
:::

Here are several use cases we support:

1. Asynchronously trigger a timeout event and modify the [roomState](/docs/API/types#roomstate)
2. Cancel an existing timeout trigger while handling a move

## New `onTimeout` function

This get's called any time a timeout is triggered:

### Example: ending game when round timeout is triggered

```js
function onTimeout(roomState) {
  const { state } = roomState;
  state.status = 'end';
  return { state, finished: true };
}
```

## How to tell UrTurn when to trigger `onTimeout`

New roomState field `roomState.triggerTimeoutAt` which is an ISO-8601 string. UrTurn runner will call `onTimeout` exactly when the clock hits that `triggerTimeoutAt`.

### Example: configure UrTurn to call `onTimeout` 5 minutes after last player joins

```js
function onPlayerJoin(player, roomState) {
  if (roomState.players.length === 2) {
    const roundLengthMs = 300 * 1000; // 5 minutes => 300 seconds => 300000 milliseconds
    const triggerTimeoutAt = new Date(Date.now() + roundLengthMs).toISOString();
    return {
      triggerTimeoutAt // set new triggerTimeoutAt to handle match being finished
    };
  }
  // don't do anything without enough players
  return {}
}
```

### Example: Cancel the triggerTimeoutAt

Let's say a player already made their move in time. You no longer need the timeout.

```js
function onPlayerMove(player, move, roomState) { 
  // ... insert code here for handling the move

  // set the triggerTimeoutAt to null because player made their move on time!
  return { state, triggerTimeoutAt: null }
}
```

## Display Time Left on the Client

Use `client.now()` for the server synced time. You can save the match start time in `roomState.state` and do a simple diff to get the time left: `client.now() - roomState.state.routeStartDate`
