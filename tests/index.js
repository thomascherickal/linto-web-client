import Linto from '../src/linto.js'

let mqttConnectHandler = function (event) {
    console.log("mqtt up !")
}

let mqttConnectFailHandler = function (event) {
    console.log("Mqtt failed to connect : ")
    console.log(event)
}

let mqttErrorHandler = function (event) {
    console.log("An MQTT error occured : ", event.detail)
}

let mqttDisconnectHandler = function (event) {
    console.log("MQTT Offline")
}

let audioSpeakingOn = function (event) {
    console.log("Speaking")
}

let audioSpeakingOff = function (event) {
    console.log("Not speaking")
}

let commandAcquired = function (event) {
    console.log("Command acquired")
}

let commandPublished = function (event) {
    console.log("Command published id :", event.detail)
}

let hotword = function (event) {
    console.log("Hotword triggered : ", event.detail)
}

let commandTimeout = function (event) {
    console.log("Command timeout, id : ", event.detail)
}

let sayFeedback = async function (event) {
    console.log("Saying : ", event.detail.behavior.say.text, " ---> Answer to : ", event.detail.transcript)
    await linto.say(linto.lang, event.detail.behavior.say.text)
}

let askFeedback = async function (event) {
    console.log("Asking : ", event.detail.behavior.ask.text, " ---> Answer to : ", event.detail.transcript)
    await linto.ask(linto.lang, event.detail.behavior.ask.text)
}

let streamingChunk = function (event) {
    if (event.detail.behavior.streaming.partial)
    console.log("Streaming chunk received : ", event.detail.behavior.streaming.partial)
    if (event.detail.behavior.streaming.text)
    console.log("Streaming utterance completed : ", event.detail.behavior.streaming.text)
}

let streamingStart = function (event) {
    console.log("Streaming started with no errors")
}

let streamingFinal = function (event) {
    console.log("Streaming ended, here's the final transcript : ",event.detail.behavior.streaming.result)
}

let streamingFail = function (event) {
    console.log("Streaming cannot start : ",event.detail)
}

let customHandler = function (event) {
    console.log(`${event.detail.behavior.customAction.kind} fired`)
    console.log(event.detail.behavior)
    console.log(event.detail.transcript)
}



window.start = async function () {
    try {
        window.linto = new Linto("https://stage.linto.ai/overwatch/local/web/login", "P3y0tRCHQB6orRzL", 10000)
        // Some feedbacks for UX implementation
        linto.addEventListener("mqtt_connect", mqttConnectHandler)
        linto.addEventListener("mqtt_connect_fail", mqttConnectFailHandler)
        linto.addEventListener("mqtt_error", mqttErrorHandler)
        linto.addEventListener("mqtt_disconnect", mqttDisconnectHandler)
        linto.addEventListener("speaking_on", audioSpeakingOn)
        linto.addEventListener("speaking_off", audioSpeakingOff)
        linto.addEventListener("command_acquired", commandAcquired)
        linto.addEventListener("command_published", commandPublished)
        linto.addEventListener("command_timeout", commandTimeout)
        linto.addEventListener("hotword_on", hotword)
        linto.addEventListener("say_feedback_from_skill", sayFeedback)
        linto.addEventListener("ask_feedback_from_skill", askFeedback)
        linto.addEventListener("streaming_start", streamingStart)
        linto.addEventListener("streaming_chunk", streamingChunk)
        linto.addEventListener("streaming_final", streamingFinal)
        linto.addEventListener("streaming_fail", streamingFail)
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