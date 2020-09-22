import * as mqtt from 'mqtt'
import {
    mqttConnectHandler,
    mqttDisconnectHandler,
    mqttMessageHandler
} from "./handlers/mqttevents"

export default class MqttClient extends EventTarget {

    constructor() {
        super()
    }

    connect(userInfo, mqttInfo) {
        this.userInfo = userInfo
        this.ingress = `${userInfo.topic}/${userInfo.session_id}/tolinto/#` // Everything to receive by this instance
        this.egress = `${userInfo.topic}/${userInfo.session_id}/fromlinto` // Base for sent messages

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
        this.client.addListener("connect", mqttConnectHandler.bind(this))
        this.client.addListener("disconnect", mqttDisconnectHandler.bind(this))
        this.client.addListener("error", mqttConnectHandler.bind(this))
        this.client.addListener("offline", mqttConnectHandler.bind(this))
        this.client.addListener("message", mqttMessageHandler.bind(this))
        return new Promise((resolve, reject)=>{

        })
    }

    publish(topic, value, qos = 2, retain = false, requireOnline = true) {
        const pubTopic = `${this.egress}/${topic}`
        const pubOptions = {
            "qos": qos,
            "retain": retain
        }
        if (requireOnline === true) {
            if (this.client.connected !== true) return
            this.client.publish(pubTopic, JSON.stringify(value), pubOptions, function (err) {
                if (err) console.log(err)
            })
        }
    }


    publishAudioCommand() {

    }

    disconnect() {
        this.client.end()
    }

}

window.m = new MqttClient()