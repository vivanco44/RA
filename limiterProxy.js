const express = require('express');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Límite: 10 solicitudes por segundo
const limiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 10, // max 10 req/s por IP
  message: 'Too many requests, please slow down.'
});

// Aplicar el límite
app.use(limiter);

// Redirigir a HAProxy
app.use('/', createProxyMiddleware({
  target: 'http://localhost:1999',
  changeOrigin: true
}));

app.listen(2000, () => {
  console.log('Proxy con rate limiting activo en http://localhost:2000');
});
