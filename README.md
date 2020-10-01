# linto-web-client

A full figured LinTO client designed for building custom voice interactions on a webpage.

See demo here : [linto.ai](https://linto.ai)

LinTO Web client relies on WebVoiceSDK for handling everything related to audio input, hotword triggers, recordings... See [LinTO WebVoiceSDK on NPM](https://www.npmjs.com/package/@linto-ai/webvoicesdk) for more informations


## instanciante

```js
try{
window.linto = await new Linto(`${My_linto_stack_domain}/overwatch/local/web/login`,`${my_app_token}`,`${ms_timeout_delay_for_commands}`)
} catch(lintoError){
// handle the error
}
```

### Handling errors

This command might throw an error if something bad occurs

## Instance methods

startAudioAcquisition(true, "linto", 0.99) // Uses hotword built in WebVoiceSDK by name / model / threshold
startCommandPipeline()

## Instance events

Use events with :
```js
linto.addEventListener("event_name", customHandlingFunction)
```

linto.addEventListener("mqtt_connect",mqttConnectHandler)
linto.addEventListener("mqtt_connect_fail",mqttConnectFailHandler)
linto.addEventListener("mqtt_error", mqttErrorHandler)
linto.addEventListener("speaking_on", audioSpeakingOn)
linto.addEventListener("speaking_off", audioSpeakingOff)
linto.addEventListener("command_acquired", commandAcquired)
linto.addEventListener("command_published", commandPublished)
linto.addEventListener("command_timeout", commandTimeout)
linto.addEventListener("hotword_on", hotword)
linto.addEventListener("say_feedback_from_skill", sayFeedback)
linto.addEventListener("ask_feedback_from_skill", askFeedback)

