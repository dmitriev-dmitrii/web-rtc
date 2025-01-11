import {dataChannels, userId} from "./useWebRtcStore.js";
import {DATA_CHANNELS_EVENTS} from "../constants.js";

const dataChannelsCallbacksMap = new Map();

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

            if (!dataChannelsCallbacksMap.has(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_OPEN)) {
                return
            }

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_OPEN).forEach((cb) => {
                cb(e.target, {pairName})
            })

        }

        channel.onclose = async (e) => {
            if (!dataChannelsCallbacksMap.has(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_CLOSE)) {
                return
            }

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_CLOSE).forEach((cb) => {
                cb(e.target, {pairName})
            })

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