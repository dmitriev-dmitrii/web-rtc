
const webSocketQueue  = [];
const webSocketMessageHandlersMap = new Map();

const reconnectDelay = 1000; // Начальная задержка в миллисекундах для реконекта
let reconnectAttempts = 0; // Отслеживание количества попыток реконекта

const WEB_SOCKET_URL = 'ws://localhost:4000';
let ws



export const useWebSocket = () => {
    const onWebSocketMessage = async (event) => {
        const { data } = event;
        //@ts-ignore
        const payload = JSON.parse(data);
        const { type } = payload;
        // console.log(payload)
        if (!type && !webSocketMessageHandlersMap.has(type)) {
            console.warn(`WebSocket , onSocketMessage - empty callback for event type:"${type}"`);
            return;
        }

        const callbacksSet = webSocketMessageHandlersMap.get(type);

        if (!callbacksSet) {
            console.warn(`WebSocket No handlers found for event type "${type}"`);
            return;
        }

        try {
            const callbacksPromises = Array.from(callbacksSet).map((callback) => {
                return callback(payload);
            });

            await Promise.all(callbacksPromises);
        } catch (e) {
            console.log(`WebSocket error of ws handle, message type :"${type}", err:` ,e )
        }
    };

    const setupWebSocketMessageHandlers = (eventsMap) => {
        if (!Object.keys(eventsMap).length) {
            return;
        }

        for (const [type, callbacksArr] of Object.entries(eventsMap)) {
            webSocketMessageHandlersMap.set(type , new Set(callbacksArr));
        }
    };

    function sendWebSocketMessage(payload) {

        console.log('asdsad', payload)

        if (ws?.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket is not OPEN , message added to webSocketQueue');
            webSocketQueue.push(payload);
            return;
        }

        ws.send(JSON.stringify(payload));
    }

    const  onWebSocketOpen = async () => {

        console.log('WebSocket connected');
        reconnectAttempts = 0;

        while (webSocketQueue.length > 0) {

            if (ws.readyState !== WebSocket.OPEN) {
                return;
            }

            const message = webSocketQueue.shift();
            sendWebSocketMessage(message)
        }

    };

    const onWebSocketClose = async ({ code, reason }) => {

        if (code === 1005) {
            console.log(`WebSocket closed server force close socket`);
            return
        }

        reconnectAttempts++;
        const delay = Math.min(reconnectDelay * reconnectAttempts, 30000); // Ограничение до 30 секунд
        console.log(`WebSocket reconnect try ${delay}ms...`);

        setTimeout(  () => {
            connectToWebSocket();
        }, delay);
    };

    const  onWebSocketError = async  (error) => {
        if (!reconnectAttempts) {
            console.error('WebSocket error:', error);
        }
    };

    const connectToWebSocket = async () => {
        return new Promise((resolve, reject) => {

            // ws = new WebSocket(`${WEB_SOCKET_URL}?meetId=${unref(meetId)}`);
            ws = new WebSocket(`${WEB_SOCKET_URL}`); // todo ref meetid

            ws.onmessage = onWebSocketMessage
            ws.onerror = onWebSocketError
            ws.onclose = onWebSocketClose

            ws.onopen = () => {
                onWebSocketOpen(ws)
                resolve(ws)
            }

        })
    };

    return {
        setupWebSocketMessageHandlers,
        sendWebSocketMessage,
        connectToWebSocket,
    };
};


