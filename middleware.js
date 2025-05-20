const express = require('express');
const mqtt = require('mqtt');
const CryptoJS = require('crypto-js');

const secretKey = 'mi_clave_secreta'; // La clave para cifrar y descifrar

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

  function publicarDatos(data) {
    const clima = {
      id_nodo: data.id_nodo,
      temperatura: data.temperatura,
      humedad: data.humedad
    };

    const gases = {
      id_nodo: data.id_nodo,
      co2: data.co2,
      volatiles: data.volatiles
    };

    mqttClient.publish('sensores/clima', JSON.stringify(clima));
    mqttClient.publish('sensores/gases', JSON.stringify(gases));
  }

  function decryptPayload(encrypted) {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedText);
    } catch (error) {
      throw new Error('Error al descifrar payload');
    }
  }

  app.post('/record', (req, res) => {
    const { payload } = req.body;
    console.log(`[POST][Puerto ${port}] Payload cifrado recibido:`, payload);

    try {
      const data = decryptPayload(payload);
      console.log(`[POST][Puerto ${port}] Datos descifrados:`, data);

      publicarDatos(data);

      res.status(200).send('✅ Datos descifrados y enviados por MQTT');
    } catch (error) {
      console.error(`[POST][Puerto ${port}] ${error.message}`);
      res.status(400).send('❌ Error al descifrar payload');
    }
  });

  app.listen(port, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
