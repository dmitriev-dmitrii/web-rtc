export const WEB_SOCKET_EVENTS = {
    'WS_CONNECTION': 'ws-connection',
    'WS_CLOSE': 'ws-close',

    'RTC_SEND_ME_OFFER': 'rtc-send-me-offer',
    'RTC_OFFER': 'rtc-offer',
    'RTC_ANSWER': 'rtc-answer',
    'RTC_ICE_CANDIDATE': 'rtc-ice-candidate',
}

export const DATA_CHANNELS_EVENTS = {
    'DATA_CHANEL_ON_OPEN': 'onopen',
    'DATA_CHANEL_ON_CLOSE': 'onclose',
    'DATA_CHANEL_ON_MESSAGE': 'onmessage',
}

export const DATA_CHANNELS_MESSAGE_TYPE = {
    'DATA_CHANEL_TEXT_MESSAGE': 'dc-text-message',
    'DATA_CHANEL_CHANGE_VIDEO_TRACK_STATE': 'dc-change-video-track-state',
    'DATA_CHANEL_CHANGE_AUDIO_TRACK_STATE': 'dc-change-audio-track-state',
}

export const MEDIA_STREAMS_EVENTS = {
    'MEDIA_STREAM_ON_TRACK': 'ontrack',

}
