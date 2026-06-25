/**
 * Rutas de usuarios y autenticación.
 * Base: /api/usuarios
 */

const express = require('express');
const router = express.Router();

const {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
  obtenerSesion,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
} = require('../controllers/usuarios.controller');

const { requireAuth } = require('../middlewares/auth.middleware');

// ---------- Autenticación ----------
router.post('/registro', registrarUsuario);   // POST /api/usuarios/registro
router.post('/login', loginUsuario);          // POST /api/usuarios/login
router.post('/logout', logoutUsuario);        // POST /api/usuarios/logout
router.get('/sesion', obtenerSesion);         // GET  /api/usuarios/sesion

// ---------- CRUD de usuarios (rutas protegidas) ----------
router.get('/', requireAuth, obtenerUsuarios);          // GET    /api/usuarios
router.get('/:id', requireAuth, obtenerUsuarioPorId);   // GET    /api/usuarios/:id
router.put('/:id', requireAuth, actualizarUsuario);     // PUT    /api/usuarios/:id
router.delete('/:id', requireAuth, eliminarUsuario);    // DELETE /api/usuarios/:id

module.exports = router;
