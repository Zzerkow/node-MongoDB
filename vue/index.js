const map = L.map('map').setView([45.18, 5.73], 13);
const markers = [];
let currentPeriod = "10min";

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// === Charger tous les points + mesures ===
async function loadAllLocationsAndData() {
  const res = await fetch('/api/locations');
  const locations = await res.json();

  // Supprimer les anciens markers
  markers.forEach(m => map.removeLayer(m));
  markers.length = 0;

  for (const loc of locations) {
    const [lng, lat] = loc.coordinates.coordinates;

    const tsRes = await fetch(`/api/timeseries/${loc._id}?period=${currentPeriod}`);
    const tsData = await tsRes.json();

    if (!tsData.length) continue; // ❌ Ne pas afficher si aucune donnée

    const tsHtml = tsData.map(d =>
      `<li>${new Date(d.timestamp).toLocaleTimeString()} — ${d.value}</li>`
    ).join('');

    const popupContent = `
      <strong>${loc.name}</strong><br/>
      <button onclick="deleteLocation('${loc._id}', ${lat}, ${lng})" style="margin-top:5px;">🗑️ Supprimer</button>
      <hr>
      <strong>Mesures (${currentPeriod})</strong><ul>${tsHtml}</ul>
    `;


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
  document.getElementById('addForm').reset();
});

// === Ajouter un point en cliquant sur la carte ===
map.on('click', async function (e) {
  const lat = e.latlng.lat;
  const lng = e.latlng.lng;

  const reverseRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  const reverseData = await reverseRes.json();
  const address = reverseData.display_name || 'Adresse inconnue';
  document.getElementById('address').value = address;

  const popupContent = `
    <strong>Adresse détectée :</strong><br>${address}<br><br>
    <input type="text" id="popupTitle" placeholder="Titre du bon plan" style="width:100%; margin-top:5px;" />
    <button id="popupSave" style="margin-top:5px;">Ajouter</button>
  `;

  const popup = L.popup()
    .setLatLng([lat, lng])
    .setContent(popupContent)
    .openOn(map);

  setTimeout(() => {
    document.getElementById('popupSave').addEventListener('click', async () => {
      const name = document.getElementById('popupTitle').value;
      if (!name) return alert("Merci d’entrer un titre !");
      await saveAndDisplayPoint(name, lat, lng);
      map.closePopup();
    });
  }, 100);
});

// === Fonction d'ajout d'un point + première Time Series ===
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

  // Injection d'une première mesure time series
  await fetch('/api/timeseries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value: parseFloat((20 + Math.random() * 5).toFixed(2)),
      locationId: saved._id
    })
  });

  loadAllLocationsAndData(); // rechargement de la carte
}

// === Suppression d’un point ===
async function deleteLocation(id, lat, lng) {
  if (!confirm("Supprimer ce point ?")) return;

  await fetch(`/api/locations/${id}`, { method: 'DELETE' });

  loadAllLocationsAndData();
}

// === Sélection de la période (filtrage) ===
document.getElementById('timeFilter').addEventListener('change', (e) => {
  currentPeriod = e.target.value;
  loadAllLocationsAndData();
});

// === Initialisation ===
loadAllLocationsAndData();
