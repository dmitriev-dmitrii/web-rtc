
const peerConnection = await new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

const chanelOptions = {}

const chanel  = await peerConnection.createDataChannel("rtc-chanel", chanelOptions );

chanel.onopen = () => {
    console.log("Канал открыт");
};
chanel.onclose = () => {
    console.log("Канал закрыт");
};





// { url: 'stun:stun01.sipphone.com' },
// { url: 'stun:stun.ekiga.net' },
// { url: 'stun:stunserver.org' },
// { url: 'stun:stun.softjoys.com' },
// { url: 'stun:stun.voiparound.com' },
// { url: 'stun:stun.voipbuster.com' },
// { url: 'stun:stun.voipstunt.com' },
// { url: 'stun:stun.voxgratia.org' },
// { url: 'stun:stun.xten.com' },


function createConnection() {

    // Создание канала передачи данных
    // sendChannel = localConnection.createDataChannel("sendChannel", dataChannelOptions);
    // sendChannel.onopen = () => {
    //     console.log("Канал открыт");
    //     updateStatus("Канал открыт");
    // };
    // sendChannel.onclose = () => {
    //     console.log("Канал закрыт");
    //     updateStatus("Канал закрыт");
    // };

    // Обработка входящего канала
    // remoteConnection.ondatachannel = event => {
    //     receiveChannel = event.channel;
    //     receiveChannel.onmessage = onReceiveMessage;
    //     receiveChannel.onopen = () => {
    //         console.log("Канал получен");
    //         updateStatus("Канал получен");
    //     };
    //     receiveChannel.onclose = () => {
    //         console.log("Канал получен закрыт");
    //         updateStatus("Канал получен закрыт");
    //     };
    // };



}

// Обработка полученного предложения
function handleOffer(sdp) {
    const offer = new RTCSessionDescription({ type: 'offer', sdp });
    remoteConnection.setRemoteDescription(offer)
        .then(() => {
            console.log("Удаленное описание установлено");
            return remoteConnection.createAnswer();
        })
        .then(answer => {
            console.log("Создан ответ:", answer);
            socket.send(JSON.stringify({ type: 'answer', sdp: answer.sdp })); // Отправка ответа через WebSocket
            return remoteConnection.setLocalDescription(answer);
        })
        .catch(error => {
            console.error("Ошибка при установке предложения:", error);
        });
}

// Обработка полученного ответа
function handleAnswer(sdp) {
    const answer = new RTCSessionDescription({ type: 'answer', sdp });
    localConnection.setRemoteDescription(answer)
        .then(() => {
            console.log("Удаленное описание установлено");
        })
        .catch(error => {
            console.error("Ошибка при установке ответа:", error);
        });
}

// Функция для обработки полученных сообщений
// function onReceiveMessage(event) {
//     console.log("Получено сообщение: " + event.data);
//
// }

// Отправка сообщения чата
// document.getElementById("sendMessageButton").onclick = () => {

    // const message = document.getElementById("messageInput").value;
    // if (sendChannel && sendChannel.readyState === 'open') {
    //     sendChannel.send(message); // Отправка сообщения через WebRTC
    //     displayMessage(message); // Отображение отправленного сообщения
    //     document.getElementById("messageInput").value = ''; // Очистка поля ввода
    //     // Отправка сообщения через WebSocket для других клиентов
    //     socket.send(JSON.stringify({ type: 'chat', data: message }));
    // }
    // console.log(`sendChannel.readyState !== 'open'`, sendChannel.readyState );
    //

// }

export const  useWebRTC  = ()=> {

    const sendWebRtcMessage = (payload) => {


        console.log('chanel state', chanel.readyState)
        chanel.send(JSON.stringify(payload));

    }


    const  onPeerConnected  = () =>{

    }

    //
    // const onCallIceCandidate = ()>{
    //
    //  }


    const createChannel = async ()=> {
        peerConnection.createDataChannel("rtc-chanel", chanelOptions );

        // sendChannel.onopen = () => {
        //     console.log("Канал открыт");
        //     updateStatus("Канал открыт");
        // };

        console.log('createWebChannel');
    }

   peerConnection.ondatachannel = async (event) => {


       console.log('ondatachannel' , event )

       event.channel.onmessage = (event)=>{
           console.log(' peerConnection.onmessage IN' ,event.data )
       };

   }

    peerConnection.onmessage = (event)=>{
        console.log(' peerConnection.onmessage ' ,event.data )
    };



   const  onPeerAnswer = async ({data})=> {
       try {
           console.log('onPeerAnswer');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));

           return peerConnection
       }
       catch (e) {
           console.log(  'Error  onPeerAnswer:', e)
       }

    }

    const createPeerOffer  = async () => {
        try {

            console.log('Creating Peer offer');
            const  offer =   await  peerConnection.createOffer()

            await peerConnection.setLocalDescription(offer)

            return peerConnection
        }
        catch (e) {
            console.log(  'Error  creating Peer offer:', e)
        }
    }

    const  onPeerOffer  = async ({data}) => {
        try {
            console.log('onPeerOffer offer');

            await peerConnection.setRemoteDescription(new RTCSessionDescription(data));

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            return  peerConnection
        }
        catch (e) {
            console.log(  'Error onPeerOffer:', e)
        }
    }
    // const createPeerAnswer  = async () => {
    //     try {
    //         console.log('Creating Peer Answer');
    //         // const  offer =   await  peerConnection.createOffer()
    //         //
    //         // await peerConnection.setLocalDescription(offer)
    //
    //         // sendWebSocketMessage({
    //         //     type: 'offer',
    //         //     roomId,
    //         //     offer: peerConnection.localDescription
    //         // });
    //
    //     }
    //     catch (e) {
    //         console.log(  'Error  creating Peer Answer:', e)
    //     }
    // }

    return {
        sendWebRtcMessage,
        createPeerOffer,
        onPeerOffer,
        onPeerAnswer,
    }
}