const userId = window.navigator.appVersion


const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

const statusMark = document.getElementById('status');
statusMark.innerText = peerConnection.connectionState

export const useWebRTC = (sendWebSocketMessage) => {


    peerConnection.onicecandidate = async (event) => {
        console.log(' ICE candidate ');

        if (event.candidate) {
            sendWebSocketMessage({ type: 'ice-candidate', data: event.candidate });
        }
    };


    peerConnection.oniceconnectionstatechange = async () => {

        statusMark.innerText = peerConnection.connectionState

        if (peerConnection.connectionState === 'connected') {
            await  createDataChannel();
        }
    };

    let dataChannel;

    async function createDataChannel (){
        try {
       
        console.log('createDataChannel')

        dataChannel = await peerConnection.createDataChannel('chat');

        dataChannel.onopen = (e) => {
            console.log('Data channel is open',e);
        };

        dataChannel.onclose = (e) => {
            console.log('Data channel is close',e);
        };

        dataChannel.onmessage = (event) => {
            console.log('Message from peer:', event.data);
        };
    } catch (error) {
        console.log('createDataChannel err', error)
    }
    };

    const createPeerOffer = async () => {
        try {
            console.log('createPeerOffer');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            sendWebSocketMessage({ type: 'offer', data: offer });
        } catch (error) {
            console.error('createPeerOffer err', error);
        }
    };

    const onPeerOffer = async ({ data }) => {
        try {
            console.log('onPeerOffer');
            await peerConnection.setRemoteDescription( new RTCSessionDescription(data) );
        } catch (error) {
            console.log('onPeerOffer' , error);
        
        }

    };

    const createPeerAnswer = async () => {
        try {
            console.log('createPeerAnswer:');
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
    
            sendWebSocketMessage({ type: 'answer', data: answer });
        } catch (error) {
            console.log('createPeerAnswererr  ', error);
        }

    };

    const onPeerAnswer = async ({ data }) => {
        try {
            console.log('onPeerAnswer');
            await peerConnection.setRemoteDescription( await new RTCSessionDescription(data) );
        } catch (error) {
            console.log('onPeerAnswer err  ', error);
        }

    };

    const sendWebRTCMessage = (message) => {

        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(message);
            console.log('Sending WebRTC message:', message);
            return
        }
        console.log('Data channel is not open');
    };

    const onIceCandidate = async ({data, from }) => {

        console.log('onIceCandidate', from)
        try {
            const candidate = await new RTCIceCandidate(data)
            await peerConnection.addIceCandidate(candidate);
        } catch (error) {
            console.log('onIceCandidate err', error)
        }

    };



    return {
        createPeerOffer,
        onPeerOffer,
        createPeerAnswer,
        onPeerAnswer,
        sendWebRTCMessage,
        onIceCandidate,
    };
};