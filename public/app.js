const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallButton = document.getElementById('startCall');

const socket = new WebSocket(`ws://${window.location.host}`);
let localStream;


const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

let peerConnection = new RTCPeerConnection(configuration);

localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
localVideo.srcObject = localStream;

localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
};

peerConnection.onicecandidate = (event) => {
    console.log('onicecandidate')

    if (event.candidate) {
        socket.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
    }
};
peerConnection.onconnectionstatechange = (e)=>{
    console.log('onconnectionstatechange', e)
}


// peerConnection.onaddstream
// peerConnection.onremovestream

peerConnection.ondatachannel = ()=>{
    console.log(' ondatachannel ')
}

peerConnection.onicecandidateerror = ()=>{
    console.log(' onicecandidateerror ')
}

peerConnection.oniceconnectionstatechange = ()=>{
    console.log(' oniceconnectionstatechange ')
}

peerConnection.onicegatheringstatechange = ()=>{
    console.log(' onicegatheringstatechange ')
}

peerConnection.onnegotiationneeded = ()=>{
    console.log('onnegotiationneeded  ')
}

peerConnection.onsignalingstatechange = ()=>{

    console.log(' onsignalingstatechange ', peerConnection.signalingState )
}


async function startCall() {

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.send(JSON.stringify({ type: 'offer', offer }));
}

socket.onmessage = async (event) => {
    try {
        const message = JSON.parse(event.data);

        if (message.type === 'offer') {
 
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: 'answer', answer }));
            return
        }
        if (message.type === 'answer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
            return
        }

        if (message.type === 'ice-candidate') {
            peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
            return
        }
    } catch (error) {
        console.error('Ошибка при обработке сообщения:', error);
    }
};

startCallButton.addEventListener('click', startCall);
