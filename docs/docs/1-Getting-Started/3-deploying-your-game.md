---
description: Deploy your game to UrTurn.app
---

# Deploying your game

## Manual Deployment

1. Go to UrTurn Dev [Console](https://www.urturn.app/develop).
2. Click `create game` or `edit` an existing game
3. Fill in the required fields
4. Provide the commit SHA that you want to deploy. Usually you can get the commit SHA with this command, which gets the latest commit for your `published` branch.

```bash
# In the directory of your game repository
$ git log -n 1 --pretty=format:"%H" origin/published
9cf2a6c11accb1d49d1b488985eb1df37c753d4a
```

5. Click `Create` or `Update`, and try playing your game! Updates should be instant.

## Continuous Deployment

:::caution

Not supported yet. Join the early release wait list on [discord](https://discord.gg/myWacjdb5S), so we can notify you when we add support.

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
