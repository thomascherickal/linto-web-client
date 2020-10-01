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
        // exemple topc appa62499241959338bdba1e118d6988f4d/tolinto/WEB_c3dSEMd014aE/nlp/file/eiydaeji 
        const topicArray = topic.split("/")
        const command = topicArray[3] // i.e nlp
        const message = new Object()
        switch (command) {
            case "nlp":
                message.payload = JSON.parse(payload.toString())
                this.pendingCommandIds = this.pendingCommandIds.filter(element => element !== topicArray[5]) //removes from array of files to process
                // Say is the final step of a ask/ask/.../say transaction
                if (message.payload.behavior.say) this.conversationData = {}
                // otherwise sets local conversation data to the received value
                else if (message.payload.behavior.ask) this.conversationData = message.payload.behavior.conversationData
                // customAction
                if (message.payload.behavior.customAction) this.dispatchEvent(new CustomEvent(message.payload.behavior.customAction.kind, {
                    detail: message.payload.behavior.customAction.data
                }))
                this.dispatchEvent(new CustomEvent(command, {
                    detail: message
                }))
                break
            case "tts_lang":
                message.payload = JSON.parse(payload.toString())
                this.dispatchEvent(new CustomEvent(command, {
                    detail: message
                }))
                break
            case "streaming":
                if (topicArray[4] == 'start') message.payload = JSON.parse(payload.toString()) // Received a start streaming ack
                this.dispatchEvent(new CustomEvent("streaming_start", {
                    detail: message
                }))
                if (topicArray[4] == 'stop') message.payload = JSON.parse(payload.toString()) // Received a stop streaming ack
                this.dispatchEvent(new CustomEvent("streaming_stop", {
                    detail: message
                }))
                if (topicArray[4] == 'chunk') message.payload = JSON.parse(payload.toString()) // Received a streaming chunk of data
                this.dispatchEvent(new CustomEvent("streaming_chunk", {
                    detail: message
                }))
                break
        }
    } catch (e) {
        this.dispatchEvent(new CustomEvent("mqtt_message_error", {
            detail: e
        }))
    }
}

export function mqttDisconnect() {

}


export function mqttOffline() {

}

export function mqttError() {

}