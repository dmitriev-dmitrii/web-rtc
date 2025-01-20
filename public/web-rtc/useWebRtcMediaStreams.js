import {dataChannels, mediaStreams, peerConnections, userId} from "./useWebRtcStore.js";
import { MEDIA_STREAMS_EVENTS} from "../constants.js";

const mediaStreamsCallbacksMap = new Map()

let localStream
export const useWebRtcMediaStreams = () => {
    const initLocalMediaStream = async (config = {})=> {

        const defaultConfig = { video : true , audio : true }

        localStream = await navigator.mediaDevices.getUserMedia({...defaultConfig,...config });

        return localStream
    }

    const setupMediaStreamToPeer = ({pairName, remoteUserId})=> {
        
        if (localStream) {
            localStream.getTracks().forEach(track => peerConnections[pairName].addTrack(track, localStream));
        }

        peerConnections[pairName].ontrack = function (e) {

            mediaStreams[this.pairName] = e.streams

            if (mediaStreamsCallbacksMap.has(MEDIA_STREAMS_EVENTS.MEDIA_STREAM_ON_TRACK)) {

                mediaStreamsCallbacksMap.get(MEDIA_STREAMS_EVENTS.MEDIA_STREAM_ON_TRACK).forEach( function (cb)  {
                    cb( e , { pairName, remoteUserId } )
                })

            }

        }.bind({pairName , remoteUserId })
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
        localStream,
        initLocalMediaStream,
        setupMediaStreamToPeer,
        setupMediaStreamsCallbacks
    }
}