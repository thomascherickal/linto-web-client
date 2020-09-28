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
    console.log("Not speaking")
}

let commandAcquired = function(event){
    console.log("command acquired")
}

let commandPublished = function(event){
    console.log("command published id :", event.detail)
}

let hotword = async function(event){
    console.log("Hotword triggered")
}

let commandTimeout = function(event){
    console.log("Command timeout :( id : ", event.detail)
}


window.start = async function () {
    try {
        window.linto = await new Linto("https://stage.linto.ai/overwatch/local/web/login","8Krjlt3SXRA1V5OG")
        // Some feedbacks for UX implementation
        linto.addEventListener("mqtt_connect",mqttConnectHandler)
        linto.addEventListener("mqtt_connect_fail",mqttConnectFailHandler)
        linto.addEventListener("mqtt_error", mqttErrorHandler)
        linto.addEventListener("speaking_on", audioSpeakingOn)
        linto.addEventListener("speaking_off", audioSpeakingOff)
        linto.addEventListener("command_acquired", commandAcquired)
        linto.addEventListener("command_published", commandPublished)
        linto.addEventListener("command_timeout", commandTimeout)
        linto.addEventListener("hotword_on", hotword)
        linto.startAudioAcquisition()
        linto.startCommandPipeline()
    } catch(e)
    {
        console.log(e)
    }
    
}

start()