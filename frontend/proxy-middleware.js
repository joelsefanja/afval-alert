const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use('/', createProxyMiddleware({
  target: 'https://nominatim.openstreetmap.org',
  changeOrigin: true,
  logLevel: 'debug',
  pathRewrite: {
    '^/': ''
  }
}));

const port = 3001;
app.listen(port, () => {
  console.log(`Proxy middleware listening on port ${port}`);
});