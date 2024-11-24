const userId = adapter.browserDetails.browser


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
        console.log('ICE connection state changed to:', peerConnection.iceConnectionState);
        statusMark.innerText = peerConnection.connectionState
        if (peerConnection.connectionState === 'connected') {
            await  createDataChannel();
        }
    };

    let dataChannel;

    async function createDataChannel (){
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

    };

    const createPeerOffer = async () => {
        try {
            console.log('Creating peer offer...');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            sendWebSocketMessage({ type: 'offer', data: offer });
        } catch (error) {
            console.error('Error creating offer or setting local description:', error);
        }
    };

    const onPeerOffer = async ({ data }) => {
        console.log('Received peer offer:');

        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    };

    const createPeerAnswer = async () => {
        console.log('createPeerAnswer:');
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        sendWebSocketMessage({ type: 'answer', data: answer });
    };

    const onPeerAnswer = async ({ data }) => {
        console.log('Received peer answer:');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
    };

    const sendWebRTCMessage = (message) => {

        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.send(message);
            console.log('Sending WebRTC message:', message);
            return
        }
        console.log('Data channel is not open');
    };

    const handleIceCandidate = async ({data, from }) => {
        if (peerConnection.remoteDescription && from !== userId) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            console.log('ICE candidate added.');
            return
        }

        console.log('ICE candidate received before remote description is set.');

    };



    return {
        createPeerOffer,
        onPeerOffer,
        createPeerAnswer,
        onPeerAnswer,
        sendWebRTCMessage,
        handleIceCandidate,
    };
};