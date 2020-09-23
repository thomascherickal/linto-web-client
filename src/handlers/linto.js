/* MQTT FORWARDED EVENTS*/
export function mqttConnect(event) {
    this.dispatchEvent(new CustomEvent("mqtt_connect"))
}

export function vadStatus(event) {
    event.detail ? (this.dispatchEvent(new CustomEvent("speaking_on"))) : (this.dispatchEvent(new CustomEvent("speaking_off")))
}

export function hotword(hotWordEvent) {
    this.dispatchEvent(new CustomEvent("hotword_on"))
}

export function mqttConnectFail() {

}

export function mqttError() {

}

export function mqttDisconnect() {

}