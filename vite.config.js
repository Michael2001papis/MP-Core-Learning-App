import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        home: 'pages/home/index.html',
        about: 'pages/about/index.html',
        contact: 'pages/contact/index.html',
        privacy: 'pages/privacy/index.html',
        terms: 'pages/terms/index.html',
        '404': 'pages/404/index.html',
        'tic-tac-toe': 'pages/games/tic-tac-toe/index.html',
        snake: 'pages/games/snake/index.html',
        login: 'pages/login/index.html',
      },
    },
  },
});
