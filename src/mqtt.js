import * as mqtt from 'mqtt'
import * as handlers from "./handlers/mqtt"

export default class MqttClient extends EventTarget {

    constructor() {
        super()
        this.conversationData = {} // Context for long running transactions (interactive asks)
        this.pendingCommandIds = new Array() // Currently being processed ids
    }

    connect(userInfo, mqttInfo) {
        this.userInfo = userInfo
        this.ingress = `${userInfo.topic}/tolinto/${userInfo.session_id}/#` // Everything to receive by this instance
        this.egress = `${userInfo.topic}/fromlinto/${userInfo.session_id}` // Base for sent messages

        const cnxParam = {
            clean: true,
            keepalive: 10,
            reconnectPeriod: Math.floor(Math.random() * 1000) + 1000, // ms for reconnect
            will: {
                topic: `${this.egress}/status`,
                retain: false,
                payload: JSON.stringify({
                    connexion: "offline"
                })
            },
            qos: 2
        }

        if (mqttInfo.mqtt_use_login) {
            cnxParam.username = mqttInfo.mqtt_login
            cnxParam.password = mqttInfo.mqtt_password
        }
        this.client = mqtt.connect(mqttInfo.host, cnxParam)
        // Listen events from this.client (mqtt client)
        this.client.addListener("connect", handlers.mqttConnect.bind(this))
        this.client.addListener("disconnect", handlers.mqttDisconnect.bind(this))
        this.client.addListener("error", handlers.mqttError.bind(this))
        this.client.addListener("offline", handlers.mqttOffline.bind(this))
        this.client.addListener("message", handlers.mqttMessage.bind(this))
    }

    async publish(topic, value, qos = 2, retain = false, requireOnline = true) {
        return new Promise((resolve, reject)=>{
            value.auth_token = `WebApplication ${this.userInfo.auth_token}`
            const pubTopic = `${this.egress}/${topic}`
            const pubOptions = {
                "qos": qos,
                "retain": retain
            }
            if (requireOnline === true) {
                if (this.client.connected !== true) return
                this.client.publish(pubTopic, JSON.stringify(value), pubOptions, (err) => {
                    if (err) return reject(err)
                    return resolve()
                })
            }
        })
    }


    async publishAudioCommand(b64Audio) {
        return new Promise((resolve, reject)=>{
            const pubOptions = {
                "qos": 0,
                "retain": false
            }
            const fileId = Math.random().toString(36).substring(4)
            const pubTopic = `${this.egress}/nlp/file/${fileId}`
            const payload = {
                "audio": b64Audio,
                "auth_token":`WebApplication ${this.userInfo.auth_token}`,
                "conversationData": this.conversationData
            }
            this.client.publish(pubTopic, JSON.stringify(payload), pubOptions, (err) => {
                if (err) return reject(err)
                this.pendingCommandIds.push(fileId)
                return resolve(fileId)
            })
        })
    }

    disconnect() {
        this.client.end()
    }

}