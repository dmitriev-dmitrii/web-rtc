// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.json());
app.use(express.static('public'));

let offersData = {}
app.get('/offers', (req, res)=>{
    res.send(offersData)
})

app.post('/offers', ({body}, res)=> {
    const {userId} = body

    if (!userId) {
        res.sendStatus(400)
        return
    }

    offersData[userId] = body
    res.sendStatus(200)
})
wss.on('connection', (ws, { url }) => {

        const params = new URLSearchParams( url )

        const userId = params.get('userId')

        console.log('Новый пользователь подключен', userId );

    ws._userId = userId

    ws.on('message', (message) => {

        const data = JSON.parse(message)
        data.from = ws._userId

        console.log(data.type , ws._userId)

        if (data.type === 'offer') {
            offerData = data
            return
        }

        wss.clients.forEach((client) => {

            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        offersData[ws._userId] = undefined
        console.log('Пользователь отключился', ws._userId );
    });
});

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
