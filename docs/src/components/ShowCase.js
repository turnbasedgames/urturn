import React from 'react';
import { Stack, Unstable_Grid2 as Grid2 } from '@mui/material';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './ShowCase.module.css';
import semantleBattleGif from './semantleBattle.gif'
import semantleBattleThumbnail from './semantleBattleThumbnail.png'
import projectIncognitoGif from './projectIncognito.gif'
import projectIncognitoThumbnail from './projectIncognitoThumbnail.png'
import battleshipGif from './battleship.gif'
import battleshipThumbnail from './battleshipThumbnail.png'
import Multiplayer from './multiplayer.svg';
import Monetize from './monetize.svg';
import Scale from './scale.svg';

const ExampleGameList = [
  {
    title: <>Semantle Battle <span className="badge badge--primary">New!</span></>,
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
    prodUrl: "https://www.urturn.app/games/630af4b26c3be1000e26aca4",
  },
];

const FeatureList = [
  {
    title: 'Multiplayer',
    points: [
      "Write the code for how you want the state to change, and that's it.",
      'Networking and matchmaking already built in.',
      'Updates occur on the order of milliseconds.'
    ],
    svgComponent: <Multiplayer className={styles['svg-thumbnail']} />,
    learnMore: true
  },
  {
    title: 'Scale',
    points: [
      'Never worry about scaling or hosting your games again.',
      'Never pay for infrastructure again.',
      'We schedule your room functions on our internal functions as a service platform for free.'
    ],
    svgComponent: <Scale className={styles['svg-thumbnail']} />
  },
  {
    title: 'Monetization',
    subtitle: <span className={clsx("badge badge--warning", styles.badge)}>Coming Soon!</span>,
    points: [
      'Monetize your games by implementing a simple function.',
      'ACID Transaction handling built in.'
    ],
    svgComponent: <Monetize className={styles['svg-thumbnail']} />
  },
];

export default function ShowCase() {
  return (
    <Stack justifyContent="center" maxWidth="1500px" margin="auto">
      <Stack maxWidth="90%" margin="auto" minHeight="60vh" alignItems="center" justifyContent="center">
        <h1 className={styles.title}>Built with UrTurn</h1>
        <p className='hero__subtitle'>Battle tested by a rich community of developers and players.</p>
        <Grid2 container spacing={2} margin={2}>
          {ExampleGameList.map(({ title, description, gif, thumbnail, prodUrl }, index) => (
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
                    <h1 className={styles['card-title']}>{title}</h1>
                    <p className={styles['card-title']}>{description}</p>
                  </Stack>
                </Stack>
              </Link>
            </Grid2>
          ))}
        </Grid2>
      </Stack>
      <Stack maxWidth="90%" margin="auto" minHeight="60vh" alignItems="center" justifyContent="center">
        <h1 className={styles['title-alt']}>All of Your Infrastructure Needs</h1>
        <p className='hero__subtitle'>We are obsessed over the game developer experience. Here's what you can do with UrTurn.</p>
        <Grid2 container spacing={2} margin={2}>
          {FeatureList.map(({ subtitle, title, description, points, svgComponent, learnMore }, index) => (
            <Grid2 xs={12} sm={6} lg={4} key={index}>
              <Stack
                width="100%"
                alignItems="center"
                maxHeight="500px"
                margin={1}
              >
                <div className={clsx("card", styles.card)}>
                  <div className="card__header">
                    <h1 className={styles['card-title']}>{title} {subtitle}</h1>
                    <p className={styles['card-title']}>{description}</p>
                    <ul>
                      {points.map((point, index) => <li key={index}>{point}</li>)}
                    </ul>
                  </div>
                  {svgComponent}
                  {learnMore && <div class="card__footer">
                    <a href="/docs/" class="button button--secondary button--block">Learn More</a>
                  </div>}
                </div>
              </Stack>
            </Grid2>
          ))}
        </Grid2>
      </Stack>
      <Stack minHeight="30vh" marginBottom={5} alignItems="center">
        <h1 className={styles['title-alt']}>Got Any Questions?</h1>
        <a
          href="https://discord.gg/myWacjdb5S"
          target="_blank"
          className={"button button--lg button--primary"}
        >
          Talk with us on Discord!
        </a>
      </Stack>
    </Stack >
  );
}
