import {sendWebSocketMessage} from "../ws.js";

import {peerConnections, buildConnectionsName, mediaStreams, dataChannels} from "./useWebRtcStore.js";
import {useWebRtcDataChannels} from "./useWebRtcDataChannels.js";
import {useWebRtcMediaStreams} from "./useWebRtcMediaStreams.js";

import {WEB_SOCKET_EVENTS} from "../constants.js";


const configuration = {
    // iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' },
    // ]
};


export const useWebRtcConnections = () => {

    const {setupDataChanelEvents} = useWebRtcDataChannels()
    const {setupMediaStreamToPeer} = useWebRtcMediaStreams()

    const createPeerConnection = async ({pairName, isHost, remoteUserId}) => {

        peerConnections[pairName] = new RTCPeerConnection(configuration);


        setupMediaStreamToPeer({pairName, remoteUserId})

        if (isHost) {
            const channel = await peerConnections[pairName].createDataChannel(pairName);

            setupDataChanelEvents({pairName, channel})
        } else {
            peerConnections[pairName].ondatachannel = (event) => {
                const {channel} = event

                setupDataChanelEvents({pairName, channel})
            }
        }

        return peerConnections[pairName]
    }

    function onIceCandidate(event) {

        if (!event.candidate) {
            return
        }

        const payload = {
            to: this.remoteUserId,
            type: WEB_SOCKET_EVENTS.RTC_ICE_CANDIDATE,
            data: {
                pairName: this.pairName,
                candidate: event.candidate
            }
        }

        sendWebSocketMessage(payload)
    }


    const sendMeOffer = async () => {
        const payload = {
            type: WEB_SOCKET_EVENTS.RTC_SEND_ME_OFFER,
            data: {}
        }

        sendWebSocketMessage(payload)
    }


    const createPeerOffer = async ({from}) => {

        const pairName = buildConnectionsName(from, true)
        const isHost = true

        if (peerConnections[pairName] || peerConnections[buildConnectionsName(from)]) {
            console.warn('aborted createPeerOffer, pairName already eat :', pairName)
            return
        }

        const hostPeerConnection = await createPeerConnection({remoteUserId: from, pairName, isHost})

        hostPeerConnection.onicecandidate = onIceCandidate.bind({remoteUserId: from, pairName});

        const offer = await hostPeerConnection.createOffer()
        await hostPeerConnection.setLocalDescription(offer)

        const payload = {
            type: WEB_SOCKET_EVENTS.RTC_OFFER,
            to: from,
            data: {offer}
        }

        sendWebSocketMessage(payload)
    }

    const confirmPeerOffer = async ({from, data}) => {

        const isHost = false
        const pairName = buildConnectionsName(from, isHost)

        const clientPeerConnection = await createPeerConnection({remoteUserId: from, pairName, isHost})

        clientPeerConnection.onicecandidate = onIceCandidate.bind({remoteUserId: from, pairName});

        await clientPeerConnection.setRemoteDescription(data.offer)

        const answer = await clientPeerConnection.createAnswer()
        await clientPeerConnection.setLocalDescription(answer)

        const payload = {
            to: from,
            type: WEB_SOCKET_EVENTS.RTC_ANSWER,
            data: {answer}
        }

        sendWebSocketMessage(payload)
    }

    const setupPeerAnswer = async ({data, from}) => {
        const pairName = buildConnectionsName(from, true)
        await peerConnections[pairName].setRemoteDescription(data.answer)
    }

    const updatePeerIceCandidate = async ({data}) => {
        try {

            const {pairName, candidate} = data

            if (!candidate?.candidate) {
                console.warn('updatePeerIceCandidate , candidate is empty', pairName)
                return
            }

            if (!peerConnections[pairName]) {
                console.warn('updatePeerIceCandidate , pairName is empty', pairName)
            }

            await peerConnections[pairName].addIceCandidate(candidate);
        } catch (e) {
            console.error('updatePeerIceCandidate', e)
        }

    }


    const deletePeerConnection = (pairName) => {

        if (peerConnections[pairName]) {
            peerConnections[pairName].close()
        }

        delete     peerConnections[pairName]

    }

    return {
        sendMeOffer,
        updatePeerIceCandidate,
        createPeerOffer,
        confirmPeerOffer,
        setupPeerAnswer,
        deletePeerConnection,
    }
}







