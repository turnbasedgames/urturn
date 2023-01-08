import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import { Stack, Slide, Fade } from '@mui/material'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './index.module.css';
import ShowCase from '../components/ShowCase';
import Link from '@docusaurus/Link';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero', styles.heroBanner)}>
      <Stack margin="auto" width="70%" justifyContent="center" alignItems="center"
        sx={{ maxWidth: "1000px" }}
      >
        <Slide direction="up" in timeout={200}>
          <Stack>
            <Fade in timeout={1000}>
              <h1 className="hero__title">
                <a className="hero__hard-title">
                  {siteConfig.title.split(' ').slice(0, 3).join(' ')}
                </a>
                {' ' + siteConfig.title.split(' ').slice(3).join(' ')}
              </h1>
            </Fade>
          </Stack>
        </Slide>
        <Slide direction="up" in timeout={500}>
          <Stack justifyContent="center" alignItems="center">
            <Fade in timeout={1000}>
              <p className="hero__subtitle">{siteConfig.tagline}</p>
            </Fade>
            <Slide direction='up' in timeout={1000}>
              <Stack direction="row" padding={2} spacing={2}>
                <Link
                  className="button button--lg button--primary button--primary"
                  to="/docs/category/getting-started"
                >
                  Get Started
                </Link>
                <Link
                  className="button button--lg button--outline button--secondary"
                  href="/docs"
                >
                  Learn More
                </Link>
              </Stack>
            </Slide>
          </Stack>
        </Slide>
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
