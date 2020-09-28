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

export function nlpAction(event){

}

export function mqttConnectFail() {

}

export function mqttError() {

}

export function mqttDisconnect() {

}