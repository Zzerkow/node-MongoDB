require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3001;

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, 'keys', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'keys', 'cert.pem')) // Remplacez par le chemin de votre certificat
};

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté !'))
  .catch(err => console.error('Erreur MongoDB :', err));

// Pour parser du JSON si besoin
app.use(express.json());

// Servir le fichier HTML de /vue
app.use(express.static(path.join(__dirname, 'vue')));

// Exemple de route API : renvoie des localisations depuis la base
app.get('/api/locations', async (req, res) => {
  // Exemple simplifié — à remplacer avec un vrai modèle Mongoose
  const fakeLocations = [
    { name: 'Tour Eiffel', coordinates: { coordinates: [2.2945, 48.8584] } },
    { name: 'Notre-Dame', coordinates: { coordinates: [2.3499, 48.8527] } }
  ];
  res.json(fakeLocations);
});

// Lancer le serveur
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`Serveur sécurisé en HTTPS sur le port ${PORT}`);
});
