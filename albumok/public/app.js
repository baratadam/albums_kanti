const albumForm = document.getElementById('albumForm');
const albumList = document.getElementById('albumList');

// Albumok betöltése
function loadAlbums() {
  fetch('/api/albums')
    .then(response => response.json())
    .then(data => {
      albumList.innerHTML = '';
      data.albums.forEach(album => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="album-info">
            <strong>${album.artist}</strong> - ${album.title} (${album.year}) [${album.genre}]
          </div>
          <div class="album-actions">
            <button onclick="viewAlbum(${album.id})">👁️</button>
            <button onclick="editAlbum(${album.id})">✏️</button>
            <button onclick="deleteAlbum(${album.id})">🗑️</button>
          </div>
        `;
        albumList.appendChild(li);
      });
    });
}


// Új album hozzáadása
albumForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newAlbum = {
    artist: document.getElementById('artist').value,
    title: document.getElementById('title').value,
    year: document.getElementById('year').value,
    genre: document.getElementById('genre').value
  };
  fetch('/api/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newAlbum)
  })
  .then(() => {
    albumForm.reset();
    loadAlbums();
  });
});

// Album megtekintése
function viewAlbum(id) {
  fetch(`/api/albums/${id}`)
    .then(response => response.json())
    .then(data => {
      alert(`Album részletei:\n\nZenekar: ${data.album.artist}\nCím: ${data.album.title}\nÉv: ${data.album.year}\nMűfaj: ${data.album.genre}`);
    });
}

// Album szerkesztése
function editAlbum(id) {
  const artist = prompt('Új zenekar neve:');
  const title = prompt('Új album címe:');
  const year = prompt('Új kiadás éve:');
  const genre = prompt('Új műfaj:');

  fetch(`/api/albums/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artist, title, year, genre })
  })
  .then(() => loadAlbums());
}

// Album törlése
function deleteAlbum(id) {
  if (confirm('Biztosan törölni akarod az albumot?')) {
    fetch(`/api/albums/${id}`, {
      method: 'DELETE'
    })
    .then(() => loadAlbums());
  }
}

// Betöltéskor albumok betöltése
loadAlbums();
