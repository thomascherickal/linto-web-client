import WebVoiceSDK from '@linto-ai/webvoicesdk'

export default class Audio extends EventTarget {
    constructor() {
        this.mic = new WebVoiceSDK.Mic()
        this.downSampler = new WebVoiceSDK.DownSampler()
        this.vad = new WebVoiceSDK.Vad()
        this.speechPreemphaser = new WebVoiceSDK.SpeechPreemphaser()
        this.featuresExtractor = new WebVoiceSDK.FeaturesExtractor()
        this.hotword = new WebVoiceSDK.Hotword()
        this.recorder = new WebVoiceSDK.Recorder()
    }
}