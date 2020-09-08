import webVoiceSDK from '@linto-ai/webvoicesdk'
import * as mqtt from 'mqtt'
import base64Js from 'base64-js'
console.log(base64Js)
import recorder from '@linto-ai/webvoicesdk/src/webvoicesdk/nodes/recorder'

let sn = 222222

function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var len = buffer.byteLength;
    for (var i = 0; i < len; i++) {
        binary += buffer[i];
    }
    return window.btoa( binary );
 }

async function publishaudio(audio, conversationData = {}){
    const pubOptions = {
        "qos": 0,
        "retain": false
    }
    const fileId = Math.random().toString(16).substring(4)
    const pubTopic = `blk/fromlinto/${sn}/nlp/file/${fileId}`
    const sendFile = audio
    const payload = {
        "audio": sendFile,
        "conversationData": conversationData
    }
    client.publish(pubTopic, JSON.stringify(payload), pubOptions, (err) => {
        if (err) return reject(err)
    })
}

const VADHandler = async function (speakingEvent) {
    if (speakingEvent.detail){
        console.log("speaking")
    } else {
        if (hotword.status == "non-emitting"){
            let audioFile = rec.punchOut()
            const audioFileBuffer = await fetch(audioFile, {
                method: 'GET'
            })
            const final = await audioFileBuffer.arrayBuffer()
            const vue = new Int8Array(final)
            const lol = base64Js.fromByteArray(vue)
            publishaudio(lol)
            hotword.resume()
        }
    }
}

const HotwordHandler = function (hotWordEvent) {
    hotword.pause()
    rec.punchIn()
}

window.mqtt = mqtt

window.client = mqtt.connect("wss://stage.linto.ai/mqtt",{
    "username":"linagora",
    "password":"argonail"
})


window.start = async function () {
    window.mic = new webVoiceSDK.Mic()
    window.downSampler = new webVoiceSDK.DownSampler()
    window.vad = new webVoiceSDK.Vad()
    window.speechPreemphaser = new webVoiceSDK.SpeechPreemphaser()
    window.feat = new webVoiceSDK.FeaturesExtractor()
    window.hotword = new webVoiceSDK.Hotword()
    window.rec = new webVoiceSDK.Recorder()
    await downSampler.start(mic)
    await vad.start(mic)
    await speechPreemphaser.start(downSampler)
    await feat.start(speechPreemphaser)
    await hotword.start(feat, vad)
    await hotword.loadModel(hotword.availableModels["linto"])
    await mic.start()
    await rec.start(downSampler)
    hotword.addEventListener("hotword", HotwordHandler)
    vad.addEventListener("speakingStatus", VADHandler)
    client.subscribe('blk/tolinto/222222/#')
    client.addListener('message',(d,p)=>{
        speechSynthesis.speak(new SpeechSynthesisUtterance(JSON.parse(p.toString()).behavior.say.text));
        
    })
    
}

window.stop = async function () {
    await downSampler.stop()
    await vad.stop()
    await speechPreemphaser.stop()
    await feat.stop()
    await hotword.stop(feat, vad)
}



start()
//client.publish("salut_mon_grand","yes",{qos:0})