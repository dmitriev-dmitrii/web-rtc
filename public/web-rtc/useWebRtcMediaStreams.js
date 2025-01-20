import {dataChannels, mediaStreams, peerConnections, userId} from "./useWebRtcStore.js";
import {MEDIA_STREAMS_EVENTS} from "../constants.js";

const mediaStreamsCallbacksMap = new Map()
// TODO придумать как не дублировать код с евентами

export const useWebRtcMediaStreams = () => {
    const initLocalMediaStream = async (config = {}) => {

        const defaultConfig = {video: true, audio: true}

        mediaStreams[userId] = await navigator.mediaDevices.getUserMedia({...defaultConfig, ...config});
        //cb navigator.mediaDevices.ondevicechange

        return mediaStreams[userId]
    }

    const setupMediaStreamToPeer = ({pairName, remoteUserId}) => {

        if (mediaStreams[userId]) {
            mediaStreams[userId].getTracks().forEach(track => peerConnections[pairName].addTrack(track, mediaStreams[userId]));
        }

        peerConnections[pairName].ontrack = function (e) {

            mediaStreams[this.remoteUserId] = e.streams

            if (mediaStreamsCallbacksMap.has(MEDIA_STREAMS_EVENTS.MEDIA_STREAM_ON_TRACK)) {

                mediaStreamsCallbacksMap.get(MEDIA_STREAMS_EVENTS.MEDIA_STREAM_ON_TRACK).forEach(function (cb) {
                    cb(e, {pairName, remoteUserId})
                })

            }

        }.bind({pairName, remoteUserId})
    }

    const setupMediaStreamsCallbacks = (callbacksPayload) => {

        Object.entries(callbacksPayload).forEach(([key, ...value]) => {

            if (!mediaStreamsCallbacksMap.has(key)) {
                mediaStreamsCallbacksMap.set(key, [])
            }

            mediaStreamsCallbacksMap.set(key, [...mediaStreamsCallbacksMap.get(key), ...value.flat()])
        })

    }

    return {
        initLocalMediaStream,
        setupMediaStreamToPeer,
        setupMediaStreamsCallbacks
    }
}