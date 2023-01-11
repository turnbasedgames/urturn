import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import WalkThrough from '../components/WalkThrough/WalkThrough';
import JoinDiscord from '../components/JoinDiscord/JoinDiscord';
import ThemeProvider from '../components/ThemeProvider';
import Hero from '../components/Hero/Hero';

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={`${siteConfig.organizationName}`}>
      <ThemeProvider>
        <Hero />
        <main>
          <WalkThrough />
          <JoinDiscord />
        </main>
      </ThemeProvider>
    </Layout>
  );
}
