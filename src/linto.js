import ReTree from 're-tree'
import UaDeviceDetector from 'ua-device-detector'
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

        // Init
        return this.start()
    }

    async start() {
        try {
            let auth = await axios.post(this.httpAuthServer, {
                "requestToken": this.requestToken
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            this.userInfo = auth.data.user
            this.mqttInfo = auth.data.mqttConfig
            this.mqtt.connect(this.userInfo, this.mqttInfo)
            await this.startAudio()
   
       
        } catch (e) {
            console.log(e)
        }
        return this
    }

    async startAudio() {
        console.log('"sdfsdfsdf')
        await this.downSampler.start(this.mic)
       
        await this.vad.start(this.mic)
        await this.speechPreemphaser.start(downSampler)
        await this.featuresExtractor.start(speechPreemphaser)
        await this.hotword.start(feat, vad)
        await this.hotword.loadModel(hotword.availableModels["linto"])
        await mic.start()
        await rec.start(downSampler)
    }

    async stop() {}
}

window.Linto = Linto