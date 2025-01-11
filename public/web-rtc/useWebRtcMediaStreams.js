import {dataChannels, mediaStreams, peerConnections, userId} from "./useWebRtcStore.js";
import {DATA_CHANNELS_EVENTS} from "../constants.js";

const localMediaStreamConfig = {
    video: true,
    audio: true
}

let localStream
export const useWebRtcMediaStreams = () => {
    function onTrackPeerConnection  (event) {
        console.log(event)

        if (!mediaStreams[this.pairName]) {
            const video = document.createElement('video')
            video.srcObject = event.streams[0]
            video.autoplay = true

            document.getElementById('webRtcMediaStreams').append(video)
        }

        mediaStreams[this.pairName] = event.streams[0]
    }
    const initLocalMediaStream = async ()=> {
        localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        const video = document.createElement('video')
        video.srcObject = localStream
        video.autoplay = true
        video.muted = true
        video.style.borderColor = 'dodgerblue'

        document.getElementById('webRtcMediaStreams').append(video)
    }

    const setupMediaStreamToPeer = ({pairName})=> {
        
        if (localStream) {
            localStream.getTracks().forEach(track => peerConnections[pairName].addTrack(track, localStream));
        }

        peerConnections[pairName].ontrack = onTrackPeerConnection.bind({pairName})
    }


    return {
        localStream,
        initLocalMediaStream,
        setupMediaStreamToPeer
    }
}