const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {

  // Proxy only /games
  app.use(
    '/games',
    createProxyMiddleware({
      target: 'http://localhost:5000',
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
      target: 'http://localhost:5000',
      changeOrigin: true
    })
  );
};