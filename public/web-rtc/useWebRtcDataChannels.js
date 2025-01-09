import {dataChannels, userId} from "./useWebRtcStore.js";
import {DATA_CHANNELS_EVENTS} from "../constants.js";

const dataChannelsCallbacksMap = new Map();

export const useWebRtcDataChannels = () => {
    const setupCallbacks = (callbacksPayload = {}) => {

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

            const data = JSON.parse(e.data)

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_MESSAGE).forEach((cb) => {
                cb(data)
            })

        }

        channel.onopen = async (e) => {

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_OPEN).forEach((cb) => {
                cb(e.target)
            })

        }

        channel.onclose = async (e) => {

            dataChannelsCallbacksMap.get(DATA_CHANNELS_EVENTS.DATA_CHANEL_ON_CLOSE).forEach((cb) => {
                cb(e.target)
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
        setupCallbacks
    }
}