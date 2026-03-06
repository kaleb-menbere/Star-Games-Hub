const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  // Proxy only /games
  app.use(
    '/games',
    createProxyMiddleware({
      target: 'https://games.startechnologies.et',
      changeOrigin: true,
      pathRewrite: {
        '^/games': '/games'
      }
    })
  );

  // Proxy API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://games.startechnologies.et',
      changeOrigin: true
    })
  );
};