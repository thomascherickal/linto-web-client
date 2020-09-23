import Linto from '../src/linto.js'

let mqttConnectHandler = function(event){
    console.log("mqtt up !")
}

let mqttConnectFailHandler = function(event){
    console.log(event)
}

let mqttErrorHandler = function(event){
    console.log(event)
}

let audioSpeakingOn = function(event){
    console.log("speaking")
}

let audioSpeakingOff = async function(event){
    console.log("Command acquired !")
    let commandId = linto.sendCommand()
    linto.removeEventListener("speaking_off", audioSpeakingOff)
    linto.audio.hotword.resume()
}

let hotword = async function(event){
    console.log("Starting voice command")
    linto.addEventListener("speaking_off", audioSpeakingOff)
    linto.listenCommand()
    linto.audio.hotword.pause()
}


window.start = async function () {
    try {
        window.linto = await new Linto("https://stage.linto.ai/overwatch/local/web/login","8Krjlt3SXRA1V5OG")
        linto.addEventListener("mqtt_connect",mqttConnectHandler)
        linto.addEventListener("mqtt_connect_fail",mqttConnectFailHandler)
        linto.addEventListener("mqtt_error", mqttErrorHandler)
        linto.addEventListener("speaking_on", audioSpeakingOn)
        //linto.addEventListener("speaking_off", audioSpeakingOff)
        linto.addEventListener("hotword_on", hotword)
    } catch(e)
    {
        console.log(e)
    }
    
}

window.stop = async function () {

}



start()