import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import ShowCase from '../components/ShowCase';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__hard-title">{siteConfig.title.split(' ').slice(0,3).join(' ')}</h1>
        <h1 className="hero__title">{' ' + siteConfig.title.split(' ').slice(3,4).join(' ')}</h1>
        <h1 className="hero__soft-title">{' ' + siteConfig.title.split(' ').slice(4).join(' ')}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.organizationName}`}>
      <HomepageHeader />
      <main>
        <ShowCase />
      </main>
    </Layout>
  );
}
