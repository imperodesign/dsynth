// pad.js

var socket = null
var samples = null
var sources = []
var activeSources = {}

var sampleURLS = [
  './media/bass-1.mp3',
  './media/bass-2.mp3',
  './media/bass-3.mp3',
  './media/drums1-1.mp3',
  './media/drums1-2.mp3',
  './media/drums1-3.mp3',
  './media/drums2-1.mp3',
  './media/drums2-2.mp3',
  './media/drums3-1.mp3',
  './media/drums3-2.mp3',
  './media/drums3-3.mp3',
  './media/fx-1.mp3',
  './media/guitar-1.mp3',
  './media/guitar-2.mp3',
  './media/synths-1.mp3',
  './media/synths-10.mp3',
  './media/synths-11.mp3',
  './media/synths-2.mp3',
  './media/synths-3.mp3',
  './media/synths-4.mp3',
  './media/synths-5.mp3',
  './media/synths-6.mp3',
  './media/synths-7.mp3',
  './media/synths-8.mp3',
  './media/synths-9.mp3',
  './media/voice-1.mp3',
  './media/voice-2.mp3',
  './media/voice-3.mp3',
  './media/voice-4.mp3',
  './media/voice-5.mp3',
  './media/x-daft-1.wav',
  './media/x-daft-2.wav',
  './media/x-daft-3.wav',
  './media/x-shit-1.wav',
  './index.wav'
]

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

    socket = io.connect('http://dsynth.prd.impero.me')

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

  })

var fired = {}

$(window).keydown(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which)
  if (fired[code] === true) return
  fired[code] = true

  var $el = $("li[data-code='"+code+"']")
  var _source = $el.data('source')

  if (activeSources[_source] && activeSources[_source].input === 'SOCKET') return

  // if (activeSources[_source]) return
  // activeSources[_source] = { input: 'KEYBOARD' }

  console.log('CLIENT:PLAY', {source: _source})
  socket.emit('CLIENT:PLAY', {source: _source})

  $el.addClass('active')
  startSound(_source)
  $el.addClass('active')
})

$(window).keyup(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which)
  fired[code] = false

  var $el = $("li[data-code='"+code+"']")
  var _source = $el.data('source')

  if (activeSources[_source] && activeSources[_source].input === 'SOCKET') return

  // if (activeSources[_source]) {
  //   if (activeSources[_source].input === 'SOCKET') {
  //     return
  //   } else {
  //     delete activeSources[_source]
  //   }
  // }

  console.log('CLIENT:STOP', {source: _source})
  socket.emit('CLIENT:STOP', {source: _source})

  $el.removeClass('active')
  stopSound(_source)
  $el.removeClass('active')
})

// Detect Mouse Events
$('li').mousedown(function(event) {

  var _source = $(this).data('source')

  if (activeSources[_source] && activeSources[_source].input === 'SOCKET') return

  // if (activeSources[_source]) return
  // activeSources[_source] = { input: 'MOUSE' }

  $(this).addClass('active')


  console.log('CLIENT:PLAY', {source: _source})
  socket.emit('CLIENT:PLAY', {source: _source})

  startSound(_source)
  $(this).addClass('active')
})

$('li').mouseup(function(event) {
  var _source = $(this).data('source')

  if (activeSources[_source] && activeSources[_source].input === 'SOCKET') return

  // if (activeSources[_source]) {
  //   if (activeSources[_source].input === 'SOCKET') {
  //     return
  //   } else {
  //     delete activeSources[_source]
  //   }
  // }

  $(this).removeClass('active')

  console.log('CLIENT:STOP', {source: _source})
  socket.emit('CLIENT:STOP', {source: _source})

  stopSound(_source)
  $(this).removeClass('active')
})

// Synthesis
function startSound(index) {
  if (samples === null) return

  // Just in case something nasty happen
  if (sources[index]) {
    stopSound(index)
  }

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

setInterval(function () {
  console.log(activeSources)
}, 2000)
