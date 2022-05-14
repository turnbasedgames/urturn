import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

// TODO: update images
const FeatureList = [
  {
    title: 'Free!',
    description: (
      <>
        Urturn was designed for the Creator. Easily setup a new game and deploy on the platform for free without worrying about operational costs.
      </>
    ),
  },
  {
    title: 'Focus on What Matters',
    description: (
      <>
        Focus on building your game logic, art, and community without implementing the grueling infrastructure to support multiplayer, matchmaking, and data storage.
      </>
    ),
  },
];

function Feature({title, description}) {
  return (
    <div className={clsx('col col--6')}>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
