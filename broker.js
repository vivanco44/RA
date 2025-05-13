
const aedes = require('aedes')();
const net = require('net');

const PORT = 6000;

const server = net.createServer(aedes.handle);

server.listen(PORT, () => {
  console.log(` Broker MQTT corriendo en el puerto ${PORT}`);
});

aedes.on('client', client => {
  console.log(` Cliente conectado: ${client ? client.id : 'desconocido'}`);
});

aedes.on('publish', (packet, client) => {
  if (client) {
    console.log(`Mensaje recibido de ${client.id}:`);
    console.log(`   → Topic: ${packet.topic}`);
    console.log(`   → Payload: ${packet.payload.toString()}`);
  }
});
