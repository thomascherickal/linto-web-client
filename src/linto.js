import ReTree from 're-tree'
import UaDeviceDetector from 'ua-device-detector'
import MqttClient from './mqtt.js'
import Audio from './audio.js'
import * as handlers from './handlers/linto.js'
import * as axios from 'axios'

export default class Linto extends EventTarget {
    constructor(httpAuthServer, requestToken, commandTimeout = 10000) {
        super()
        this.browser = UaDeviceDetector.parseUserAgent(window.navigator.userAgent)
        this.commandTimeout = commandTimeout
        this.lang = "en-US" // default
        // Status
        this.commandPipeline = false
        this.streaming = false
        // Server connexion
        this.httpAuthServer = httpAuthServer
        this.requestToken = requestToken
    }

    /******************************
     * Application state management
     ******************************/

    setTTSLang(lang) {
        this.lang = lang
    }

    triggerHotword(dummyHotwordName = "dummy") {
        this.audio.vad.dispatchEvent(new CustomEvent("speaking", {
            detail: true
        }))
        this.audio.hotword.dispatchEvent(new CustomEvent("hotword", {
            detail: dummyHotwordName
        }))
    }

    startAudioAcquisition(useHotword = true, hotwordModel = "linto", threshold = 0.99) {
        if (!this.audio) {
            this.audio = new Audio(this.browser.isMobile(), useHotword, hotwordModel, threshold)
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
        if (!this.commandPipeline && this.audio) {
            this.commandPipeline = true
            this.hotwordHandler = handlers.hotword.bind(this)
            this.audio.hotword.addEventListener("hotword", this.hotwordHandler)
            this.nlpAnswerHandler = handlers.nlpAnswer.bind(this)
            this.mqtt.addEventListener("nlp", this.nlpAnswerHandler)
        }
    }

    stopCommandPipeline() {
        if (this.commandPipeline && this.audio) {
            this.commandPipeline = false
            this.audio.hotword.removeEventListener("hotword", this.hotwordHandler)
            this.mqtt.removeEventListener("nlp", this.nlpAnswerHandler)
        }
    }

    startStreaming(metadata = 1) {
        if (!this.streaming && this.mqtt && this.audio) {
            this.streaming = true
            this.mqtt.startStreaming(this.audio.downSampler.options.targetSampleRate, metadata)
            // We wait start streaming acknowledgment returning from MQTT before actualy start to publish audio frames.
        }
    }

    stopStreaming() {
        if (this.streaming) {
            this.streaming = false
            // We immediatly stop streaming audio without waiting stop streaming acknowledgment
            this.audio.downSampler.removeEventListener("downSamplerFrame", this.streamingPublishHandler)
            this.mqtt.stopStreaming()
        }
    }

    /*********
     * Actions
     *********/
    async login() {
        return new Promise(async (resolve, reject) => {
            let auth
            try {
                auth = await axios.post(this.httpAuthServer, {
                    "requestToken": this.requestToken
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
            } catch (authFail) {
                if (authFail.response && authFail.response.data) return reject(authFail.response.data)
                else return reject(authFail)
            }

            try {
                this.userInfo = auth.data.user
                this.mqttInfo = auth.data.mqttConfig
                this.mqtt = new MqttClient()
                // Mqtt
                this.mqtt.addEventListener("tts_lang", handlers.ttsLangAction.bind(this))
                this.mqtt.addEventListener("streaming_start_ack", handlers.streamingStartAck.bind(this))
                this.mqtt.addEventListener("streaming_chunk", handlers.streamingChunk.bind(this))
                this.mqtt.addEventListener("streaming_stop_ack", handlers.streamingStopAck.bind(this))
                this.mqtt.addEventListener("streaming_final", handlers.streamingFinal.bind(this))
                this.mqtt.addEventListener("streaming_fail", handlers.streamingFail.bind(this))
                this.mqtt.addEventListener("mqtt_connect", handlers.mqttConnect.bind(this))
                this.mqtt.addEventListener("mqtt_connect_fail", handlers.mqttConnectFail.bind(this))
                this.mqtt.addEventListener("mqtt_error", handlers.mqttError.bind(this))
                this.mqtt.addEventListener("mqtt_disconnect", handlers.mqttDisconnect.bind(this))
                this.mqtt.connect(this.userInfo, this.mqttInfo)
            } catch (mqttFail) {
                return reject(mqttFail)
            }
            resolve(true)
        })
    }

    async logout(){
        this.stopCommandPipeline()
        this.stopStreaming()
        this.mqtt.disconnect()
        delete this.mqtt
    }

    listenCommand() {
        this.audio.listenCommand()
    }

    say(lang, text) {
        return new Promise((resolve, reject) => {
            const toSay = new SpeechSynthesisUtterance(text)
            toSay.lang = lang
            toSay.onend = resolve
            toSay.onerror = reject
            speechSynthesis.speak(toSay)
        })
    }

    async ask(lang, text) {
        await this.say(lang, text)
        this.triggerHotword()
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
                if (this.mqtt && this.mqtt.pendingCommandIds.includes(id)) {
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
module.exports = Linto