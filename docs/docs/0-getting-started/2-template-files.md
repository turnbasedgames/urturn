---
title: Walking Through the Template Files
---

### index.js

This is the "backend" for your game. It contains all of the logic that UrTurn needs to make the game playable. It currently contains four functions:

1. onRoomStart
2. onPlayerJoin
3. onPlayerQuit
4. onPlayerMove

We'll go over what these functions do and how we will implement them in the next section. Or you can [view their documentation](/docs/backend) directly.

### frontend

This is where the frontend for our game will go. We are currently using React to create our frontend. We will be working inside the ```frontend/src``` folder to create our components. When we finish, we will run ```npm run build```, which will create a compiled build in the ```frontend/build``` folder for UrTurn to serve.


### publish.yml

This file will trigger the creation of a branch called ```published``` and an automatic build of your frontend whenever a commit gets merged into your main branch, which UrTurn will then serve.
