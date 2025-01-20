const remoteMediaStreamTemplate = document.getElementById('remote-media-stream-template');
export class RemoteMediaStream extends HTMLElement {

    remoteUserName = '';
    pairName = ''
    audioIsOn = false
    videoIsOn = false
    streams = []
    constructor({remoteUserName= '' , remoteUserId =''  , streams = [] } = {} ) {
        super();
        this.remoteUserId = remoteUserId
        this.remoteUserName = remoteUserName || remoteUserId
        this.streams = streams

        this.attachShadow({ mode: 'open' }).appendChild(
            remoteMediaStreamTemplate.content.cloneNode(true)
        );

        this.videoTag =  this.shadowRoot.querySelector('video')
        this.videoTag.autoplay = true

        this.audioStatus =  this.shadowRoot.querySelector('.status-bar__audio')
        this.videoStatus =  this.shadowRoot.querySelector('.status-bar__video')

        this.userLabel =  this.shadowRoot.querySelector('.user-label')
        this.userLabel.innerText = this.remoteUserName || this.remoteUserId

    }

    connectedCallback() {
        this.videoTag.srcObject = this.streams[0]
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

    audioToggle() {
        this.audioIsOn = !this.audioIsOn
        this.audioStatus.classList.toggle('active')
    }

    videoToggle() {
        this.videoIsOn = !this.videoIsOn
        this.videoStatus.classList.toggle('active')
    }
    onLeaveMeet() {
        this.classList.add('remove');

        setTimeout(() => {
            this.remove();
        }, 300);
    }
}