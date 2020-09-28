import ReTree from 're-tree'
import UaDeviceDetector from 'ua-device-detector'
import MqttClient from './mqtt.js'
import Audio from './audio.js'
import * as handlers from './handlers/linto.js'
import * as axios from 'axios'
import base64Js from 'base64-js'

export default class Linto extends EventTarget {
    constructor(httpAuthServer, requestToken, commandTimeout = 10000) {
        super()
        this.browser = UaDeviceDetector.parseUserAgent(window.navigator.userAgent)
        this.commandTimeout = commandTimeout
        // Status
        this.commandPipeline = false
        this.streaming = false
        // Server connexion
        this.httpAuthServer = httpAuthServer
        this.requestToken = requestToken
        this.mqtt = new MqttClient()
        this.mqtt.addEventListener("connect", handlers.mqttConnect.bind(this))
        this.mqtt.addEventListener("connect_fail", handlers.mqttConnectFail.bind(this))
        this.mqtt.addEventListener("error", handlers.mqttError.bind(this))
        this.mqtt.addEventListener("disconnect", handlers.mqttDisconnect.bind(this))
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
    /******************************
     * Application state management
     ******************************/
    triggerHotWord(dummyHotwordName = "dummy") {
        this.audio.vad.dispatchEvent(new CustomEvent("speaking", {
            detail: true
        }))
        this.audio.hotword.dispatchEvent(new CustomEvent("hotword", {
            detail: dummyHotwordName
        }))
    }

    startAudioAcquisition(useHotword = true, hotwordModel = "linto") {
        if (!this.audio) {
            this.audio = new Audio(this.browser.isMobile(), useHotword, hotwordModel)
            this.audio.vad.addEventListener("speakingStatus", handlers.vadStatus.bind(this))
        }
    }

    pauseAudioAcquisition() {
        if (this.audio) {
            this.audio.pause()
        }
    }

    resumeAudioAcquisition() {
        if (this.audio) {
            this.audio.resume()
        }
    }

    stopAudioAcquisition() {
        if (this.audio) this.audio.stop()
        this.stopCommandPipeline()
        this.stopStreaming()
        delete this.audio
    }

    startCommandPipeline() {
        if (!this.commandPipeline) {
            this.commandPipeline = true
            this.audio.hotword.addEventListener("hotword", handlers.hotword.bind(this))
            this.mqtt.addEventListener("nlp", handlers.nlpAction.bind(this))
        }
    }

    stopCommandPipeline() {
        if (this.commandPipeline) {
            this.commandPipeline = false
            this.audio.hotword.removeEventListener("hotword", handlers.hotword.bind(this))
            this.mqtt.removeEventListener("nlp", handlers.nlpAction.bind(this))
        }
    }

    startStreaming() {
        if (!this.streaming) {
            this.audio.startStreaming()
            this.streaming = true
        }
    }

    stopStreaming() {
        if (this.streaming) {
            this.audio.stopStreaming()
            this.streaming = false
        }
    }

    transcribe(audioFile) {

    }

    /*********
     * Actions
     *********/
    listenCommand() {
        this.audio.listenCommand()
    }

    async sendCommand() {
        try {
            const b64Audio = await this.audio.getCommand()
            this.dispatchEvent(new CustomEvent("command_acquired"))
            const id = await this.mqtt.publishAudioCommand(b64Audio)
            this.dispatchEvent(new CustomEvent("command_published", {
                detail: id
            }))
            setTimeout(() => {
                // Check if id is still in the array of "to be processed commands"
                // Mqtt handles itself the removal of received transcriptions
                if (this.mqtt.pendingCommandIds.includes(id)) {
                    this.dispatchEvent(new CustomEvent("command_timeout", {
                        detail: id
                    }))
                }
            }, this.commandTimeout)
        } catch (e) {
            this.dispatchEvent(new CustomEvent("command_error", {
                detail: e
            }))
        }
    }
}

window.Linto = Linto

// this.client.addListener('message',(d,p)=>{
//     console.log("message",d,p)
//     try {
//         speechSynthesis.speak(new SpeechSynthesisUtterance(JSON.parse(p.toString()).behavior.say.phonetic));
//     } catch(e){
//         console.log(e)
//     }

// })