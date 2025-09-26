export const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    details: err.details || undefined
  });
};
