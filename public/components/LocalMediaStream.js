import {useWebRtcMediaStreams} from "../web-rtc/useWebRtcMediaStreams.js";


const localMediaStreamTemplate = document.getElementById('local-media-stream-template');



const LOCAL_STREAM_ACTION_BAR_MAP = {
    LEAVE_MEET: 'leave-meet',
    VIDEO: 'video',
    AUDIO: 'audio',
}


const { initLocalMediaStream, localStream } =  useWebRtcMediaStreams()

export class LocalMediaStream extends HTMLElement {

    constructor() {
        super();
        this.userName = 'me'

        this.attachShadow({ mode: 'open' }).appendChild(
            localMediaStreamTemplate.content.cloneNode(true)
        );

        this.videoTag =  this.shadowRoot.querySelector('video')
        this.videoTag.muted = true
        this.videoTag.autoplay = true

        this.actionsBar =  this.shadowRoot.querySelector('.actions-bar')
        this.userLabel =  this.shadowRoot.querySelector('.user-label')

    }


    onActionBarClick(e){
        const eventTarget = e.target
        const { actionType } = eventTarget.dataset

        if (!Object.values(LOCAL_STREAM_ACTION_BAR_MAP).includes(actionType)) {
            return
        }

        console.log(actionType)

        if (actionType === LOCAL_STREAM_ACTION_BAR_MAP.LEAVE_MEET) {

            return;
        }

        eventTarget.classList.toggle('active')
    }

   async connectedCallback () {
        this.actionsBar.addEventListener('click', this.onActionBarClick )

        this.userLabel.innerText = this.userName

       this.videoTag.srcObject =   await  initLocalMediaStream()

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

