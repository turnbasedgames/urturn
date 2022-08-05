---
title: Deploying Your Game
---


## 1. Push Your Changes

If you haven't commited your changes yet, go ahead and do so and push to github! 

```bash
git add .
git commit -m "first commit!"
git push
```

## 2. Wait For GitHub Actions

An automatic GitHub action will run to build your project and deploy it to a branch called ```published```. To watch your branches project, visit your repo's '/actions' page.

## 3. Get Your Commit SHA

You now need to find the commit containing the correct file versions you want to serve on UrTurn. You can access this through the GitHub UI or by running the following command ***after*** the branch has been created by your GitHub action:

```bash
git rev-parse origin/published
```

## 4. Deploy to UrTurn!

Go to your [developer console](https://www.urturn.app/develop) and click **Create Game**. Give your game a name, link your github repo (no additional parameters! An example URL: https://github.com/turnbasedgames/tictactoe), paste your commit hash, and add a description. Click **Create**, and your game is now playable!
