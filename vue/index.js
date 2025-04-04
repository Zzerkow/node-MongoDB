const map = L.map('map').setView([48.8566, 2.3522], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Appel API pour afficher les markers
fetch('/api/locations')
  .then(res => res.json())
  .then(locations => {
    locations.forEach(loc => {
      L.marker(loc.coordinates.coordinates.reverse()).addTo(map)
        .bindPopup(loc.name);
    });
  })
  .catch(err => {
    console.error('Erreur lors de la récupération des localisations :', err);
  });
