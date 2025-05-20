const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');

const app = express();

// ✅ Rate limit: 10 req/s por IP
const limiter = rateLimit({
  windowMs: 1000, // 1 segundo
  max: 10,        // máximo 10 solicitudes por IP por segundo
  message: 'Too many requests, please slow down.',
  standardHeaders: true, 
  legacyHeaders: false,
});

// ⚠️ Esto DEBE ir antes del proxy
app.use(limiter);

// Proxy hacia HAProxy
app.use('/', createProxyMiddleware({
  target: 'http://localhost:1999',
  changeOrigin: true
}));

app.listen(2000, () => {
  console.log('Proxy con rate limiting activo en http://localhost:2000');
});
