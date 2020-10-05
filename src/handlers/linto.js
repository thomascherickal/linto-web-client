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
    if (event.detail.behavior.customAction) {
        this.dispatchEvent(new CustomEvent("custom_action_from_skill", {
            detail: event.detail
        }))
        return // Might handle custom_action say or ask, so we just exit here.
    }

    if (event.detail.behavior.say) {
        this.dispatchEvent(new CustomEvent("say_feedback_from_skill", {
            detail: event.detail
        }))
        return
    }

    if (event.detail.behavior.ask) {
        this.dispatchEvent(new CustomEvent("ask_feedback_from_skill", {
            detail: event.detail
        }))
    }
}


export function streamingStartAck(event) {
    if (event.detail.streaming){
        this.mqtt.addEventListener("streaming", streamingPartialAnswer.bind(this))
        this.audio.downSampler.addEventListener("downSamplerFrame", streamingPublish.bind(this))
    } else if (event.detail.error) {
        this.dispatchEvent(new CustomEvent("no_streaming", {
            detail: event.detail
        }))
        this.streaming = false
    } else {
        this.dispatchEvent(new CustomEvent("no_streaming", {
            detail: event.detail
        }))
        this.streaming = false
    }
}


export function streamingPublish(event) {

}

export function streamingPartialAnswer(event) {

}

export function ttsLangAction(event) {
    this.setTTSLang(event.detail.value)
}


export function mqttConnectFail() {

}

export function mqttError() {

}

export function mqttDisconnect() {

}