import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const ghOrg = process.env.GH_ORG || 'YOUR_ORG';
const ghRepo = process.env.GH_REPO || 'saola';
const ghBase = `https://github.com/${ghOrg}/${ghRepo}`;

const config: Config = {
  title: 'Saola',
  tagline: 'Secure & Private API Development Platform',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // GitHub Pages: https://<org>.github.io/saola/ (CI sets these via env)
  url: process.env.DEPLOYMENT_URL || 'https://YOUR_ORG.github.io',
  baseUrl: process.env.DEPLOYMENT_BASE_PATH || '/saola/',

  organizationName: process.env.GH_ORG || 'YOUR_ORG',
  projectName: process.env.GH_REPO || 'saola',
  trailingSlash: false,

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: `${ghBase}/tree/main/docs-site/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Saola',
      logo: {
        alt: 'Saola Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: ghBase,
          label: 'GitHub',
          position: 'right',
        },
        {
          href: `${ghBase}/releases`,
          label: 'Releases',
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
            { label: 'Introduction', to: '/' },
            { label: 'Installation', to: '/installation' },
            { label: 'Quick Start', to: '/getting-started/quick-start' },
          ],
        },
        {
          title: 'Resources',
          items: [
            { label: 'GitHub', href: ghBase },
            { label: 'Releases', href: `${ghBase}/releases` },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Saola. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
