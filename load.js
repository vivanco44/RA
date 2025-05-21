const axios = require('axios');
const crypto = require('crypto');

// Configuración AES
const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012');
 // Clave de 256 bits
const IV = crypto.randomBytes(16); // Vector de inicialización de 128 bits

// Número de solicitudes a enviar
const numRequests = 100;

// Función para generar datos aleatorios
function generateRandomData() {
  return {
    id_nodo: `Nav${Math.floor(Math.random() * 10) + 1}`,
    temperatura: Math.floor(Math.random() * 35) + 15,
    humedad: Math.floor(Math.random() * 50) + 30,
    co2: Math.floor(Math.random() * 500) + 200,
    volatiles: Math.floor(Math.random() * 10) + 1
  };
}

// Función para cifrar datos con AES-256-CBC
function encryptData(data) {
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

// Retardo de n milisegundos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal asincrónica
async function enviarSolicitudes() {
  for (let i = 0; i < numRequests; i++) {
    const data = generateRandomData();
    const encryptedData = encryptData(data);

    try {
      const response = await axios.post('http://localhost:2000/record', {
        payload: encryptedData,
        iv: IV.toString('base64') // para que el receptor pueda descifrar
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`(${i + 1}/${numRequests}) ✅ POST exitoso:`, response.status);
    } catch (error) {
      console.error(`(${i + 1}/${numRequests}) ❌ Error en POST:`, error.message);
    }

    await delay(1000); // Espera 1 segundo antes del siguiente POST
  }
}

enviarSolicitudes();
