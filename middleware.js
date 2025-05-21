const express = require('express');
const mqtt = require('mqtt');
const crypto = require('crypto');

// ⚠️ CLAVE AES FIJA (32 bytes para AES-256)
// Debe ser igual a la usada por el cliente
const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012'); // Ejemplo: 32 caracteres

function decryptAES(encryptedBase64, ivBase64) {
  const iv = Buffer.from(ivBase64, 'base64');
  const encryptedText = Buffer.from(encryptedBase64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
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

  app.post('/record', (req, res) => {
    const { payload, iv } = req.body;

    try {
      const decryptedData = decryptAES(payload, iv);
      console.log(`[POST][Puerto ${port}] Datos DESCIFRADOS:`, decryptedData);

      publicarDatos(decryptedData);
      res.status(200).send('Datos POST descifrados y enviados por MQTT');
    } catch (err) {
      console.error(`[POST][Puerto ${port}] ❌ Error al descifrar:`, err.message);
      res.status(400).send('Error al descifrar los datos');
    }
  });

  app.listen(port, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
