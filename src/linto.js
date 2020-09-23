import ReTree from 're-tree'
import UaDeviceDetector from 'ua-device-detector'
import MqttClient from './mqtt.js'
import Audio from './audio.js'
import * as handlers from './handlers/linto.js'
import * as axios from 'axios'
import base64Js from 'base64-js'

export default class Linto extends EventTarget {
    constructor(httpAuthServer, requestToken) {
        super()
        this.browser = UaDeviceDetector.parseUserAgent(window.navigator.userAgent)
        // Server connexion
        this.httpAuthServer = httpAuthServer
        this.requestToken = requestToken
        this.mqtt = new MqttClient()
        this.mqtt.addEventListener("connect", handlers.mqttConnect.bind(this))
        this.mqtt.addEventListener("connect_fail", handlers.mqttConnectFail.bind(this))
        this.mqtt.addEventListener("error", handlers.mqttError.bind(this))
        this.mqtt.addEventListener("disconnect", handlers.mqttDisconnect.bind(this))
        // WebvoiceSDK
        this.audio = new Audio(this.browser.isMobile())
        this.audio.vad.addEventListener("speakingStatus", handlers.vadStatus.bind(this))
        this.audio.hotword.addEventListener("hotword", handlers.hotword.bind(this))
        // Init
        return this.login()
    }

    async login() {
        return new Promise(async (resolve, reject) => {
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
            } catch (e) {
                reject(e)
            }
            resolve(this)
        })
    }

    listenCommand() {
        this.audio.listenCommand()
    }

    async sendCommand() {
        try {
            const b64Audio = await this.audio.getCommand()
            await this.mqtt.publishAudioCommand(b64Audio)
        } catch (e) {
            this.dispatchEvent(new CustomEvent("command_error", e))
        }
    }
}

window.Linto = Linto