// src/server.js
import app from './app.js'; // <--- Важно, импорт app из app.js
import * as http from 'http';

const PORT = process.env.PORT || 3000; // <--- Получение порта

const server = http.createServer(app); // <--- Создание HTTP сервера на основе app

server.listen(PORT, () => { // <--- **Вот эта часть важна: server.listen()**
	console.log(`Server listening on port ${PORT}`); // <--- Сообщение о запуске сервера
});