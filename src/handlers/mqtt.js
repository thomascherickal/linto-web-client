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
        const action = topicArray[3] // i.e nlp
        const message = new Object()
        switch(action){
            case "nlp":
                message.payload = JSON.parse(payload.toString())
                speechSynthesis.speak(new SpeechSynthesisUtterance(message.payload.behavior.say.phonetic))
                break
        }
        this.dispatchEvent(new CustomEvent(action, {
            detail: message
        }))
    } catch (e) {
        this.dispatchEvent(new CustomEvent("mqtt_message_error", e))
    }
}

export function mqttDisconnect() {

}


export function mqttOffline() {

}

export function mqttError() {

}