import ReTree from 're-tree'
import UaDeviceDetector from 'ua-device-detector'
import webVoiceSDK from '@linto-ai/webvoicesdk'
import MqttClient from './mqtt.js'
import * as axios from 'axios'
import base64Js from 'base64-js'

export default class Linto extends EventTarget {
    constructor(httpAuthServer, requestToken) {
        super()
        this.browser = UaDeviceDetector.parseUserAgent(window.navigator.userAgent)
        // Server connexion
        this.httpAuthServer = httpAuthServer
        this.requestToken = requestToken
        this.mqtt = new MqttClient(this.mqttInfo)
        // WebvoiceSDK
        if (this.browser.isMobile()) {
            this.mic = new webVoiceSDK.Mic({
                sampleRate: 44100,
                frameSize: 4096,
                constraints: {
                    echoCancellation: false,
                    autoGainControl: false,
                    noiseSuppression: false
                }
            })
        } else {
            this.mic = new webVoiceSDK.Mic() // uses webVoiceSDK.Mic.defaultOptions
        }
        this.mic = new webVoiceSDK.Mic()
        this.downSampler = new webVoiceSDK.DownSampler()
        this.vad = new webVoiceSDK.Vad()
        this.speechPreemphaser = new webVoiceSDK.SpeechPreemphaser()
        this.featuresExtractor = new webVoiceSDK.FeaturesExtractor()
        this.hotword = new webVoiceSDK.Hotword()
        this.recorder = new webVoiceSDK.Recorder()
        // Init
        return this.start()
    }

    async start() {
        let auth
        try {
            auth = await axios.post(this.httpAuthServer, {
                "requestToken": this.requestToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        } catch (e) {
            console.log(e)
            return e
        }
        console.log(auth)
        this.userInfo = auth.data.user
        this.mqttInfo = auth.data.mqttConfig
        await this.mqtt.connect(this.userInfo, this.mqttInfo)
        await this.#startAudio()
        return this
    }

    async #startAudio() {
        await this.downSampler.start(mic)
        await this.vad.start(mic)
        await this.speechPreemphaser.start(downSampler)
        await this.featuresExtractor.start(speechPreemphaser)
        await this.hotword.start(feat, vad)
        await this.hotword.loadModel(hotword.availableModels["linto"])
        await mic.start()
        await rec.start(downSampler)
        console.log("hey")
    }

    async stop() {}
}

window.Linto = Linto