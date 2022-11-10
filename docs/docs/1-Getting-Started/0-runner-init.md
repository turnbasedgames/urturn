---
description: Quickly generate a new UrTurn Game
---

# Generating a new UrTurn Game

To get started, run:

```bash

$ npx @urturn/runner --init
... answer prompts
$ npm run dev # opens game in browser

```

## Project structure

```bash
game
│   package.json
│
└───.github/workflows # contains important GitHub actions that create a build artifact for UrTurn to use
│
└───src
│   │   main.js # backend functions (e.g. onRoomStart, onPlayerMove, etc.)
│   
└───frontend # holds all the files related to your game frontend
    │   package.json
    │   ...your frontend files
```

### GitHub Actions

This is a job that will provide the correct [artifact structure](Project Folder/File Structure). // TODO: fix this and bring cleaner bash structure here
