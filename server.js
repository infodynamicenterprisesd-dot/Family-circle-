const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10mb so check-in photos (base64) fit

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { owners: {}, members: {}, locations: {}, checkins: {}, settings: {} };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db));
}

// --- Owner claim: first person to join a code becomes owner ---
app.post('/api/owner/claim', (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  const db = readDB();
  if (!db.owners[code]) {
    db.owners[code] = name;
    writeDB(db);
    return res.json({ isOwner: true });
  }
  res.json({ isOwner: db.owners[code] === name });
});

// --- Members ---
app.post('/api/member', (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  const db = readDB();
  if (!db.members[code]) db.members[code] = {};
  db.members[code][name] = { name, joinedAt: Date.now() };
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/members/:code', (req, res) => {
  const db = readDB();
  const m = db.members[req.params.code] || {};
  res.json(Object.values(m));
});

app.delete('/api/member/:code/:name', (req, res) => {
  const { code, name } = req.params;
  const db = readDB();
  if (db.members[code]) delete db.members[code][name];
  if (db.locations[code]) delete db.locations[code][name];
  writeDB(db);
  res.json({ ok: true });
});

// --- Locations ---
app.post('/api/location', (req, res) => {
  const { code, name, lat, lng, ts } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  const db = readDB();
  if (!db.locations[code]) db.locations[code] = {};
  db.locations[code][name] = { name, lat, lng, ts: ts || Date.now() };
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/locations/:code', (req, res) => {
  const db = readDB();
  const l = db.locations[req.params.code] || {};
  res.json(Object.values(l));
});

// --- Check-ins ---
app.post('/api/checkin', (req, res) => {
  const { code, name, photo, ts, lat, lng } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });
  const db = readDB();
  if (!db.checkins[code]) db.checkins[code] = [];
  db.checkins[code].push({ name, photo, ts: ts || Date.now(), lat: lat ?? null, lng: lng ?? null });
  // keep storage bounded — last 100 check-ins per circle
  if (db.checkins[code].length > 100) db.checkins[code] = db.checkins[code].slice(-100);
  writeDB(db);
  res.json({ ok: true });
});

app.get('/api/checkins/:code', (req, res) => {
  const db = readDB();
  const list = (db.checkins[req.params.code] || [])
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 20);
  res.json(list);
});

// --- Settings (circle display name) ---
app.get('/api/settings/:code', (req, res) => {
  const db = readDB();
  res.json(db.settings[req.params.code] || {});
});

app.post('/api/settings', (req, res) => {
  const { code, displayName } = req.body;
  if (!code) return res.status(400).json({ error: 'code required' });
  const db = readDB();
  db.settings[code] = { displayName };
  writeDB(db);
  res.json({ ok: true });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Family Circle backend running on port ' + PORT));
