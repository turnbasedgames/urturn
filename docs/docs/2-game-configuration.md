---
title: Configuring Your Game
---

## Game Configuration

### Name

The name your game will be searchable as.

### GitHub Repo URL

The URL of your GitHub repo with no extra parameters (example: https://github.com/turnbasedgames/tictactoe).

### Commit

The exact commit **on the published branch** the you would like in production. This can be obtained with the following command ***after*** your GitHub actions have run:

```
git fetch --all
git rev-parse origin/published
```

### Description

A description of your game.

## Other

### Thumbnail

Your thumbnail will be automatically imported from the 'thumbnail.png' file at the highest level of your repo. If there is no file, a fallback photo will be used.