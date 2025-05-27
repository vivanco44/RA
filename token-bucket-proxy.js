const express = require('express');
const axios = require('axios');
const TokenBucket = require('./TokenBucket');

const app = express();
app.use(express.json());

const bucket = new TokenBucket(5, 10); 

app.use(async (req, res) => {
  if (bucket.tryConsume()) {
    try {
      const response = await axios({
        method: req.method,
        url: `http://localhost:2000${req.originalUrl}`,
        headers: req.headers,
        data: req.body,
      });

      res.status(response.status).send(response.data);
    } catch (err) {
      console.error('❌ Error al reenviar:', err.message);
      res.status(502).send('Error al reenviar la solicitud');
    }
  } else {
    res.status(429).send('Demasiadas solicitudes – espera un momento');
  }
});

app.listen(1999, () => {
  console.log('Proxy con Token Bucket corriendo en http://localhost:1999');
});
