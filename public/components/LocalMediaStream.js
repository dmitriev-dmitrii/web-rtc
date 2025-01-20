import {useWebRtcMediaStreams} from "../web-rtc/useWebRtcMediaStreams.js";
import {mediaStreams, userId} from "../web-rtc/useWebRtcStore.js";


const localMediaStreamTemplate = document.getElementById('local-media-stream-template');


const LOCAL_STREAM_ACTION_BAR_MAP = {
    LEAVE_MEET: 'leave-meet',
    VIDEO: 'video',
    AUDIO: 'audio',
}


const {initLocalMediaStream, localStream} = useWebRtcMediaStreams()

export class LocalMediaStream extends HTMLElement {

    constructor() {
        super();
        this.userName = 'me'

        this.attachShadow({mode: 'open'}).appendChild(
            localMediaStreamTemplate.content.cloneNode(true)
        );

        this.videoTag = this.shadowRoot.querySelector('video')
        this.videoTag.muted = true
        this.videoTag.autoplay = true

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

            return;
        }

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.AUDIO) {
            mediaStreams[userId].getAudioTracks().forEach((item)=> {
                item.enabled = !item.enabled
            })
        }

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.VIDEO) {
            mediaStreams[userId].getVideoTracks().forEach((item)=> {
                item.enabled = !item.enabled
            })
        }

        eventTarget.classList.toggle('active')
    }

    async connectedCallback() {
        this.actionsBar.addEventListener('click', this.onActionBarClick)

        this.userLabel.innerText = this.userName

        await initLocalMediaStream()

        this.videoTag.srcObject = mediaStreams[userId]

        if (mediaStreams[userId].getVideoTracks().some((item)=> item.enabled)) {
            this.videoToggleButton.classList.add('active')
        }

        if (mediaStreams[userId].getAudioTracks().some((item)=> item.enabled)) {
            this.audioToggleButton.classList.add('active')
        }

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

