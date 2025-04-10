const express = require('express');
const mqtt = require('mqtt');

function startMiddleware(port) {
  const app = express();

  const mqttClient = mqtt.connect('mqtt://localhost:6000'); // Conectamos al broker

  mqttClient.on('connect', () => {
    console.log(`🔗 Middleware en puerto ${port} conectado al broker MQTT`);
  });

  app.use(express.json());
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    console.log(`[${req.method}] IP real del cliente: ${req.ip}`);
    next();
  });

  app.get('/record', (req, res) => {
    const data = req.query;
    console.log(`[GET][Puerto ${port}] Datos recibidos:`, data);

    mqttClient.publish('sensores/datos', JSON.stringify({ port, method: 'GET', ...data }));

    res.status(200).send('Datos GET recibidos y enviados por MQTT');
  });

  app.post('/record', (req, res) => {
    const data = req.body;
    console.log(`[POST][Puerto ${port}] Datos recibidos:`, data);

    mqttClient.publish('sensores/datos', JSON.stringify({ port, method: 'POST', ...data }));

    res.status(200).send('Datos POST recibidos y enviados por MQTT');
  });

  app.listen(port, () => {
    console.log(` Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
