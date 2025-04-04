const map = L.map('map').setView([45.18, 15.73], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

fetch('/api/locations')
  .then(res => res.json())
  .then(locations => {
    console.log(locations); // Vérifiez ici la structure des données
    locations.forEach(loc => {
      const [lng, lat] = loc.coordinates.coordinates;
      const marker = L.marker([lat, lng]).addTo(map).bindPopup(loc.name).openPopup();
      const popupContent = `
        <strong>${loc.name}</strong><br/>
        <button onclick="deleteLocation('${loc._id}', ${lat}, ${lng})" style="margin-top:5px;">Supprimer</button>
      `;
      marker.bindPopup(popupContent);
    });
  });


// Formulaire classique (adresse manuelle)
const form = document.getElementById('addForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  try{
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
  }catch(e){
    console.error(e);
    alert("Erreur lors de la soumission du formulaire.");
  }
});

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
  if (!saved) {
    alert("Erreur lors de l'enregistrement du point.");
    return;
  }
  const popupContent = `
    <strong>${saved.name}</strong><br/>
    <button onclick="deleteLocation('${saved._id}', ${lat}, ${lng})" style="margin-top:5px;">Supprimer</button>
  `;

  const marker = L.marker([lat, lng]).addTo(map).bindPopup(popupContent).openPopup();
  map.setView([lat, lng], 16);
}

async function deleteLocation(id, lat, lng) {
  if (!confirm("Supprimer ce point ?")) return;

  const res = await fetch(`/api/locations/${id}`, {
    method: 'DELETE'
  });

  if (res.ok) {
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        const pos = layer.getLatLng();
        if (pos.lat === lat && pos.lng === lng) {
          map.removeLayer(layer);
        }
      }
    });
  } else {
    alert("Erreur lors de la suppression.");
  }
}


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
