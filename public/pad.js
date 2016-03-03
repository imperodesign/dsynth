// @import sample-urls.js

var socket = null
var samples = null
var sources = []
var activeSources = {}

var audioContext = window.wavesAudio.audioContext;

function loadSamples (urls) {
  return Promise.all(urls.map(function (soundURL) { return loadSample(soundURL) }))
}

function loadSample (url) {
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then(function (response) {
        return response.arrayBuffer()
      })
      .then(function (buffer) {
        audioContext.decodeAudioData(buffer, function (decodedAudioData) {
          resolve(decodedAudioData);
        })
      })
    })
}

loadSamples(sampleURLS)
  .then(function (s) {
    samples = s
    $('.key-wrapper h1').hide()
    $('ul.hidden').removeClass('hidden')

    socket = io.connect(window.websocketsURL || 'http://127.0.0.1:3007')

    socket.on('SERVER:PLAY', function (data) {
      console.log('SERVER:PLAY', data)
      $("li[data-source='"+data.source+"']").addClass('active')

      activeSources[data.source] = { input: 'SOCKET' }

      startSound(data.source)
    })

    socket.on('SERVER:STOP', function (data) {
      console.log('SERVER:STOP', data)
      $("li[data-source='"+data.source+"']").removeClass('active')

      delete activeSources[data.source]

      stopSound(data.source)
    })

    socket.on('SERVER:STOP:ALL', function (data) {
      console.log('SERVER:STOP:ALL', data)

      data.sources.forEach(function (source) {
        $("li[data-source='"+source+"']").removeClass('active')

        delete activeSources[source]

        stopSound(source)
      })
    })

  })

var fired = {}

$(window).keydown(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which)
  if (fired[code] === true) return
  fired[code] = true

  var $el = $("li[data-code='"+code+"']")
  var _source = $el.data('source')
  if (!_source) return
  console.log('CLIENT:PLAY', {source: _source})
  socket.emit('CLIENT:PLAY', {source: _source})
})

$(window).keyup(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which)
  fired[code] = false

  var $el = $("li[data-code='"+code+"']")
  var _source = $el.data('source')
  if (!_source) return
  console.log('CLIENT:STOP', {source: _source})
  socket.emit('CLIENT:STOP', {source: _source})
})

// Detect Mouse Events
$('li').mousedown(function(event) {
  var _source = $(this).data('source')
  if (!_source) return
  console.log('CLIENT:PLAY', {source: _source})
  socket.emit('CLIENT:PLAY', {source: _source})
})

$('li').mouseup(function(event) {
  var _source = $(this).data('source')
  if (!_source) return
  console.log('CLIENT:STOP', {source: _source})
  socket.emit('CLIENT:STOP', {source: _source})
})

// Synthesis
function startSound(index) {
  if (samples === null) return

  var source = audioContext.createBufferSource()
  sources[index] = source
  var currentAudioBuffer = samples[index]

  source.loop = true;
  source.connect(audioContext.destination)
  source.buffer = currentAudioBuffer

  source.start(0)
}

function stopSound(index) {
  if (samples === null) return

  sources[index].stop()
  delete sources[index]
}

console.log('Craft with love by Jacopo Daeli within Impero.')
