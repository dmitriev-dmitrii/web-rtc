import {userId} from "./web-rtc/useWebRtcStore.js";

window.socket = new WebSocket(`ws://${window.location.host}?userId=${userId}&roomId=123`);

const onMessageHandlers = new Map()

socket.onopen = () => {
    console.log('Соединение с сервером установлено');
};

socket.onclose = () => {
    console.log('Соединение с сервером закрыто');
    wsOnlineClientsDom.innerText = JSON.stringify([])
};

socket.onmessage = async (event) => {
    const payload = JSON.parse(event.data);
    const {type} = payload

    if (onMessageHandlers.get(type)) {
        onMessageHandlers.get(type).forEach((cb) => {
            cb(payload)
        })
    }

}

export const sendWebSocketMessage = (payload) => {
    socket.send(JSON.stringify(payload))
}
export const setupOnWsMessageCallbaks = (payload = {}) => {

    Object.entries(payload).forEach(([key, ...value]) => {

        if (!onMessageHandlers.has(key)) {
            onMessageHandlers.set(key, [])
        }


        onMessageHandlers.set(key, [...onMessageHandlers.get(key), ...value.flat()])
    })

}



