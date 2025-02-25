// src/utils/error-handler.js
const errorHandler = (err, req, res, next) => {
	console.error("Global error handler:", err); // Логирование ошибки
	res.status(err.statusCode || 500).json({
		error: {
			message: err.message || 'Internal Server Error',
			code: err.code || 'INTERNAL_ERROR'
		}
	});
};

export default errorHandler;