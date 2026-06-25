/**
 * Controller de gatos.
 * CRUD completo de gatos (disponibles y adoptados).
 */

const { pool } = require('../config/db');

/**
 * GET /api/gatos
 * Lista todos los gatos. Permite filtrar por estado
 * mediante query string: /api/gatos?estado=disponible
 */
async function obtenerGatos(req, res) {
  try {
    const { estado } = req.query;

    let consulta = 'SELECT * FROM gatos';
    const valores = [];

    if (estado) {
      consulta += ' WHERE estado = ?';
      valores.push(estado);
    }

    consulta += ' ORDER BY id DESC';

    const [filas] = await pool.query(consulta, valores);
    return res.json({ ok: true, data: filas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener los gatos.' });
  }
}

/**
 * GET /api/gatos/:id
 * Obtiene un gato por su id.
 */
async function obtenerGatoPorId(req, res) {
  try {
    const { id } = req.params;

    const [filas] = await pool.query('SELECT * FROM gatos WHERE id = ?', [id]);

    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Gato no encontrado.' });
    }

    return res.json({ ok: true, data: filas[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener el gato.' });
  }
}

/**
 * POST /api/gatos
 * Crea un nuevo gato (registrar gato propio / dar en adopción).
 */
async function crearGato(req, res) {
  try {
    const {
      nombre,
      edad,
      descripcion,
      personalidad,
      vacunas,
      estado_salud,
      estado,
      usuario_id
    } = req.body;

    if (!nombre || !edad) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos nombre y edad son obligatorios.'
      });
    }

    const imagen_url = req.file ? '/uploads/' + req.file.filename : null;

    const [resultado] = await pool.query(
      `INSERT INTO gatos
        (nombre, edad, descripcion, personalidad, vacunas, estado_salud, imagen_url, estado, usuario_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        edad,
        descripcion || null,
        personalidad || null,
        vacunas || 'Al día',
        estado_salud || null,
        imagen_url,
        estado || 'disponible',
        usuario_id || null
      ]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Gato registrado correctamente.',
      data: { id: resultado.insertId, nombre, edad, imagen_url }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar el gato.' });
  }
}

/**
 * PUT /api/gatos/:id
 * Actualiza los datos de un gato. También permite
 * marcarlo como adoptado enviando estado="adoptado",
 * fecha_adopcion y mensaje_adopcion.
 */
async function actualizarGato(req, res) {
  try {
    const { id } = req.params;
    const {
      nombre,
      edad,
      descripcion,
      personalidad,
      vacunas,
      estado_salud,
      imagen_url,
      estado,
      fecha_adopcion,
      mensaje_adopcion
    } = req.body;

    const [filas] = await pool.query('SELECT id FROM gatos WHERE id = ?', [id]);
    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Gato no encontrado.' });
    }

    const campos = [];
    const valores = [];

    const posiblesCampos = {
      nombre, edad, descripcion, personalidad,
      vacunas, estado_salud, imagen_url, estado,
      fecha_adopcion, mensaje_adopcion
    };

    for (const [campo, valor] of Object.entries(posiblesCampos)) {
      if (valor !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(valor);
      }
    }

    if (campos.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'No se enviaron campos para actualizar.' });
    }

    valores.push(id);

    await pool.query(
      `UPDATE gatos SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    return res.json({ ok: true, mensaje: 'Gato actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el gato.' });
  }
}

/**
 * DELETE /api/gatos/:id
 * Elimina un gato.
 */
async function eliminarGato(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query('DELETE FROM gatos WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Gato no encontrado.' });
    }

    return res.json({ ok: true, mensaje: 'Gato eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el gato.' });
  }
}

module.exports = {
  obtenerGatos,
  obtenerGatoPorId,
  crearGato,
  actualizarGato,
  eliminarGato
};
