import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import { Stack } from '@mui/material'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import ShowCase from '../components/ShowCase';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero', styles.heroBanner)}>
      <Stack margin="auto" width="70%" justifyContent="center" alignItems="center"
        sx={{ maxWidth: "1000px" }}
      >
        <h1 className="hero__title">
          <a className="hero__hard-title">
            {siteConfig.title.split(' ').slice(0, 3).join(' ')}
          </a>
          {' ' + siteConfig.title.split(' ').slice(3).join(' ')}
        </h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <Stack direction="row" padding={2} spacing={2}>
          <a
            className="button button--lg button--primary button--primary"
            href="/docs/category/getting-started"
          >
            Get Started
          </a>
          <a
            className="button button--lg button--outline button--secondary"
            href="docs/"
          >
            Learn More
          </a>
        </Stack>
      </Stack>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.organizationName}`}>
      <HomepageHeader />
      <main>
        <ShowCase />
      </main>
    </Layout>
  );
}
