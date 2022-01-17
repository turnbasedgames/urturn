const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      pathRewrite: { '^/api': '' },
    }),
  );
  app.use(
    '/socket.io',
    createProxyMiddleware({
      target: 'http://localhost:8080',
    }),
  );
};
