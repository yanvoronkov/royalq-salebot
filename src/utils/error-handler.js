// src/utils/error-handler.js
const errorHandler = (err, req, res, next) => {
	console.error("Global error handler:", err); // Логирование ошибки

	// Обрабатываем ошибки дублирования MongoDB
	if (err.code === 11000) {
		// Извлекаем поле, которое вызвало дублирование
		const field = Object.keys(err.keyPattern || {})[0] || 'field';
		const value = err.keyValue ? err.keyValue[field] : 'unknown';

		return res.status(409).json({
			error: {
				message: `Duplicate value for ${field}: "${value}" already exists`,
				code: 'DUPLICATE_ERROR',
				field: field,
				value: value
			}
		});
	}

	// Обрабатываем кастомные ошибки дублирования
	if (err.code === 'DUPLICATE_REFERAL') {
		return res.status(409).json({
			error: {
				message: err.message,
				code: 'DUPLICATE_REFERAL'
			}
		});
	}

	// Обрабатываем ошибки валидации Mongoose
	if (err.name === 'ValidationError') {
		const errors = Object.values(err.errors).map(e => e.message);
		return res.status(400).json({
			error: {
				message: 'Validation Error',
				code: 'VALIDATION_ERROR',
				details: errors
			}
		});
	}

	// Обрабатываем ошибки кастинга Mongoose
	if (err.name === 'CastError') {
		return res.status(400).json({
			error: {
				message: `Invalid ${err.path}: ${err.value}`,
				code: 'CAST_ERROR'
			}
		});
	}

	// Стандартная обработка ошибок
	res.status(err.statusCode || 500).json({
		error: {
			message: err.message || 'Internal Server Error',
			code: err.code || 'INTERNAL_ERROR'
		}
	});
};

export default errorHandler;