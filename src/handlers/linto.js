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



// Might be an error
export function streamingStartAck(event) {
    this.streamingPublishHandler = streamingPublish.bind(this)
    if (event.detail.behavior.streaming.status == "started"){
        this.audio.downSampler.addEventListener("downSamplerFrame", this.streamingPublishHandler)
        this.dispatchEvent(new CustomEvent("streaming_start", {
            detail: event.detail
        }))
    } else if (event.detail.behavior.streaming.error) {
        this.dispatchEvent(new CustomEvent("streaming_fail", {
            detail: event.detail
        }))
    } else {
        this.dispatchEvent(new CustomEvent("streaming_fail", {
            detail: event.detail
        }))
    }
}

export function streamingFinal(event){
    this.dispatchEvent(new CustomEvent("streaming_final", {
        detail: event.detail
    }))
}

export function streamingChunk(event){
    this.dispatchEvent(new CustomEvent("streaming_chunk", {
        detail: event.detail
    }))
}

export function streamingStopAck(event){
    this.audio.downSampler.removeEventListener("downSamplerFrame", this.streamingPublishHandler)
    this.dispatchEvent(new CustomEvent("streaming_stop", {
        detail: event.detail
    }))
}

export function streamingFail(event){

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

// Local
function streamingPublish(event) {
    this.mqtt.publishStreamingChunk(event.detail)
}
