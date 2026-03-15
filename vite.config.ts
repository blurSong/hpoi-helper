import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'
import { resolve } from 'path'
import pkg from './package.json'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: 'Hpoi Helper',
        namespace: 'https://github.com/blurSong/hpoi-helper',
        version: pkg.version,
        description: 'Enhancements for www.hpoi.net',
        author: 'blurSong',
        match: ['*://www.hpoi.net/*', '*://hpoi.net/*'],
        icon: 'https://www.hpoi.net/favicon.ico',
        grant: [
          'GM_setValue',
          'GM_getValue',
          'GM_addStyle',
        ],
        'run-at': 'document-idle',
        license: 'MIT',
      },
      build: {
        fileName: 'hpoi-helper.user.js',
      },
    }),
  ],
})
