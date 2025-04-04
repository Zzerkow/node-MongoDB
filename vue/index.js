const map = L.map('map').setView([48.8566, 2.3522], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Charger les points existants depuis MongoDB
fetch('/api/locations')
    .then(res => res.json())
    .then(locations => {
      locations.forEach(loc => {
        const [lng, lat] = loc.coordinates.coordinates;
        L.marker([lat, lng]).addTo(map)
            .bindPopup(loc.name);
      });
    });

const form = document.getElementById('addForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;

  // Étape 1 : géocoder l'adresse (utilise Nominatim)
  const geocodeURL = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

  const geoRes = await fetch(geocodeURL);
  const geoData = await geoRes.json();

  if (!geoData.length) {
    alert("Adresse introuvable !");
    return;
  }

  const lat = parseFloat(geoData[0].lat);
  const lng = parseFloat(geoData[0].lon);

  // Étape 2 : envoyer les données à MongoDB via l’API
  const body = {
    name,
    coordinates: {
      type: "Point",
      coordinates: [lng, lat]
    }
  };

  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const saved = await res.json();

  // Étape 3 : ajouter le marker et centrer la carte dessus
  const marker = L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
  map.setView([lat, lng], 16); // zoom sur le nouveau point

  form.reset();
});

// Ajouter un événement de clic sur la carte
map.on('click', async (e) => {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // Utiliser les coordonnées pour géocoder l'adresse
  const geocodeURL = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

  const geoRes = await fetch(geocodeURL);
  const geoData = await geoRes.json();

  if (geoData && geoData.address) {
    const address = geoData.address.road + ', ' + geoData.address.city + ', ' + geoData.address.country;

    // Remplir le champ adresse avec l'adresse obtenue
    document.getElementById('address').value = address;
  }
});
