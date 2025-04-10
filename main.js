// main.js
const { exec } = require('child_process');
const startMiddleware = require('./middleware');


// Iniciar middlewares
startMiddleware(3001);
startMiddleware(3002);


// Iniciar HAProxy en el puerto 2000 usando un archivo de configuración
exec('haproxy -f haproxy.cfg', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error al iniciar HAProxy: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`HAProxy iniciado:\n${stdout}`);
});
