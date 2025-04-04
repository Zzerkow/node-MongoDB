require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const locationRoutes = require('./routes/locationRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'keys', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'keys', 'cert.pem')) // Remplacez par le chemin de votre certificat
};

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'vue')));

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté !'))
  .catch(err => console.error('Erreur MongoDB :', err));

// Routes API
app.use('/api/locations', locationRoutes);

// Lancer le serveur
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Serveur sécurisé en HTTPS sur le port ${PORT}`);
});
