/**
 * Servidor principal - Michis for Home API
 * Proyecto académico - Evidencia GA4-220501096-AA1-EV01
 *
 * API REST construida con Node.js + Express + MySQL.
 * Autenticación mediante sesiones simples (express-session).
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const { verificarConexion } = require('./config/db');

const usuariosRoutes = require('./routes/usuarios.routes');
const gatosRoutes = require('./routes/gatos.routes');
const adopcionesRoutes = require('./routes/adopciones.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir archivos estáticos del frontend y uploads
app.use(express.static(path.join(__dirname, '..', 'michis-frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Middlewares globales ----------
app.use(cors({
  origin: true,        // permite peticiones desde el frontend
  credentials: true    // necesario para que las cookies de sesión funcionen
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'michis_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,       // cambiar a true si se usa HTTPS
    maxAge: 1000 * 60 * 60 * 2 // 2 horas
  }
}));

// ---------- Rutas ----------
app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API de Michis for Home funcionando correctamente 🐾',
    endpoints: {
      usuarios: '/api/usuarios',
      gatos: '/api/gatos',
      adopciones: '/api/adopciones'
    }
  });
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/gatos', gatosRoutes);
app.use('/api/adopciones', adopcionesRoutes);

// ---------- Manejo de rutas no encontradas ----------
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Recurso no encontrado.' });
});

// ---------- Manejo global de errores ----------
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ ok: false, mensaje: 'La imagen no debe superar los 5 MB.' });
  }
  if (err.message && err.message.includes('Solo se permiten')) {
    return res.status(400).json({ ok: false, mensaje: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ ok: false, mensaje: 'Error interno del servidor.' });
});

// ---------- Iniciar servidor ----------
app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  await verificarConexion();
});
