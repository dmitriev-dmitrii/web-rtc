import {useWebRtcMediaStreams} from "../web-rtc/useWebRtcMediaStreams.js";
import {mediaStreams, userId, localUser, peerConnections ,  remoteMediaStreamsDomMap} from "../web-rtc/useWebRtcStore.js";
import {useWebRtcDataChannels} from "../web-rtc/useWebRtcDataChannels.js";
import {DATA_CHANNELS_MESSAGE_TYPE} from "../constants.js";

const localMediaStreamTemplate = document.getElementById('local-media-stream-template');


const LOCAL_STREAM_ACTION_BAR_MAP = {
    LEAVE_MEET: 'leave-meet',
    VIDEO: 'video',
    AUDIO: 'audio',
}


const {initLocalMediaStream} = useWebRtcMediaStreams()
const {sendDataChanelMessage , deleteDataChanel } = useWebRtcDataChannels()

export class LocalMediaStream extends HTMLElement {


    constructor() {
        super();
        this.userName = 'me'

        this.attachShadow({mode: 'open'}).appendChild(
            localMediaStreamTemplate.content.cloneNode(true)
        );

        this.videoTag = this.shadowRoot.querySelector('video')
        this.videoTag.muted = true

        this.actionsBar = this.shadowRoot.querySelector('.actions-bar')
        this.audioToggleButton = this.actionsBar.querySelector('[data-action-type="audio"]')
        this.videoToggleButton = this.actionsBar.querySelector('[data-action-type="video"]')

        this.userLabel = this.shadowRoot.querySelector('.user-label')

    }


    onActionBarClick(e) {
        const eventTarget = e.target
        const {actionType} = eventTarget.dataset

        if (!Object.values(LOCAL_STREAM_ACTION_BAR_MAP).includes(actionType)) {
            return
        }

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.LEAVE_MEET) {

            const payload = {
                type: DATA_CHANNELS_MESSAGE_TYPE.DATA_CHANEL_CLOSE,
                data: {

                }
            }

            sendDataChanelMessage(payload)
            remoteMediaStreamsDomMap.forEach((item)=>{
                item.removeMediaStreamComponent()
            })
            remoteMediaStreamsDomMap.clear()

            return;
        }

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.AUDIO) {
            localUser.audio = !localUser.audio
            localUser.audio ? eventTarget.classList.add('active') : eventTarget.classList.remove('active')
        }

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.VIDEO) {
            localUser.video = !localUser.video
            localUser.video ? eventTarget.classList.add('active') : eventTarget.classList.remove('active')
        }


        const payload = {
            type: DATA_CHANNELS_MESSAGE_TYPE.DATA_CHANEL_UPDATE_MEDIA_TRACK_STATE,
            data: {
                video: localUser.video,
                audio: localUser.audio
            }
        }

        sendDataChanelMessage(payload)

    }

    async connectedCallback() {
        this.actionsBar.addEventListener('click', this.onActionBarClick)

        this.userLabel.innerText = this.userName

        await initLocalMediaStream()

        this.videoTag.srcObject = mediaStreams[userId]

        localUser.video ? this.videoToggleButton.classList.add('active') : this.videoToggleButton.classList.remove('active')

        localUser.audio ? this.audioToggleButton.classList.add('active') : this.audioToggleButton.classList.remove('active')

        await this.videoTag.play()
    }

    disconnectedCallback() {
        console.log("Custom element removed from page.");
    }

    adoptedCallback() {
        console.log("Custom element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed.`);
    }


}

