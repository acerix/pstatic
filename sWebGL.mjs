'set strict'

/* WebGL utilities */

export const SHADER_ELEMENT_IDS = ['vertex-shader', 'fragment-shader']

export class sWebGL {

  constructor(options) {

    const self = this

    if (typeof options ==='undefined') options = {}

    // Plugins
    this.plugins = options.hasOwnProperty('plugins') ? options.plugins : {}

    // Animation stops when not awake
    this.awake = true
    window.onfocus = function() {self.awake = true}
    window.onblur = function() {self.awake = false}

    // Function called for each frame
    this.drawScene = function() {}

    // Create canvas DOM element
    this.canvas = document.createElement('canvas')
    document.body.appendChild(this.canvas)

    // Init canvas
    this.gl = this.canvas.getContext('webgl', {
      alpha: false,
      depth: false,
      preserveDrawingBuffer: true
    })

    // Handle viewport resize
    window.onresize = function() {
      self.canvas.width = window.innerWidth
      self.canvas.height = window.innerHeight
      self.gl.viewport(0, 0, self.canvas.width, self.canvas.height)
      self.gl.clear(self.gl.COLOR_BUFFER_BIT)
    }

    // Initialize WebGL
    this.init()

    // Trigger resize after init
    window.onresize()

    // Init plugins
    if (typeof this.plugins === 'object') {
      for (let i in this.plugins) if (typeof this.plugins[i].init === 'function') {
        this.plugins[i].init(this)
      }
    }

    // Start main loop
    this.life(this)

  }

  // Begin or restart rendering
  init() {
    const gl = this.gl
    //gl.clearColor(0.0, 0.0, 0.0, 1.0)
    //gl.clearDepth(1.0)
    //gl.enable(gl.DEPTH_TEST)
    //gl.depthFunc(gl.LEQUAL)
    this.initShaders()
  }

  // Load shaders
  initShaders() {
    const gl = this.gl

    const shader_program = gl.createProgram()

    // Attach shaders
    for (let i in SHADER_ELEMENT_IDS) {
      gl.attachShader(shader_program, this.getShader(SHADER_ELEMENT_IDS[i]))
    }

    gl.linkProgram(shader_program)

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(shader_program))
    }

    gl.useProgram(shader_program)

    // Position of vertex data
    const position_location = gl.getAttribLocation(shader_program, 'a_position')

    // Entropy feeder
    this.random_location = gl.getUniformLocation(shader_program, 'u_random')

    // Position vertices
    const vertices = new Float32Array([
       1,  1,  0,
      -1,  1,  0,
       1, -1,  0,
      -1, -1,  0
    ])

    // Bind position buffer
    const vertex_buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.vertexAttribPointer(position_location, 3, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, null) // unbind
    gl.enableVertexAttribArray(position_location)

  }

  // Looping callback
  life(self) {

    // Pass sWebGL instance in the callback
    const callback = function() {
      self.life(self)
    }

    // Sleep in background
    if (!self.awake) return window.setTimeout(callback, 512)

    // Draw
    this.drawScene()

    // Loop after vsync
    window.requestAnimationFrame(callback)
  }

  // Load shader from <script>
  getShader(id) {
    const gl = this.gl
    const scriptElement = document.getElementById(id)
    if (scriptElement === null) {
      throw new Error('Shader script element "' + id + '" not found')
    }
    const shader = gl.createShader(gl[scriptElement.type.replace('text/x-','').replace('-','_').toUpperCase()])
    gl.shaderSource(shader, scriptElement.textContent)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader))
    }
    return shader
  }

}
