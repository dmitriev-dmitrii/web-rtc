window.socket = new WebSocket(`ws://${window.location.host}?userId=${window.userId}&roomId=123`);

const onMessageHandlers = new Map()

socket.onopen = () => {
    console.log('Соединение с сервером установлено');
    // Отправляем сообщение о новом пользователе
    socket.send(JSON.stringify({ type: 'new-user', userId }));
};

socket.onmessage = (event)=> {
    const payload = JSON.parse(event.data);
    const {type} = payload

    if (onMessageHandlers.get(type)) {
        onMessageHandlers.get(type).forEach((cb)=>{
            cb(payload)
        })
    }

}

export const sendWsMessage = (payload)=> {
    socket.send(JSON.stringify(payload))
}

export const setupOnWsMessageHandlers  =  (payload = { })=> {

    Object.entries(payload).forEach(([key,value])=> {

        if ( !onMessageHandlers.has(key)) {
            onMessageHandlers.set( key, [  ]  )
        }

        onMessageHandlers.get( key ).push(value)
    })

}



