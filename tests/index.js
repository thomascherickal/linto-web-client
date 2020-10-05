import Linto from '../src/linto.js'

let mqttConnectHandler = function (event) {
    console.log("mqtt up !")
}

let mqttConnectFailHandler = function (event) {
    console.log(event)
}

let mqttErrorHandler = function (event) {
    console.log(event)
}

let audioSpeakingOn = function (event) {
    console.log("speaking")
}

let audioSpeakingOff = function (event) {
    console.log("Not speaking")
}

let commandAcquired = function (event) {
    console.log("command acquired")
}

let commandPublished = function (event) {
    console.log("command published id :", event.detail)
}

let hotword = function (event) {
    console.log("Hotword triggered : ", event.detail)
}

let commandTimeout = function (event) {
    console.log("Command timeout :( id : ", event.detail)
}

let sayFeedback = async function (event) {
    console.log(event)
    console.log("saying : ", event.detail.behavior.say.text)
    await linto.say(linto.lang, event.detail.behavior.say.text)
}

let askFeedback = async function (event) {
    console.log("asking : ", event.detail.behavior.ask.text)
    await linto.ask(linto.lang, event.detail.behavior.ask.text)
}

let customHandler = async function(event){
    console.log(`${event.detail.behavior.customAction.kind} fired`)
}



window.start = async function () {
    try {
        window.linto = new Linto("https://stage.linto.ai/overwatch/local/web/login", "8Krjlt3SXRA1V5OG", 10000)
        // Some feedbacks for UX implementation
        linto.addEventListener("mqtt_connect", mqttConnectHandler)
        linto.addEventListener("mqtt_connect_fail", mqttConnectFailHandler)
        linto.addEventListener("mqtt_error", mqttErrorHandler)
        linto.addEventListener("speaking_on", audioSpeakingOn)
        linto.addEventListener("speaking_off", audioSpeakingOff)
        linto.addEventListener("command_acquired", commandAcquired)
        linto.addEventListener("command_published", commandPublished)
        linto.addEventListener("command_timeout", commandTimeout)
        linto.addEventListener("hotword_on", hotword)
        linto.addEventListener("say_feedback_from_skill", sayFeedback)
        linto.addEventListener("ask_feedback_from_skill", askFeedback)
        linto.addEventListener("custom_action_from_skill", customHandler)
        await linto.login()
        linto.startAudioAcquisition(true, "linto", 0.99) // Uses hotword built in WebVoiceSDK by name / model / threshold (0.99 is fine enough)
        linto.startCommandPipeline()
        return true
    } catch (e) {
        console.log(e)
        return e.message
    }

}

start()