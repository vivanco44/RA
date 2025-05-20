const express = require('express');
const mqtt = require('mqtt');
const CryptoJS = require('crypto-js');

const secretKey = 'mi_clave_secreta'; // 🔐 Debe ser igual a la usada en el sensor/load

function decryptData(encrypted) {
  const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedText);
}

function startMiddleware(port) {
  const app = express();
  const mqttClient = mqtt.connect('mqtt://localhost:6000');

  mqttClient.on('connect', () => {
    console.log(`🔗 Middleware en puerto ${port} conectado al broker MQTT`);
  });

  app.use(express.json());
  app.set('trust proxy', true);

  app.use((req, res, next) => {
    console.log(`[${req.method}] IP real del cliente: ${req.ip}`);
    next();
  });

  app.post('/record', (req, res) => {
    try {
      const encryptedPayload = req.body.payload;
      const data = decryptData(encryptedPayload);

      console.log(`[POST][Puerto ${port}] Datos descifrados:`, data);

      // Publicar en MQTT
      mqttClient.publish('sensores/clima', JSON.stringify({
        id_nodo: data.id_nodo,
        temperatura: data.temperatura,
        humedad: data.humedad
      }));

      mqttClient.publish('sensores/gases', JSON.stringify({
        id_nodo: data.id_nodo,
        co2: data.co2,
        volatiles: data.volatiles
      }));

      res.status(200).send('✅ Datos descifrados y enviados por MQTT');
    } catch (error) {
      console.error(`❌ Error al descifrar datos en middleware ${port}:`, error.message);
      res.status(400).send('❌ Error al descifrar');
    }
  });

  app.listen(port, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
