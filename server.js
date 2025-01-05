const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

wss.on('connection', (ws , { url , headers}) => {

    const params = new URL(url, `https://${headers.host}`)

    ws._userId =  params.searchParams.get('userId')

    if ( !ws._userId ) {
        ws.close()
    }

    const payload = {
        from:'wss',
        type:'ws-connection',
        data : {
            wsClientsOnline: Array.from(wss.clients).map(( {_userId} )=> _userId) ,
        }
    }

    wss.clients.forEach((client) => {
        client.send(JSON.stringify(payload));
    });


    ws.on('message', (payload) => {

        let data = JSON.parse(payload);
        data.from = ws._userId;

        if (data.to) {
            const targetWsUser = [...wss.clients].find((item) => item._userId === data.to);
            delete data.to;

            if (targetWsUser && targetWsUser.readyState === WebSocket.OPEN) {
                targetWsUser.send(JSON.stringify(data));
            }
            return;
        }

        data = JSON.stringify(data)

        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => {

        const payload = {
            from:'wss',
            type:'ws-close',
            data : {
                wsClientsOnline:  Array.from(wss.clients).map(( {_userId} )=> _userId),
            }
        }

        wss.clients.forEach((client) => {
            client.send(JSON.stringify(payload));
        });

    });
});

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
