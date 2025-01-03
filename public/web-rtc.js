
const peerConnections = {};
const dataChannels = {};


const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

export const useWebRtc = (callbacks)=> {

    const {
        onDataChanelMessage,
        onOpenDataChanel,
    } = callbacks

    peerConnections[userId] = new RTCPeerConnection(configuration);

    peerConnections[userId].onconnectionstatechange = (e)=> {

        console.log(peerConnections[userId].connectionState)

    }

    peerConnections[userId].onicecandidate = async (e)=> {

        if (e.candidate) {
            await peerConnections[userId].addIceCandidate(new RTCIceCandidate(e.candidate))
        }

    }



    dataChannels[userId] = peerConnections[userId].createDataChannel(`${userId}`);

    dataChannels[userId].onopen = (e)=> {
        onOpenDataChanel(e)
    }

    dataChannels[userId].onmessage = (event)=> {

        onDataChanelMessage(JSON.parse(event.data))
    }



    async function createPeerOffer() {

        const offer = await peerConnections[userId].createOffer();
        await peerConnections[userId].setLocalDescription(offer)


        return offer
    }

    const confirmPeerOffer = async (offer)=> {
        
        await peerConnections[userId].setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnections[userId].createAnswer();
        await peerConnections[userId].setLocalDescription(answer);
        return answer
        
    }




    const sendDataChanelMessage = (payload)=> {

        if (dataChannels[window.userId]) {
            payload.data.fromUser = window.userId
            dataChannels[window.userId].send(JSON.stringify(payload))
        }

    }


    const  onPeerAnswer = async ({data})=> {
       await peerConnections[userId].setRemoteDescription(data)
    }


    // const onNewUser = (message) => {
    //
    //     const {newUserId} = message;
    //     console.log('socket on new user', message)
    //     peerConnections[newUserId] = new RTCPeerConnection(configuration);
    //
    //     // Обработка ICE кандидатов
    //     peerConnections[newUserId].onicecandidate = (event) => {
    //         if (event.candidate) {
    //             const data = event.candidate
    //             // sendWsMessage({ type: 'ice-candidate', data });
    //         }
    //     };
    //
    // };

    return {
        onPeerAnswer,
        createPeerOffer,
        confirmPeerOffer,

        sendDataChanelMessage,
    }
}


