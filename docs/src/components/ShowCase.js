import React from 'react';
import { Stack, Unstable_Grid2 as Grid2 } from '@mui/material';
import Link from '@docusaurus/Link';
import styles from './ShowCase.module.css';
import semantleBattleGif from './semantleBattle.gif'
import semantleBattleThumbnail from './semantleBattleThumbnail.png'
import projectIncognitoGif from './projectIncognito.gif'
import projectIncognitoThumbnail from './projectIncognitoThumbnail.png'
import battleshipGif from './battleship.gif'
import battleshipThumbnail from './battleshipThumbnail.png'

const FeatureList = [
  {
    title: 'Semantle Battle',
    description: 'Multiplayer spin off of Semantle, built with ReactJS',
    gif: semantleBattleGif,
    thumbnail: semantleBattleThumbnail,
    prodUrl: "https://www.urturn.app/games/63474d0012b461000e15dc96",
  },
  {
    title: 'Battleship',
    description: 'Classic game made with ReactJS',
    gif: battleshipGif,
    thumbnail: battleshipThumbnail,
    prodUrl: "https://www.urturn.app/games/62adfb1b212915000e44e7a8",
  },
  {
    title: 'Project Incognito',
    description: 'Single player puzzler made with Phaser.io',
    gif: projectIncognitoGif,
    thumbnail: projectIncognitoThumbnail,
    prodUrl: "https://www.urturn.app/games/62adfb1b212915000e44e7a8",
    className: 'card-title-dark'
  },
];

export default function ShowCase() {
  return (
    <Stack justifyContent="center">
      <h1 className={styles.title}>Built with UrTurn</h1>
      <Grid2 container spacing={2} margin={2}>
        {FeatureList.map(({ className, title, description, gif, thumbnail, prodUrl }, index) => (
          <Grid2 xs={12} sm={6} lg={4} key={index}>
            <Link to={prodUrl}>
              <Stack
                width="100%"
                alignItems="center"
                sx={{ position: 'relative', aspectRatio: '1 / 1' }}
              >
                <img
                  onMouseOver={e => (e.currentTarget.src = gif)}
                  onMouseOut={e => (e.currentTarget.src = thumbnail)}
                  className={styles['img-thumbnail']}
                  src={thumbnail}
                  alt="loading preview..."
                />
                <Stack sx={{ position: 'absolute', width: '100%', bottom: 0, background: 'rgba(21, 21, 21, 0.3)' }}>
                  <h1 className={styles[className ?? 'card-title']}>{title}</h1>
                  <p className={styles[className ?? 'card-title']}>{description}</p>
                </Stack>
              </Stack>
            </Link>
          </Grid2>
        ))}
      </Grid2>
    </Stack >
  );
}
