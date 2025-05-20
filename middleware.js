app.post('/record', (req, res) => {
  console.log('📥 Payload recibido:', req.body);

  try {
    const encryptedPayload = req.body.payload;
    if (!encryptedPayload) {
      console.error('⚠️ No se recibió "payload"');
      return res.status(400).send('Payload faltante');
    }

    console.log('🔐 Iniciando descifrado...');
    const data = decryptData(encryptedPayload);
    console.log('✅ Datos descifrados:', data);

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
    console.error(`❌ Error en el middleware ${port}:`, error.message);
    res.status(400).send('❌ Error al procesar la solicitud');
  }
});
