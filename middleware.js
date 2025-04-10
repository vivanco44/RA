const express = require('express');
const mqtt = require('mqtt');

function startMiddleware(port) {
  const app = express();

  const mqttClient = mqtt.connect('mqtt://localhost:6000'); // Conexión al broker

  mqttClient.on('connect', () => {
    console.log(`🔗 Middleware en puerto ${port} conectado al broker MQTT`);
  });

  app.use(express.json());
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    console.log(`[${req.method}] IP real del cliente: ${req.ip}`);
    next();
  });

  function publicarDatos(data, method) {
    const clima = {
      port,
      method,
      id_nodo: data.id_nodo,
      temperatura: data.temperatura,
      humedad: data.humedad
    };

    const gases = {
      port,
      method,
      id_nodo: data.id_nodo,
      co2: data.co2,
      volatiles: data.volatiles
    };

    mqttClient.publish('sensores/clima', JSON.stringify(clima));
    mqttClient.publish('sensores/gases', JSON.stringify(gases));
  }

  app.get('/record', (req, res) => {
    const data = req.query;
    console.log(`[GET][Puerto ${port}] Datos recibidos:`, data);

    publicarDatos(data, 'GET');
    res.status(200).send('Datos GET recibidos y enviados por MQTT');
  });

  app.post('/record', (req, res) => {
    const data = req.body;
    console.log(`[POST][Puerto ${port}] Datos recibidos:`, data);

    publicarDatos(data, 'POST');
    res.status(200).send('Datos POST recibidos y enviados por MQTT');
  });

  app.listen(port, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
