export async function mqttConnect() {
    //clear any previous subs
    this.client.unsubscribe(this.ingress)
    this.client.subscribe(this.ingress, async (e) => {
        if (!e) {
            let payload = {
                "connexion": "online",
                "auth_token": `WebApplication ${this.userInfo.auth_token}`,
                "on": new Date().toJSON()
            }
            try {
                await this.publish('status', payload, 2, false, true)
                this.dispatchEvent(new CustomEvent("connect"))
            } catch (err) {
                this.dispatchEvent(new CustomEvent("connect_fail", {
                    detail: err
                }))
            }
        } else {
            this.dispatchEvent(new CustomEvent("connect_fail", {
                detail: e
            }))
        }
    })
}


export function mqttMessage(topic, payload) {
    try {
        // exemple topic appa62499241959338bdba1e118d6988f4d/tolinto/WEB_c3dSEMd014aE/nlp/file/eiydaeji 
        const topicArray = topic.split("/")
        const command = topicArray[3] // i.e nlp
        const message = new Object()
        message.payload = JSON.parse(payload.toString())
        switch (command) {
            // Command pipeline answers for tolinto/${sessionId}/nlp/file/${fileId}
            case "nlp":
                this.pendingCommandIds = this.pendingCommandIds.filter(element => element !== topicArray[5]) //removes from array of files to process
                // Say is the final step of a ask/ask/.../say transaction
                if (message.payload.behavior.say) this.conversationData = {}
                // otherwise sets local conversation data to the received value
                else if (message.payload.behavior.ask) this.conversationData = message.payload.behavior.conversationData
                // customAction
                this.dispatchEvent(new CustomEvent(command, {
                    detail: message.payload
                }))
                break
                // Received on connection tolinto/${sessionId}/tts_lang/
            case "tts_lang":
                this.dispatchEvent(new CustomEvent(command, {
                    detail: message.payload
                }))
                break
            case "streaming":
                if (topicArray[4] == 'start') {
                    console.log("mqtt start")
                    message.payload = JSON.parse(payload.toString()) // Received a start streaming ack
                    this.dispatchEvent(new CustomEvent("streaming_start_ack", {
                        detail: message.payload
                    }))
                }
                if (topicArray[4] == 'stop') {
                    console.log("mqtt stop")
                    message.payload = JSON.parse(payload.toString()) // Received a stop streaming ack
                    this.dispatchEvent(new CustomEvent("streaming_stop_ack", {
                        detail: message.payload
                    }))
                }
                if (topicArray[4] == 'chunk') {
                    message.payload = JSON.parse(payload.toString()) // Received a streaming chunk of data
                    this.dispatchEvent(new CustomEvent("streaming_chunk", {
                        detail: message.payload
                    }))
                }
                if (topicArray[4] == 'final') {
                    message.payload = JSON.parse(payload.toString()) // Received a streaming chunk of data
                    this.dispatchEvent(new CustomEvent("streaming_final", {
                        detail: message.payload
                    }))
                }

                break
        }
    } catch (e) {
        this.dispatchEvent(new CustomEvent("mqtt_message_error", {
            detail: e
        }))
    }
}

export function mqttDisconnect(e) {
    this.dispatchEvent(new CustomEvent("mqtt_disconnect", {
        detail: e
    }))
}


export function mqttOffline(e) {
    this.dispatchEvent(new CustomEvent("mqtt_offline", {
        detail: e
    }))
}

export function mqttError(e) {
    this.dispatchEvent(new CustomEvent("mqtt_error", {
        detail: e
    }))
}