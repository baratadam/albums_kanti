const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public')); // A public mappából szerválja a frontendet

// Adatbázis kapcsolat
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Hiba az adatbázis megnyitásakor:', err.message);
    } else {
        console.log('Kapcsolódva az SQLite adatbázishoz.');
    }
});

// Adatbázis tábla létrehozása, ha még nem létezik
db.run(`CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artist TEXT NOT NULL,
    title TEXT NOT NULL,
    year INTEGER,
    genre TEXT
)`);

// API végpontok

// Összes album lekérése
app.get('/api/albums', (req, res) => {
    db.all('SELECT * FROM albums', [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ albums: rows });
    });
});

// Új album hozzáadása
app.post('/api/albums', (req, res) => {
    const { artist, title, year, genre } = req.body;
    db.run(
        `INSERT INTO albums (artist, title, year, genre) VALUES (?, ?, ?, ?)`,
        [artist, title, year, genre],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        }
    );
});

// Egy album részletei
app.get('/api/albums/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM albums WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ album: row });
    });
});

// Album módosítása
app.put('/api/albums/:id', (req, res) => {
    const { id } = req.params;
    const { artist, title, year, genre } = req.body;
    db.run(
        `UPDATE albums SET artist = ?, title = ?, year = ?, genre = ? WHERE id = ?`,
        [artist, title, year, genre, id],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ updated: this.changes });
        }
    );
});

// Album törlése
app.delete('/api/albums/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM albums WHERE id = ?', id, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Szerver fut: http://localhost:${PORT}`);
});
