function getRndInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var RetroName = (function() {
  function insertName(name) {
    $('#name, .clone').text('Impero Synth');
  }

  function init() {

    for (var i = 0; i < 5; i++) {
      var ctext = $('<div>');
      ctext.addClass('clone');
      $('#clones').append(ctext);
    }

    insertName();

    $('#name').on('click', insertName);
  }

  return {
    init: init
  }
})()

var Skyline = (function() {

  var c = document.createElement('canvas'),
    ctx = c.getContext('2d')

  var NUM_BUILDINGS = 20,
    HEIGHT_VARIANTS = 4,
    MAX_HEIGHT = 200,
    WIDTH = 50,
    SPEED = -4;

  var heightSeg = Math.floor(MAX_HEIGHT / HEIGHT_VARIANTS)

  c.width = NUM_BUILDINGS * WIDTH
  c.height = MAX_HEIGHT

  ctx.fillStyle = 'black'

  for (var i = 0; i < NUM_BUILDINGS; i++) {
    var x = i * WIDTH,
      h = getRndInt(1, HEIGHT_VARIANTS) * heightSeg
    ctx.fillRect(x, MAX_HEIGHT - h, WIDTH, h)
  }

  var skyline, paralayer, pos = 0

  function update() {
    pos += SPEED
    skyline.style.backgroundPosition = pos + 'px bottom'
    paraLayer.style.backgroundPosition = (200 + pos * 0.5) + 'px bottom'
  }

  function loop() {
    requestAnimationFrame(loop)
    update()
  }

  function init() {
    skyline = document.createElement('div')
    skyline.classList.add('skyline')
    skyline.style.backgroundImage = 'url(' + c.toDataURL() + ')'
    skyline.style.height = MAX_HEIGHT + 'px'
    document.body.appendChild(skyline)

    paraLayer = skyline.cloneNode()
    paraLayer.classList.add('para')
    document.body.appendChild(paraLayer)

    loop()
  }

  return {
    init: init
  }

})()

RetroName.init()
Skyline.init()

var $body = $('body').css('display', 'none');

$(document).ready(function () {

  var player = new Audio();

  // canplaythrough event is fired when enough of the audio has downloaded
  // to play it through at the current download rate
  player.addEventListener('canplaythrough', audioLoadedHandler);


  function audioLoadedHandler(e) {
    // Audio has loaded, show the page
    $body.css('display', 'block');
    // And start the audio
    player.play();
  }

  player.src = '/public/index.wav';
  player.loop = true
})

console.log('Craft with love by Jacopo Daeli within Impero.')
