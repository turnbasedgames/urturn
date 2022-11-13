// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Create web games faster than ever',
  tagline: "Use your favorite game frameworks, while leveraging all of UrTurn's open source infrastructure from a simple client for free.",
  url: 'https://docs.urturn.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'UrTurn',
  projectName: 'UrTurn',
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
          editUrl: 'https://github.com/turnbasedgames/urturn/tree/main/docs',
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/turnbasedgames/urturn/tree/main/docs',
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
        disableSwitch: false,
      },
      navbar: {
        title: 'UrTurn',
        logo: {
          alt: 'UrTurn',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'Introduction/Introduction',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://discord.gg/myWacjdb5S',
            position: 'right',
            className: "header-discord-link",
            "aria-label": "UrTurn Discord",
          },
          {
            href: 'https://github.com/turnbasedgames/urturn',
            position: 'right',
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        links: [
          {
            html: `
              <div class="container container--fluid">
                <div class="row footer__links">
                  <div class="col footer__col">
                    <h1 class="navbar__title text__left-align">Here's to a better world<br/>with better games.</h1>
                    <p class="navbar__subtitle text__left-align">Made with ❤️ by Kevin, Sarah, Yoofi</p>
                  </div>
                  <div class="col footer__col">
                    <div class="footer__links">
                      <a class="footer__link-item" href="https://discord.gg/myWacjdb5S">Discord</a>
                      <span class="footer__link-separator">&middot;</span>
                      <a class="footer__link-item" href="/blog">Blog</a>
                      <span class="footer__link-separator">&middot;</span>
                      <a class="footer__link-item" href="https://github.com/turnbasedgames">GitHub</a>
                    </div>
                    <div class="footer__copyright">
                      Copyright © ${new Date().getFullYear()} UrTurn Inc.
                    </div>
                  </div>
                </div>
              </div>
            `
          },
        ],
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
