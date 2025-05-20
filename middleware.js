const express = require('express');
const mqtt = require('mqtt');
const CryptoJS = require('crypto-js');

const secretKey = 'mi_clave_secreta'; // 🔐 Usa la misma clave que en el load/sensor

// Función para descifrar los datos
function decryptData(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error('Texto descifrado vacío (clave incorrecta o datos corruptos)');
    }

    return JSON.parse(decryptedText);
  } catch (err) {
    console.error('❌ Error en decryptData:', err.message);
    throw err;
  }
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
    console.log('📥 Body recibido:', req.body);

    try {
      const encryptedPayload = req.body.payload;

      if (!encryptedPayload) {
        console.warn('⚠️ Payload faltante en la solicitud');
        return res.status(400).send('El campo "payload" es obligatorio');
      }

      console.log('🔐 Descifrando payload...');
      const data = decryptData(encryptedPayload);
      console.log(`✅ [Puerto ${port}] Datos descifrados:`, data);

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
      console.error(`❌ Error al procesar en el middleware ${port}:`, error.message);
      res.status(400).send('❌ Error al descifrar datos');
    }
  });

  app.listen(port, () => {
    console.log(`✅ Middleware corriendo en http://localhost:${port}`);
  });
}

module.exports = startMiddleware;
