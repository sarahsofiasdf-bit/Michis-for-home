/**
 * Rutas de solicitudes de adopción (CRUD completo).
 * Base: /api/adopciones
 */

const express = require('express');
const router = express.Router();

const {
  obtenerAdopciones,
  obtenerAdopcionPorId,
  crearAdopcion,
  actualizarAdopcion,
  eliminarAdopcion
} = require('../controllers/adopciones.controller');

// GET    /api/adopciones       -> lista todas las solicitudes
// GET    /api/adopciones/:id   -> detalle de una solicitud
// POST   /api/adopciones       -> crear solicitud (formulario de adopción)
// PUT    /api/adopciones/:id   -> actualizar estado (pendiente/aprobada/rechazada)
// DELETE /api/adopciones/:id   -> eliminar solicitud

router.get('/', obtenerAdopciones);
router.get('/:id', obtenerAdopcionPorId);
router.post('/', crearAdopcion);
router.put('/:id', actualizarAdopcion);
router.delete('/:id', eliminarAdopcion);

module.exports = router;
