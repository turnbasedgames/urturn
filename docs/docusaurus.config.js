// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'UrTurn',
  tagline: 'Quickly build multiplayer games - only four functions!',
  url: 'https://docs.urturn.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // favicon: 'img/favicon.ico', TODO: replace with turn based games logo
  organizationName: 'turnbasedgames',
  projectName: 'urturn',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,
  themes: ['@docusaurus/theme-live-codeblock'],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/turnbasedgames/urturn',
        },
        blog: {
          showReadingTime: true,
          editUrl:
            'https://github.com/turnbasedgames/urturn',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
      },
      navbar: {
        title: 'UrTurn',
        logo: {
          alt: 'UrTurn',
          src: 'img/logo.svg', // TODO: need to change logo
        },
        items: [
          {
            type: 'doc',
            docId: 'getting-started/introduction',
            position: 'left',
            label: 'Docs',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/turnbasedgames/urturn',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/getting-started/introduction',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/turnbasedgames',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/turnbasedgames',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/turnbasedgames',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Turn Based Games Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
  // This is required to make the docs site searchable https://github.com/praveenn77/docusaurus-lunr-search
  plugins: [require.resolve('docusaurus-lunr-search')]
 };

module.exports = config;
