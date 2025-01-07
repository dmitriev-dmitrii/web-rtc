
export const userId = adapter.browserDetails.browser
export const peerConnections = {};
export const dataChannels = {}

export const buildConnectionsName = ( remoteUserId , isHostPeer= false )=> {
    // пусть имя хоста будет первым - проще для дебагинга
    return   isHostPeer ? `[${userId}][${remoteUserId}]` : `[${remoteUserId}][${ userId}]`
}

