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

// Gérer le formulaire d’ajout
const form = document.getElementById('addForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const lat = parseFloat(document.getElementById('lat').value);
  const lng = parseFloat(document.getElementById('lng').value);

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

  // Afficher le nouveau point sur la carte
  L.marker([lat, lng]).addTo(map).bindPopup(name);

  form.reset();
});
