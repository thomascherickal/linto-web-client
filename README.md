# linto-web-client

A full figured LinTO client designed for building custom voice interactions on a webpage.

See demo here : [linto.ai](https://linto.ai)

__Note__ : LinTO Web client relies on WebVoiceSDK for handling everything related to audio input, hotword triggers, recordings... See [LinTO WebVoiceSDK on NPM](https://www.npmjs.com/package/@linto-ai/webvoicesdk) for more informations

__Note__ : Any LinTO web client needs to have a token registered towards a LinTO server. See more information in LinTO's [official documentation](https://doc.linto.ai)

__Note__ : This library might cause issues (crashes) on your webpage as some browser's implementation of WebAssembly runtimes is still experimental

## Usage

With bundler :
```
npm i @linto.ai/linto-web-client
```

Static script from CDN :

```html
<script src="https://cdn.jsdelivr.net/gh/linto-ai/linto-web-client@master/dist/linto.min.js"></script>
```

Test right away :

- Tweak content in tests/index.js (your token, LinTO server endpoint etc)

```bash
npm run test
```

## instanciante

```js
try {
  window.linto = await new Linto(
    `${My_linto_stack_domain}/overwatch/local/web/login`,
    `${my_app_token}`,
    `${ms_timeout_delay_for_commands}`
  );
} catch (lintoError) {
  // handle the error
}
```

### Handling errors

This command might throw an error if something bad occurs

## Instance user methods
```js
- startAudioAcquisition(true, "linto", 0.99) // Uses hotword built in WebVoiceSDK by name / model / threshold
- startCommandPipeline() // Start to listen to hotwords and binds a publisher for acquired audio when speaking stop
- stopCommandPipeline()
- triggerHotword(dummyHotwordName = "dummy") // Manualy activate a hotword detection, use it when commandPipeline is active.
- pauseAudioAcquisition()
- resumeAudioAcquisition()
- stopAudioAcquisition()
- startStreaming(metadata = 1) // Tries to initiate a streaming transcription session with your LinTO server. The LinTO server needs a streaming skill and a streaming STT service
- stopStreaming()
- login() // Main startup command to initiate connexion towards your LinTO server
- loggout()
- say("blahblah") // Use browser text to speech
- ask("blahblah ?") // Uses browser text to speech and immediatly triggers hotword when audiosynthesis is complete
```

## Instance events

Use events with :

```js
linto.addEventListener("event_name", customHandlingFunction);
```

Available events :

- "mqtt_connect"
- "mqtt_connect_fail"
- "mqtt_error"
- "mqtt_disconnect"
- "speaking_on"
- "speaking_off"
- "command_acquired"
- "command_published"
- "command_timeout"
- "hotword_on"
- "say_feedback_from_skill"
- "ask_feedback_from_skill"
- "streaming_start"
- "streaming_chunk"
- "streaming_final"
- "streaming_fail"
- "custom_action_from_skill"

__NOTE__ : See proposed implementation in ./tests/index.js



