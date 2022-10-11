const { defineConfig } = require('@vue/cli-service');
const path = require('path');

module.exports = defineConfig({
  transpileDependencies: true,
  css: {
    extract: false,
  },
  chainWebpack: (config) => {
    config
      .resolve
      .alias
      .set('@env', path.resolve(
        __dirname,
        'src/resources/',
        process.env.NODE_ENV || 'development',
      ));
  },
  // configureWebpack: {
  //   resolve: {
  //     alias: {
  //       env: path.resolve(
  //         __dirname,
  //         'src/resources/settings',
  //         process.env.PROFILE || 'dev',
  //       ),
  //       extensions: ['.json'],
  //     },
});
