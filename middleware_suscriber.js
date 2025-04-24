// middleware_subscriber.js

const mqtt = require('mqtt');
const mysql = require('mysql2');

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'tu_contraseña', // Reemplaza con tu contraseña
  database: 'sensores_db'     // Asegúrate de que esta base de datos exista
});

// Conexión al broker MQTT
const mqttClient = mqtt.connect('mqtt://localhost:6000');

// Conexión exitosa al broker
mqttClient.on('connect', () => {
  console.log('✅ Suscriptor conectado al broker MQTT');

  // Suscribirse a los temas de interés
  mqttClient.subscribe(['sensores/clima', 'sensores/gases'], (err) => {
    if (err) {
      console.error('❌ Error al suscribirse a los temas:', err);
    } else {
      console.log('📡 Suscrito a los temas: sensores/clima y sensores/gases');
    }
  });
});

// Manejo de mensajes recibidos
mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    if (topic === 'sensores/clima') {
      const { id_nodo, temperatura, humedad } = data;
      const query = 'INSERT INTO clima (id_nodo, temperatura, humedad, timestamp) VALUES (?, ?, ?, NOW())';
      db.execute(query, [id_nodo, temperatura, humedad], (err) => {
        if (err) {
          console.error('❌ Error al insertar en la tabla clima:', err);
        } else {
          console.log(`✅ Datos de clima guardados: Nodo ${id_nodo}`);
        }
      });
    } else if (topic === 'sensores/gases') {
      const { id_nodo, co2, volatiles } = data;
      const query = 'INSERT INTO gases (id_nodo, co2, volatiles, timestamp) VALUES (?, ?, ?, NOW())';
      db.execute(query, [id_nodo, co2, volatiles], (err) => {
        if (err) {
          console.error('❌ Error al insertar en la tabla gases:', err);
        } else {
          console.log(`✅ Datos de gases guardados: Nodo ${id_nodo}`);
        }
      });
    }
  } catch (err) {
    console.error('❌ Error al procesar el mensaje:', err);
  }
});
