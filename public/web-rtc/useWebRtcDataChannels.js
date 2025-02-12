import {dataChannels, userId , localUser } from "./useWebRtcStore.js";
import {DATA_CHANNELS_EVENTS, DATA_CHANNELS_MESSAGE_TYPE} from "../constants.js";

const dataChannelsCallbacksMap = new Map();
// TODO придумать как не дублировать код с евентами
export const useWebRtcDataChannels = () => {
    const setupDataChannelCallbacks = (callbacksPayload = {}) => {

        Object.entries(callbacksPayload).forEach(([key, ...value]) => {

            if (!dataChannelsCallbacksMap.has(key)) {
                dataChannelsCallbacksMap.set(key, [])
            }

            dataChannelsCallbacksMap.set(key, [...dataChannelsCallbacksMap.get(key), ...value.flat()])
        })

    }

    const setupDataChanelEvents = ({channel, pairName}) => {

        dataChannels[pairName] = channel

        channel.onmessage = async (e) => {


            if (!dataChannelsCallbacksMap.has(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_MESSAGE)) {
                return
            }

            const data = JSON.parse(e.data)

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_MESSAGE).forEach((cb) => {
                cb(data, {pairName})
            })

        }

        channel.onopen = async (e) => {

            const payload = {
                type: DATA_CHANNELS_MESSAGE_TYPE.DATA_CHANEL_OPEN,
                data: {
                    audio: localUser.audio,
                    video: localUser.video
                }
            }

            sendDataChanelMessage(payload)

        }

        channel.onclose = async (e) => {


            const payload = {
                type: DATA_CHANNELS_MESSAGE_TYPE.DATA_CHANEL_CLOSED,
                data: {
                    e
                }
            }

            sendDataChanelMessage(payload)
        };

    }

    const sendDataChanelMessage = (payload) => {

        const data = JSON.stringify({...payload, from: userId})

        Object.values(dataChannels).forEach((item) => {
            if (item.readyState === 'open') {
                item.send(data)
            }
        })

    }

    return {
        sendDataChanelMessage,
        setupDataChanelEvents,
        setupDataChannelCallbacks
    }
}