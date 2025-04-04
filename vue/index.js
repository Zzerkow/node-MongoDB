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

// Formulaire classique (adresse manuelle)
const form = document.getElementById('addForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const address = document.getElementById('address').value;

  const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const geoData = await geoRes.json();

  if (!geoData.length) {
    alert("Adresse introuvable !");
    return;
  }

  const lat = parseFloat(geoData[0].lat);
  const lng = parseFloat(geoData[0].lon);

  await saveAndDisplayPoint(name, lat, lng);
  form.reset();
});

// Fonction utilitaire pour envoyer à MongoDB et afficher sur carte
async function saveAndDisplayPoint(name, lat, lng) {
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

  const marker = L.marker([lat, lng]).addTo(map).bindPopup(name).openPopup();
  map.setView([lat, lng], 16);
}

// 👉 Clic sur la carte
map.on('click', async function (e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  // Reverse geocoding pour récupérer l'adresse
  const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  const reverseData = await reverseRes.json();

  const address = reverseData.display_name || 'Adresse inconnue';

  // Créer un mini-formulaire sur la carte
  const popupContent = `
    <strong>Adresse détectée :</strong><br>${address}<br><br>
    <input type="text" id="popupTitle" placeholder="Titre du bon plan" style="width:100%; margin-top:5px;" />
    <button id="popupSave" style="margin-top:5px;">Ajouter</button>
  `;

  const popup = L.popup()
    .setLatLng([lat, lng])
    .setContent(popupContent)
    .openOn(map);

  // Attendre que le DOM du popup soit prêt
  setTimeout(() => {
    document.getElementById('popupSave').addEventListener('click', async () => {
      const name = document.getElementById('popupTitle').value;
      if (!name) return alert("Merci d’entrer un titre !");
      await saveAndDisplayPoint(name, lat, lng);
      map.closePopup();
    });
  }, 100);
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
