export function mqttConnect(event) {
    this.dispatchEvent(new CustomEvent("mqtt_connect", event))
}

export function vadStatus(event) {
    event.detail ? (this.dispatchEvent(new CustomEvent("speaking_on"))) : (this.dispatchEvent(new CustomEvent("speaking_off")))
}

export function hotword(hotWordEvent) {
    this.dispatchEvent(new CustomEvent("hotword_on", hotWordEvent))
    const whenSpeakingOff = async () => {
        await this.sendCommand()
        this.removeEventListener("speaking_off", whenSpeakingOff)
        this.audio.hotword.resume()
    }
    this.listenCommand()
    this.audio.hotword.pause()
    this.addEventListener("speaking_off", whenSpeakingOff)
}

export async function nlpAnswer(event) {
    if (event.detail.payload.behavior.say) {
        this.dispatchEvent(new CustomEvent("say_feedback_from_skill", {
            detail: event.detail.payload
        }))
    }

    if (event.detail.payload.behavior.ask) {
        this.dispatchEvent(new CustomEvent("ask_feedback_from_skill", {
            detail: event.detail.payload
        }))
    }

    if (event.detail.payload.behavior.action) {
        this.dispatchEvent(new CustomEvent("custom_action_from_skill", {
            detail: event.detail.payload
        }))
    }
}

export function ttsLangAction(event) {
    this.setTTSLang(event.detail.payload.value)
}


export function mqttConnectFail() {

}

export function mqttError() {

}

export function mqttDisconnect() {

}