import {sendWsMessage} from "./ws.js";

const userId = adapter.browserDetails.browser

const peerConnections = {};
const dataChannels = {}

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

    const setupDataChanelEvents = (channel , userId)=> {

        dataChannels[userId] = channel

        channel.onmessage = async (e) =>  {

            const data = JSON.parse(e.data)

            if ( onDataChanelMessage ) {
              await  onDataChanelMessage( data )
            }

        }

        channel.onopen = async (e)=> {

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

    const createPeerOffer  = async( { from } ) => {

        peerConnections[ from ] = new RTCPeerConnection(configuration)

        peerConnections[ from ].onicecandidate = (event)=>  {

            console.log('ice candidate' , event )

        }

        const chanelLabel = `[${ userId }][${ from }]`
        const channel = await peerConnections[ from ].createDataChannel(chanelLabel);

        setupDataChanelEvents( channel, chanelLabel )


        const offer = await  peerConnections[from].createOffer()
        await peerConnections[from].setLocalDescription(offer)

        const payload = {
            type:'offer',
            to: from,
            data: offer
        }

        sendWsMessage(payload)
    }

     const confirmPeerOffer  = async( { from , data } ) => {

        peerConnections[from] =  new RTCPeerConnection(configuration)
        peerConnections[from].onicecandidate = (event)=>  {

            console.log('ice candidate' , event )

        }

        peerConnections[from].ondatachannel= (event) => {
            console.log('ice candidate' , event )
            setupDataChanelEvents(event.channel , from)
        }

        await peerConnections[from].setRemoteDescription(data)

        const answer = await peerConnections[from].createAnswer()
        await peerConnections[from].setLocalDescription(answer)

        setTimeout(()=> {

            const payload = {
                to:from,
                type:'answer',
                data: peerConnections[from].localDescription
            }

            sendWsMessage(payload)

        }, 3000)


    }

    const setupPeerAnswer = async( { data , from } ) => {
        await peerConnections[from].setRemoteDescription(data)
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
        sendDataChanelMessage,
        createPeerOffer,
        confirmPeerOffer,
        setupPeerAnswer
    }
}







