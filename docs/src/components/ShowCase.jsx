import React, { useState } from 'react';
import { Stack, Unstable_Grid2 as Grid2, Typography } from '@mui/material';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './ShowCase.module.css';
import semantleBattleGif from './semantleBattle.gif';
import semantleBattleThumbnail from './semantleBattleThumbnail.png';
import projectIncognitoGif from './projectIncognito.gif';
import projectIncognitoThumbnail from './projectIncognitoThumbnail.png';
import battleshipGif from './battleship.gif';
import battleshipThumbnail from './battleshipThumbnail.png';
import Multiplayer from './multiplayer.svg';
import Monetize from './monetize.svg';
import Scale from './scale.svg';

const ExampleGameList = [
  {
    title: <>
      Semantle Battle
      {' '}
      <span className="badge badge--primary">New!</span>
           </>,
    description: 'Multiplayer spin off of Semantle, built with ReactJS',
    gif: semantleBattleGif,
    thumbnail: semantleBattleThumbnail,
    prodUrl: 'https://www.urturn.app/games/63474d0012b461000e15dc96',
  },
  {
    title: 'Battleship',
    description: 'Classic game made with ReactJS',
    gif: battleshipGif,
    thumbnail: battleshipThumbnail,
    prodUrl: 'https://www.urturn.app/games/62adfb1b212915000e44e7a8',
  },
  {
    title: 'Project Incognito',
    description: 'Single player puzzler made with Phaser.io',
    gif: projectIncognitoGif,
    thumbnail: projectIncognitoThumbnail,
    prodUrl: 'https://www.urturn.app/games/630af4b26c3be1000e26aca4',
  },
];

const FeatureList = [
  {
    title: 'Multiplayer',
    points: [
      "Write the code for how you want the state to change, and that's it.",
      'Networking and matchmaking already built in.',
      'Updates occur on the order of milliseconds.',
    ],
    svgComponent: <Multiplayer className={styles['svg-thumbnail']} />,
    learnMore: true,
  },
  {
    title: 'Scale',
    points: [
      'Never worry about scaling or hosting your games again.',
      'Never pay for infrastructure again.',
      'We schedule your room functions on our internal functions as a service platform for free.',
    ],
    svgComponent: <Scale className={styles['svg-thumbnail']} />,
  },
  {
    title: 'Monetization',
    subtitle: <span className={clsx('badge badge--warning', styles.badge)}>Coming Soon!</span>,
    points: [
      'Monetize your games by implementing a simple function.',
      'ACID Transaction handling built in.',
    ],
    svgComponent: <Monetize className={styles['svg-thumbnail']} />,
  },
];

export default function ShowCase() {
  const [exampleGamesLoaded, setExampleGamesLoaded] = useState(false);
  return (
    <Stack justifyContent="center" maxWidth="1500px" margin={3}>
      <Stack minHeight="30vh" marginBottom={5} alignItems="center">
        <h1 className={styles['title-alt']}>Have questions or need one on one support?</h1>
        <a
          href="https://discord.gg/myWacjdb5S"
          target="_blank"
          className="button button--lg button--primary"
          rel="noreferrer"
        >
          Just Ask On Discord!
        </a>
      </Stack>
    </Stack>
  );
}
