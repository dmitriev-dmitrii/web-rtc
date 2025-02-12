export const userId = adapter.browserDetails.browser
export const peerConnections = {};
window.peerConnections = peerConnections
export const dataChannels = {};
window.dataChannels = dataChannels
export const mediaStreams = {};
window.mediaStreams = mediaStreams

export const remoteMediaStreamsDomMap = new Map()
export const localUser = {

    userId : adapter.browserDetails.browser,

    userName : 'hui',

    get audio() {
        try {
            return mediaStreams[userId].getAudioTracks().some((item) => item.enabled)
        } catch (e) {
            console.log('audio get err', e)
            return false
        }
    },

    set audio(value) {
        try {
            mediaStreams[userId].getAudioTracks().find(({readyState}) => {
                return readyState === 'live'
            }).enabled = !!value

            return value
        } catch (e) {
            console.log('audio set err', e)
            return false
        }
    },

    get video() {
        try {
            return mediaStreams[userId].getVideoTracks().some((item) => item.enabled)
        } catch (e) {
            console.log('video get err', e)
            return false
        }
    },

    set video(value) {
        try {
            mediaStreams[userId].getVideoTracks().find(({readyState}) => {
                return readyState === 'live'
            }).enabled = !!value

            return value
        } catch (e) {
            console.log('video set err', e)
            return false
        }
    }
}

export const buildConnectionsName = (remoteUserId, isHostPeer = false) => {
    // пусть имя хоста будет первым - проще для дебагинга
    return isHostPeer ? `[${userId}][${remoteUserId}]` : `[${remoteUserId}][${userId}]`
}

