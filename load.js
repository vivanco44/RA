const axios = require('axios');

// Número de solicitudes a enviar
const numRequests = 100;

// Función para generar datos aleatorios
function generateRandomData() {
  return {
    id_nodo: Nav${Math.floor(Math.random() * 10) + 1},
    temperatura: Math.floor(Math.random() * 35) + 15,
    humedad: Math.floor(Math.random() * 50) + 30,
    co2: Math.floor(Math.random() * 500) + 200,
    volatiles: Math.floor(Math.random() * 10) + 1
  };
}

// Retardo de n milisegundos
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función principal asincrónica
async function enviarSolicitudes() {
  for (let i = 0; i < numRequests; i++) {
    const data = generateRandomData();

    try {
      const response = await axios.post('http://localhost:2000/record', data, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log((${i + 1}/${numRequests}) ✅ POST exitoso:, response.status);
    } catch (error) {
      console.error((${i + 1}/${numRequests}) ❌ Error en POST:, error.message);
    }

    await delay(1000); // Espera 1 segundo antes del siguiente POST
  }
}

enviarSolicitudes();
