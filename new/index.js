import Linto from '../src/linto.js'

window.start = async function () {
    try {
        window.linto = await new Linto("https://stage.linto.ai/overwatch/local/web/login","xx8z7DDWIKW9yhs0")
    } catch(e)
    {

    }
    
}

window.stop = async function () {

}



start()