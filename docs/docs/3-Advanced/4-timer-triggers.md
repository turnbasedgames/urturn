---
description: it's ur turn, but ur taking too long to move!
---

# Server-Side Move Timers

Here are several use cases we support:

1. Asynchronously trigger a timeout event and modify the [roomState](/docs/API/types#roomstate)
2. Cancel an existing timer trigger while handling a move

:::caution
Potential Limitations:

1. You can only have 1 active timer at a time.
2. Time guarantees for timers are on the order of seconds, with a minimum relative due date of 5 seconds

It is recommended that if you want to do chess style timers, you will have to update the timer as each player moves, and continue to track time when player moves.
:::

:::caution

This work is planned. Join [discord](https://discord.gg/myWacjdb5S) to provide more details on your use case.

:::
