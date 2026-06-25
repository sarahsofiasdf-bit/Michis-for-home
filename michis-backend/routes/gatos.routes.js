/**
 * Rutas de gatos (CRUD completo).
 * Base: /api/gatos
 */

const express = require('express');
const router = express.Router();

const upload = require('../middlewares/upload.middleware');

const {
  obtenerGatos,
  obtenerGatoPorId,
  crearGato,
  actualizarGato,
  eliminarGato
} = require('../controllers/gatos.controller');

// GET    /api/gatos                -> lista todos (o filtra por ?estado=disponible|adoptado)
// GET    /api/gatos/:id             -> detalle de un gato
// POST   /api/gatos                -> crear gato (registrar / dar en adopción)
// PUT    /api/gatos/:id             -> actualizar gato
// DELETE /api/gatos/:id             -> eliminar gato

router.get('/', obtenerGatos);
router.get('/:id', obtenerGatoPorId);
router.post('/', upload.single('imagen'), crearGato);
router.put('/:id', actualizarGato);
router.delete('/:id', eliminarGato);

module.exports = router;
