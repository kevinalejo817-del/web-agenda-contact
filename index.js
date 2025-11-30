const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Crear tabla contacts si no existe
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    numero TEXT NOT NULL,
    fecha_creada TEXT NOT NULL
  )`);
});

// Página principal - lista contactos
app.get('/', (req, res) => {
  db.all('SELECT * FROM contacts ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error cargando contactos');
    }
    res.render('index', { contactos: rows });
  });
});

// Formulario nuevo contacto
app.get('/nuevo', (req, res) => {
  res.render('nuevo');
});

// Guardar contacto (fecha automática)
app.post('/guardar', (req, res) => {
  const { nombre, apellido, numero } = req.body;
  if (!nombre || !apellido || !numero) {
    return res.status(400).send('Completa todos los campos');
  }
  const fecha_creada = new Date().toISOString();
  db.run('INSERT INTO contacts (nombre, apellido, numero, fecha_creada) VALUES (?, ?, ?, ?)',
    [nombre, apellido, numero, fecha_creada],
    function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Error guardando contacto');
      }
      res.redirect('/');
    });
});

// Eliminar contacto
app.post('/eliminar/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM contacts WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Error eliminando contacto');
    }
    res.redirect('/');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
