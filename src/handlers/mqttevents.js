export function mqttConnectHandler(){
    //clear any previous subs
    this.client.unsubscribe(this.ingress)
    this.client.subscribe(this.ingress, (e)=>{
        if (!e){
            let payload = {
                "connexion":"online",
                "on":new Date().toJSON()
            }
            console.log("ok")
            this.publish('status',payload,2,false,true)
        } else {
            console.log(e)
        }
    })
}


export function mqttMessageHandler(topic,payload){

}

export function mqttDisconnectHandler(){

}