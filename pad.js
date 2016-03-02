// Detect Key Events
// $(window).on("keydown", function(event){

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
];

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
      });
    })
}

var samples = null
var sources = []

loadSamples(sampleURLS)
  .then(function (s) {
    samples = s
    $('.key-wrapper h1').hide()
    $('ul.hidden').removeClass('hidden')
  })

var fired = {};

$(window).keydown(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which);
  // if(osc[code])
  //   return;

  if (fired[code] === true) return

  fired[code] = true

  $("li[data-code='"+code+"']").addClass("active")
  var key = $("li[data-code='"+code+"']").data("key");
  var code = $("li[data-code='"+code+"']").data("code");
  //console.log("KEYON:" + key + "/" + code + "@" + event.timeStamp);
  startSound($("li[data-code='"+code+"']").data("source"));
  $("li[data-code='"+code+"']").addClass("active")
  // $(this).off(event);
});

$(window).keyup(function(event) {
  var code = (event.keyCode ? event.keyCode : event.which);

  fired[code] = false

  $("li[data-code='"+code+"']").removeClass("active")
  var key = $("li[data-code='"+code+"']").data("key");
  var code = $("li[data-code='"+code+"']").data("code");
  //console.log("KEYOFF:" + key + "/" + code + "@" + event.timeStamp);
  // if(!osc[code])
  //   return;
  stopSound($("li[data-code='"+code+"']").data("source"));
  $("li[data-code='"+code+"']").removeClass("active")
});



// Detect Mouse Events
$("li").mousedown(function(event) {
  $(this).addClass("active");
  var key = $(this).data("key");
  var code = $(this).data("code");
  //console.log("MOUSEON:" + key + "/" + code + "@" + event.timeStamp);
  startSound($(this).data("source"));
  $(this).addClass("active")
});

$("li").mouseup(function(event) {
  $(this).removeClass("active");
  var key = $(this).data("key");
  var code = $(this).data("code");
  //console.log("MOUSEOFF:" + key + "/" + code + "@" + event.timeStamp);
  stopSound($(this).data("source"));
  $(this).removeClass("active")
});

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
