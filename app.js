const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`L'API est correctement connecté à MongoDB`))
  .catch(err => console.error("Erreur de connexion :", err));