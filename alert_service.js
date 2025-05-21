// cliente-alertas-email.js
const mqtt = require('mqtt');
const nodemailer = require('nodemailer');

// MQTT
const client = mqtt.connect('mqtt://localhost:6000');
const TOPICS = ['sensores/clima', 'sensores/gases'];

const UMBRALES = {
  temperatura: 30,
  humedad: 30,
  co2: 800,
  volatiles: 0.7
};

// ✉️ Configura tu transportador SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: 'redesavanzadasalertasensores@gmail.com',      // <-- pon aquí tu correo
    pass: 'lbrx kmot mooq vbyv'         // <-- pon aquí tu contraseña de aplicación
  }
});

function enviarAlertaPorCorreo(asunto, mensaje) {
  const mailOptions = {
    from: '"Alerta Sensor" <redesavanzadasalertasensores@gmail.com>',
    to: 'marta.almeida.4102@gmail.com',   // <-- correo de destino
    subject: asunto,
    text: mensaje
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('❌ Error al enviar correo:', error);
    }
    console.log(`✉️ Correo enviado: ${info.response}`);
  });
}

// MQTT Lógica
client.on('connect', () => {
  console.log(`✅ Conectado al broker`);
  client.subscribe(TOPICS, err => {
    if (err) console.error('❌ Suscripción fallida:', err);
    else console.log(`📡 Suscrito a: ${TOPICS.join(', ')}`);
  });
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === 'sensores/clima') {
      if (data.temperatura > UMBRALES.temperatura) {
        const msg = `🔥 ALERTA: Alta temperatura (${data.temperatura}°C) en sensor ${data.id_nodo}`;
        console.warn(msg);
        enviarAlertaPorCorreo('Alerta de temperatura', msg);
      }
      if (data.humedad < UMBRALES.humedad) {
        const msg = `💧 ALERTA: Baja humedad (${data.humedad}%) en sensor ${data.id_nodo}`;
        console.warn(msg);
        enviarAlertaPorCorreo('Alerta de humedad', msg);
      }
    }

    if (topic === 'sensores/gases') {
      if (data.co2 > UMBRALES.co2) {
        const msg = `😵 ALERTA: CO₂ elevado (${data.co2} ppm) en sensor ${data.id_nodo}`;
        console.warn(msg);
        enviarAlertaPorCorreo('Alerta de CO₂', msg);
      }
      if (data.volatiles > UMBRALES.volatiles) {
        const msg = `🧪 ALERTA: Volátiles elevados (${data.volatiles}) en sensor ${data.id_nodo}`;
        console.warn(msg);
        enviarAlertaPorCorreo('Alerta de compuestos volátiles', msg);
      }
    }

  } catch (err) {
    console.error('❌ Error procesando mensaje:', err);
  }
});
