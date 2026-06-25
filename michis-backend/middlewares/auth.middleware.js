/**
 * Middleware de autenticación basado en sesiones.
 * Verifica que el usuario haya iniciado sesión
 * (req.session.usuario debe existir) antes de
 * permitir el acceso a rutas protegidas.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }

  return res.status(401).json({
    ok: false,
    mensaje: 'No autorizado. Debes iniciar sesión para acceder a este recurso.'
  });
}

module.exports = { requireAuth };
