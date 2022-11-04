/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Introduction',
      link:{type: 'doc', id: 'Introduction/Introduction'},
      items: [
        'Introduction/Flow-Of-Simple-Game',
        'Introduction/Concepts'
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'generated-index',
        keywords: ['getting started'],
      },
      items: [
        'Getting-Started/runner-init',
        'Getting-Started/tictactoe',
        'Getting-Started/Deploying-Your-Game',
        'Getting-Started/typescript-support'
      ],
    },
  ],
};

module.exports = sidebars;
