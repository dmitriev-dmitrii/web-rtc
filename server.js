// server.js
const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public')); // Папка для статических файлов (например, index.html)

const wsClients = []

wss.on('connection', (ws) => {
    console.log('Новое соединение');

    ws.on('message', (message) => {
        console.log('msg', message.type , message.from)
        // Распространяем сообщение всем подключенным клиентам
        wss.clients.forEach((client) => {


            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(JSON.stringify(JSON.parse(message)));
            }
        });
    });

    ws.on('close', () => {
        console.log('Соединение закрыто');
    });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});