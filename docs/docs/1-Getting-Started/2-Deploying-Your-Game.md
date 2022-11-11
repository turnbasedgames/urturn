---
description: Deploy your game to UrTurn.app
---

# Deploying your game

## Manual Deployment

1. Go to UrTurn Dev [Console](https://www.urturn.app/develop).
2. Click `create game` or `edit` an existing game
3. Fill in the required fields
4. Provide the commit SHA that you want to deploy
5. Click `Create` or `Update`

## Continuous Deployment

:::caution

Not supported yet. Join the early release wa`it list on [discord](https://discord.gg/myWacjdb5S), so we can notify you when we add support.

:::

## Build Artifact Spec

The `commit` that is deployed in production needs to have the format:

```bash
game
│   index.js # rollup should transpile all of you javascript files and dependencies into this file
|   thumbnail.png # not required, but if not provided UrTurn will display a stock image for your game
|
└───frontend/build
│   │  # all the built html, css, javascript files go here
```

Here is an example for [TicTacToe](https://github.com/turnbasedgames/urturn/tree/published-tictactoe).

:::success

This is easily achieved using [GitHub Actions](https://docs.github.com/en/actions). Steps in [getting started](/docs/Getting-Started/runner-init) should automatically generate the correct actions for you.

:::
