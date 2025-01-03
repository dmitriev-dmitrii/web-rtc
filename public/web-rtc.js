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
        console.log(dataChannels)
        dataChannels[userId] = channel

        channel.onmessage = async (e) =>  {

            console.log(e.currentTarget.label)
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

    const createPeerOffer  = async( ) => {

        peerConnections[userId] = new RTCPeerConnection(configuration)

        peerConnections[userId].onicecandidate = (event)=>  {

            console.log('ice candidate' , event )

        }

        const channel = await peerConnections[userId].createDataChannel(userId);

        setupDataChanelEvents(channel, userId )


        const offer = await  peerConnections[userId].createOffer()
        await peerConnections[userId].setLocalDescription(offer)

        await   fetch('/offers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({ offer: peerConnections[userId].localDescription, userId })
        })

    }

     const confirmPeerOffer  = async( { to , data } ) => {

        peerConnections[to] =  new RTCPeerConnection(configuration)
        peerConnections[to].onicecandidate = (event)=>  {

            console.log('ice candidate' , event )

        }

        peerConnections[to].ondatachannel= (event) => {
            console.log('ice candidate' , event )
            setupDataChanelEvents(event.channel , to)
        }

        await peerConnections[to].setRemoteDescription(data)

        const answer = await peerConnections[to].createAnswer()
        await peerConnections[to].setLocalDescription(answer)

        setTimeout(()=> {

            const payload = {
                to,
                type:'answer',
                data: peerConnections[to].localDescription
            }

            sendWsMessage(payload)

        }, 3000)


    }

    const setupPeerAnswer = async( { data } ) => {
        await peerConnections[userId].setRemoteDescription(data)
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







