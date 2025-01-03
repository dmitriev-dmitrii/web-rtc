const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));

let offersData = {}
app.get('/offers:userId', ({params}, res)=> {

    const {userId} = params

    res.send(offersData[userId])
})

app.post('/offers', ({body}, res)=> {
    const {userId , offer} = body

    if (!userId || !offer) {
        res.sendStatus(400)
        return
    }

    offersData[userId] = offer
    res.send(offersData)
})


wss.on('connection', (ws , { url , headers}) => {

    const params = new URL(url, `https://${headers.host}`)

    ws._userId =  params.searchParams.get('userId')

    const payload = {
        from:'wss',
        type:'ws-connection',
        data : {
            wsClientsOnline: wss.clients.size,
            userId: ws._userId,
        }
    }

    wss.clients.forEach((client) => {
        client.send(JSON.stringify(payload));
    });


    ws.on('message', (message) => {
        const data = JSON.parse(message)

        data.from = ws._userId

        if (data.to) {
            
         const targetWsClient = wss.clients.find((ws)=> {
            return  ws._userId === data.to
         })
            
         delete data.to
         targetWsClient.send(JSON.stringify(data))
         return

        }

        wss.clients.forEach((client) => {

            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }

        });
    });

    ws.on('close', () => {

        delete  offersData[ws._userId]

        const payload = {
            from:'wss',
            type:'ws-close',
            data : {
                wsClientsOnline: wss.clients.size,
                userId:ws._userId,
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
