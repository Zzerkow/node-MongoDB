const express = require("express");
const router = express.Router();
const Location = require("../models/LocationModel");

// Ajouter une localisation
router.post("/", async (req, res) => {
  const { name, longitude, latitude } = req.body;
  const location = new Location({
    name,
    coordinates: { coordinates: [longitude, latitude] }
  });
  await location.save();
  res.status(201).send(location);
});

// Récupérer toutes les localisations
router.get("/", async (req, res) => {
  const locations = await Location.find();
  res.send(locations);
});