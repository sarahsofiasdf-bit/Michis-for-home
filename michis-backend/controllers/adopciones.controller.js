/**
 * Controller de adopciones.
 * CRUD de solicitudes de adopción enviadas mediante
 * el formulario de adopción del frontend.
 */

const { pool } = require('../config/db');

/**
 * GET /api/adopciones
 * Lista todas las solicitudes de adopción.
 * Incluye datos básicos del gato relacionado.
 */
async function obtenerAdopciones(req, res) {
  try {
    const [filas] = await pool.query(`
      SELECT
        a.id, a.gato_id, a.usuario_id, a.nombre_solicitante,
        a.correo, a.telefono, a.motivo, a.estado, a.fecha_solicitud,
        g.nombre AS nombre_gato, g.imagen_url AS imagen_gato
      FROM adopciones a
      INNER JOIN gatos g ON g.id = a.gato_id
      ORDER BY a.id DESC
    `);

    return res.json({ ok: true, data: filas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener las solicitudes de adopción.' });
  }
}

/**
 * GET /api/adopciones/:id
 * Obtiene una solicitud de adopción por su id.
 */
async function obtenerAdopcionPorId(req, res) {
  try {
    const { id } = req.params;

    const [filas] = await pool.query(`
      SELECT
        a.id, a.gato_id, a.usuario_id, a.nombre_solicitante,
        a.correo, a.telefono, a.motivo, a.estado, a.fecha_solicitud,
        g.nombre AS nombre_gato, g.imagen_url AS imagen_gato
      FROM adopciones a
      INNER JOIN gatos g ON g.id = a.gato_id
      WHERE a.id = ?
    `, [id]);

    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud de adopción no encontrada.' });
    }

    return res.json({ ok: true, data: filas[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener la solicitud de adopción.' });
  }
}

/**
 * POST /api/adopciones
 * Crea una nueva solicitud de adopción (formulario de adopción).
 */
async function crearAdopcion(req, res) {
  try {
    const { gato_id, nombre_solicitante, correo, telefono, motivo, usuario_id } = req.body;

    if (!gato_id || !nombre_solicitante || !correo || !telefono || !motivo) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos gato_id, nombre_solicitante, correo, telefono y motivo son obligatorios.'
      });
    }

    // Verificar que el gato exista
    const [gatos] = await pool.query('SELECT id, estado FROM gatos WHERE id = ?', [gato_id]);
    if (gatos.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'El gato indicado no existe.' });
    }

    const [resultado] = await pool.query(
      `INSERT INTO adopciones
        (gato_id, usuario_id, nombre_solicitante, correo, telefono, motivo)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gato_id, usuario_id || null, nombre_solicitante, correo, telefono, motivo]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Solicitud de adopción enviada correctamente.',
      data: { id: resultado.insertId }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar la solicitud de adopción.' });
  }
}

/**
 * PUT /api/adopciones/:id
 * Actualiza el estado de una solicitud de adopción
 * (pendiente, aprobada, rechazada). Si se aprueba,
 * también se puede marcar el gato como "adoptado".
 */
async function actualizarAdopcion(req, res) {
  try {
    const { id } = req.params;
    const { estado, mensaje_adopcion } = req.body;

    const estadosValidos = ['pendiente', 'aprobada', 'rechazada'];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        mensaje: `El campo estado es obligatorio y debe ser uno de: ${estadosValidos.join(', ')}.`
      });
    }

    const [filas] = await pool.query('SELECT id, gato_id FROM adopciones WHERE id = ?', [id]);
    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud de adopción no encontrada.' });
    }

    await pool.query('UPDATE adopciones SET estado = ? WHERE id = ?', [estado, id]);

    // Si se aprueba la solicitud, se marca el gato como adoptado
    if (estado === 'aprobada') {
      await pool.query(
        `UPDATE gatos SET estado = 'adoptado', fecha_adopcion = CURDATE(), mensaje_adopcion = ? WHERE id = ?`,
        [mensaje_adopcion || null, filas[0].gato_id]
      );
    }

    return res.json({ ok: true, mensaje: 'Solicitud de adopción actualizada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar la solicitud de adopción.' });
  }
}

/**
 * DELETE /api/adopciones/:id
 * Elimina una solicitud de adopción.
 */
async function eliminarAdopcion(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query('DELETE FROM adopciones WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Solicitud de adopción no encontrada.' });
    }

    return res.json({ ok: true, mensaje: 'Solicitud de adopción eliminada correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar la solicitud de adopción.' });
  }
}

module.exports = {
  obtenerAdopciones,
  obtenerAdopcionPorId,
  crearAdopcion,
  actualizarAdopcion,
  eliminarAdopcion
};
