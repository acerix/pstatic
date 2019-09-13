'set strict'

/* Audio utilities */

export class sAudio {

  constructor(options) {

    const self = this

    let AudioContext = window.AudioContext || window.webkitAudioContext
    this.ctx = new AudioContext()

    // from https://noisehack.com/generate-noise-web-audio-api/
    const buffer_size = 1<<10
    const white_noise = this.ctx.createScriptProcessor(buffer_size, 1, 1)
    white_noise.onaudioprocess = function(e) {
        const output = e.outputBuffer.getChannelData(0)
        for (let i = 0; i < buffer_size; i++) {
            output[i] = Math.random() * 2 - 1
        }
    }
    white_noise.connect(this.ctx.destination);

  }

}
