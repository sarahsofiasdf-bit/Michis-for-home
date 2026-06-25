/**
 * Controller de usuarios.
 * Maneja el CRUD de usuarios y la autenticación
 * (registro, login, logout) mediante sesiones.
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;

/**
 * POST /api/usuarios/registro
 * Crea un nuevo usuario (contraseña hasheada con bcrypt).
 */
async function registrarUsuario(req, res) {
  try {
    const { nombre_completo, correo, password, telefono } = req.body;

    if (!nombre_completo || !correo || !password || !telefono) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos nombre_completo, correo, telefono y password son obligatorios.'
      });
    }

    // Verificar que el correo no esté registrado
    const [existentes] = await pool.query(
      'SELECT id FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        ok: false,
        mensaje: 'Ya existe un usuario registrado con este correo.'
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre_completo, correo, password, telefono) VALUES (?, ?, ?, ?)',
      [nombre_completo, correo, passwordHash, telefono || null]
    );

    return res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado correctamente.',
      data: {
        id: resultado.insertId,
        nombre_completo,
        correo,
        telefono: telefono || null
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al registrar el usuario.' });
  }
}

/**
 * POST /api/usuarios/login
 * Valida credenciales y crea una sesión.
 */
async function loginUsuario(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Los campos correo y password son obligatorios.'
      });
    }

    const [filas] = await pool.query(
      'SELECT id, nombre_completo, correo, password, telefono FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (filas.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
    }

    const usuario = filas[0];
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
    }

    // Guardar datos básicos en la sesión (sin la contraseña)
    req.session.usuario = {
      id: usuario.id,
      nombre_completo: usuario.nombre_completo,
      correo: usuario.correo,
      telefono: usuario.telefono
    };

    return res.json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso.',
      data: req.session.usuario
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al iniciar sesión.' });
  }
}

/**
 * POST /api/usuarios/logout
 * Destruye la sesión actual.
 */
function logoutUsuario(req, res) {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false, mensaje: 'Error al cerrar sesión.' });
    }
    res.clearCookie('connect.sid');
    return res.json({ ok: true, mensaje: 'Sesión cerrada correctamente.' });
  });
}

/**
 * GET /api/usuarios/sesion
 * Retorna los datos del usuario autenticado (si existe sesión).
 */
async function obtenerSesion(req, res) {
  if (req.session && req.session.usuario) {
    const [filas] = await pool.query(
      'SELECT id, nombre_completo, correo, telefono FROM usuarios WHERE id = ?',
      [req.session.usuario.id]
    );
    if (filas.length > 0) {
      req.session.usuario = filas[0];
    }
    return res.json({ ok: true, autenticado: true, data: req.session.usuario });
  }
  return res.json({ ok: true, autenticado: false, data: null });
}

/**
 * GET /api/usuarios
 * Lista todos los usuarios (sin exponer la contraseña).
 */
async function obtenerUsuarios(req, res) {
  try {
    const [filas] = await pool.query(
      'SELECT id, nombre_completo, correo, telefono, fecha_creacion FROM usuarios ORDER BY id DESC'
    );
    return res.json({ ok: true, data: filas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener los usuarios.' });
  }
}

/**
 * GET /api/usuarios/:id
 * Obtiene un usuario por su id (sin exponer la contraseña).
 */
async function obtenerUsuarioPorId(req, res) {
  try {
    const { id } = req.params;
    const [filas] = await pool.query(
      'SELECT id, nombre_completo, correo, telefono, fecha_creacion FROM usuarios WHERE id = ?',
      [id]
    );

    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    return res.json({ ok: true, data: filas[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al obtener el usuario.' });
  }
}

/**
 * PUT /api/usuarios/:id
 * Actualiza los datos de un usuario.
 * Si se envía "password", se vuelve a hashear.
 */
async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre_completo, correo, password, telefono } = req.body;

    const [filas] = await pool.query('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (filas.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    const campos = [];
    const valores = [];

    if (nombre_completo) {
      campos.push('nombre_completo = ?');
      valores.push(nombre_completo);
    }
    if (correo) {
      campos.push('correo = ?');
      valores.push(correo);
    }
    if (telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(telefono);
    }
    if (password) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      campos.push('password = ?');
      valores.push(passwordHash);
    }

    if (campos.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'No se enviaron campos para actualizar.' });
    }

    valores.push(id);

    await pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );

    return res.json({ ok: true, mensaje: 'Usuario actualizado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al actualizar el usuario.' });
  }
}

/**
 * DELETE /api/usuarios/:id
 * Elimina un usuario.
 */
async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;

    const [resultado] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Usuario no encontrado.' });
    }

    return res.json({ ok: true, mensaje: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, mensaje: 'Error al eliminar el usuario.' });
  }
}

module.exports = {
  registrarUsuario,
  loginUsuario,
  logoutUsuario,
  obtenerSesion,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario
};
