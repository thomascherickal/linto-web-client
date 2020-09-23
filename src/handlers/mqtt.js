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
            } catch (err){
                this.dispatchEvent(new CustomEvent("connect_fail", err))
            }
        } else {
            this.dispatchEvent(new CustomEvent("connect_fail", e))
        }
    })
}


export function mqttMessage(topic, payload) {

}

export function mqttDisconnect() {

}


export function mqttOffline(){

}

export function mqttError(){

}