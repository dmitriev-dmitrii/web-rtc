import {sendWsMessage} from "../ws.js";

import {peerConnections, buildConnectionsName} from "./useWebRtcStore.js";
import {useWebRtcDataChannels} from "./useWebRtcDataChannels.js";
import {WEB_SOCKET_EVENTS} from "../constants.js";

const configuration = {
    // iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' },
    // ]
};


export const useWebRtcConnections = () => {

    const {setupDataChanelEvents} = useWebRtcDataChannels()

    function onIceCandidate(event) {

        if (!event.candidate?.candidate) {
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

        sendWsMessage(payload)
    }


    const sendMeOffer = () => {
        const payload = {
            type: WEB_SOCKET_EVENTS.RTC_SEND_ME_OFFER,
            data: {}
        }

        sendWsMessage(payload)
    }


    const createPeerOffer = async ({from}) => {

        const pairName = buildConnectionsName(from, true)

        if (peerConnections[pairName] || peerConnections[buildConnectionsName(from)]) {
            console.warn('aborted createPeerOffer, pairName already eat :', pairName)
            return
        }

        peerConnections[pairName] = new RTCPeerConnection(configuration)

        peerConnections[pairName].onicecandidate = onIceCandidate.bind({remoteUserId: from, pairName});

        const channel = await peerConnections[pairName].createDataChannel(pairName);

        setupDataChanelEvents({pairName, channel})


        const offer = await peerConnections[pairName].createOffer()
        await peerConnections[pairName].setLocalDescription(offer)

        const payload = {
            type: WEB_SOCKET_EVENTS.RTC_OFFER,
            to: from,
            data: offer
        }

        sendWsMessage(payload)
    }

    const confirmPeerOffer = async ({from, data}) => {
        const pairName = buildConnectionsName(from)

        peerConnections[pairName] = new RTCPeerConnection(configuration)

        peerConnections[pairName].onicecandidate = onIceCandidate.bind({remoteUserId: from, pairName});

        peerConnections[pairName].ondatachannel = (event) => {

            const {channel} = event

            setupDataChanelEvents({channel, pairName})

        }

        await peerConnections[pairName].setRemoteDescription(data)

        const answer = await peerConnections[pairName].createAnswer()
        await peerConnections[pairName].setLocalDescription(answer)

        const payload = {
            to: from,
            type: WEB_SOCKET_EVENTS.RTC_ANSWER,
            data: answer
        }

        sendWsMessage(payload)
    }

    const setupPeerAnswer = async ({data, from}) => {
        const pairName = buildConnectionsName(from, true)
        await peerConnections[pairName].setRemoteDescription(data)
    }

    const updatePeerIceCandidate = async ({data}) => {
        try {
        const {pairName, candidate} = data
            await peerConnections[pairName].addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('updatePeerIceCandidate', e)
        }

    }


    return {
        sendMeOffer,
        updatePeerIceCandidate,
        createPeerOffer,
        confirmPeerOffer,
        setupPeerAnswer
    }
}







