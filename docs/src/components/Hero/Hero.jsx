import React from 'react';
import Link from '@docusaurus/Link';
import GitHubButton from 'react-github-btn';
import {
  Stack, Slide, Fade, Box,
} from '@mui/material';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import RunnerSvg from './runner-init.svg';
import styles from './hero.module.css';

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero', styles.heroBanner)}>
      <Stack
        width={{ sm: undefined, md: '100%' }}
        margin="auto"
        direction={{ sm: 'column', md: 'row' }}
        justifyContent="space-around"
      >
        <Stack
          justifyContent="flex-start"
          alignItems="flex-start"
          sx={{ marginBottom: 5, maxWidth: '600px' }}
        >
          <Slide direction="up" in timeout={200}>
            <Stack>
              <Fade in timeout={1000}>
                <h1 className="hero__title">
                  <span className="hero__hard-title">
                    {siteConfig.title.split(' ').slice(0, 3).join(' ')}
                  </span>
                  <br />
                  {` ${siteConfig.title.split(' ').slice(3).join(' ')}`}
                </h1>
              </Fade>
            </Stack>
          </Slide>
          <Slide direction="up" in timeout={500}>
            <Stack>
              <Fade in timeout={1000}>
                <p className="hero__subtitle">{siteConfig.tagline}</p>
              </Fade>
              <Slide direction="up" in timeout={1000}>
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  spacing={0}
                  sx={{ gap: 1 }}
                >
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
                  <Box />
                  <GitHubButton data-icon="octoicon-star" data-color-scheme="light_high_contrast" data-size="large" data-show-count href="https://github.com/turnbasedgames/urturn">
                    Star us on Github! ✨
                  </GitHubButton>
                </Stack>
              </Slide>
            </Stack>
          </Slide>
        </Stack>
        <Fade in timeout={1000}>
          <Box width="100%" maxWidth="500px">
            <RunnerSvg />
          </Box>
        </Fade>
      </Stack>
    </header>
  );
}

export default Hero;
