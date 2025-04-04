require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const https = require('https');

const locationRoutes = require('./routes/locationRoutes');
const timeSeriesRoutes = require('./routes/timeseriesRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'keys', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'keys', 'cert.pem'))
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'vue')));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur MongoDB :', err));

app.use('/api/locations', locationRoutes);
app.use('/api/timeseries', timeSeriesRoutes);

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`🔒 Serveur HTTPS lancé sur https://localhost:${PORT}`);
});
