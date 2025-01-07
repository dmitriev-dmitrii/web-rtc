import {sendWsMessage} from "../ws.js";

import {peerConnections , dataChannels , userId , buildConnectionsName } from "./useWebRtcStore.js";
import {WEB_SOCKET_EVENTS} from "../constants.js";

const configuration = {
    // iceServers: [
    //     { urls: 'stun:stun.l.google.com:19302' },
    // ]
};



export const useWebRtc = (callbacks)=> {

    const {
        onDataChanelOpen,
        onDataChanelClose,
        onDataChanelMessage
    } = callbacks

    const setupDataChanelEvents = ({ channel , pairName })=> {

        dataChannels[pairName] = channel

        channel.onmessage = async (e) =>  {

            const data = JSON.parse(e.data)

            if ( onDataChanelMessage ) {
              await  onDataChanelMessage( data )
            }

        }

        channel.onopen = async (e)=> {
            console.log('channel.onopen', e)
            if ( onDataChanelOpen ) {
                await  onDataChanelOpen( e )
            }

        }

        channel.onclose = async (e) => {

            if ( onDataChanelClose ) {
              await  onDataChanelClose ( e )
            }
        };

    }

    function onIceCandidate(event) {

        if (!event.candidate) {
            return
        }

        const payload = {
            to: this.remoteUserId,
            type: WEB_SOCKET_EVENTS.RTC_ICE_CANDIDATE,
            data:{
                pairName : this.pairName,
                candidate : event.candidate
            }
        }

        sendWsMessage(payload)
    }



    const createPeerOffer  = async( { from } ) => {

        const pairName =  buildConnectionsName( from , true )
        
        peerConnections[ pairName ] = new RTCPeerConnection(configuration)

        peerConnections[pairName].onicecandidate = onIceCandidate.bind( { remoteUserId : from , pairName } );

        const channel = await peerConnections[ pairName ].createDataChannel( pairName );

        setupDataChanelEvents( { pairName, channel }  )


        const offer = await  peerConnections[pairName].createOffer()
        await peerConnections[pairName].setLocalDescription(offer)

        const payload = {
            type:WEB_SOCKET_EVENTS.RTC_OFFER,
            to: from,
            data: offer
        }

        sendWsMessage(payload)
    }

     const confirmPeerOffer  = async( { from , data } ) => {
        const pairName =  buildConnectionsName( from )

        peerConnections[pairName] =  new RTCPeerConnection(configuration)

        peerConnections[pairName].onicecandidate = onIceCandidate.bind({ remoteUserId : from , pairName });

        peerConnections[pairName].ondatachannel= (event) => {
            
            const {channel} = event
            
            setupDataChanelEvents({ channel , pairName })
            
        }

        await peerConnections[pairName].setRemoteDescription(data)

        const answer = await peerConnections[pairName].createAnswer()
        await peerConnections[pairName].setLocalDescription(answer)

         const payload = {
                to:from,
                type:WEB_SOCKET_EVENTS.RTC_ANSWER,
                data: answer
         }

         sendWsMessage(payload)
    }

    const setupPeerAnswer = async( { data , from } ) => {
        const pairName = buildConnectionsName(from,true)
        await peerConnections[pairName].setRemoteDescription(data)
    }

    const updatePeerIceCandidate = async ({ data } )=> {

        await peerConnections[data.pairName].addIceCandidate(new RTCIceCandidate( data.candidate ));

    }

    const sendDataChanelMessage = (payload)=> {

        const data = JSON.stringify({...payload, from : userId })

        Object.values(dataChannels).forEach((item)=> {
            if ( item.readyState === 'open' ) {
                item.send(data)
            }
        })

    }

    return {
        updatePeerIceCandidate,
        sendDataChanelMessage,
        createPeerOffer,
        confirmPeerOffer,
        setupPeerAnswer
    }
}







