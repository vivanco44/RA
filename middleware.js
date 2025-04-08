// middleware.js
const express = require('express');

function startMiddleware(port) {
  const app = express();

  app.use(express.json());
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    console.log(`[${req.method}] IP real del cliente: ${req.ip}`);
    next();
  });

  app.get('/record', (req, res) => {
    const { id_nodo, temperatura, humedad, co2, volatiles } = req.query;
    console.log('[GET] Datos recibidos:', { id_nodo, temperatura, humedad, co2, volatiles });
    res.status(200).send('Datos GET recibidos correctamente');
  });

  app.post('/record', (req, res) => {
    const { id_nodo, temperatura, humedad, co2, volatiles } = req.body;
    console.log('[POST] Datos recibidos:', { id_nodo, temperatura, humedad, co2, volatiles });
    res.status(200).send('Datos POST recibidos correctamente');
  });

  app.listen(port, () => {
    console.log(`Middleware iniciado en puerto ${port}`);
  });
}

module.exports = startMiddleware;
