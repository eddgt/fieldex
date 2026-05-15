function errorHandler(err, req, res, _next) {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Recurso no encontrado' });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Ya existe un registro con esos datos' });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;
