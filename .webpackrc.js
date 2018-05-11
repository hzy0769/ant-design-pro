const path = require('path');

export default {
  entry: 'src/index.js',
  extraBabelPlugins: [['import', { libraryName: 'antd', libraryDirectory: 'es', style: true }]],
  env: {
    development: {
      extraBabelPlugins: ['dva-hmr'],
    },
  },
  alias: {
    components: path.resolve(__dirname, 'src/components/'),
  },
  ignoreMomentLocale: true,
  theme: './src/theme.js',
  html: {
    template: './src/index.ejs',
  },
  disableDynamicImport: true,
  publicPath: '/',
  hash: true,
  proxy: {
    '/api/admin': {
      target: 'http://127.0.0.1:8080/',
      changeOrigin: true,
      // "pathRewrite": { "^/lmapi" : "/api" }
    },
    '/api/framework': {
      target: 'http://127.0.0.1:8080/',
      changeOrigin: true,
    },
  },
};
