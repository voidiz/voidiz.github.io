// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
// Panner: https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
'use strict';

const VOLUME_TICK = 0.05;
const MAX_VOLUME = 1;
const MIN_VOLUME = 0;
const INITIAL_VOLUME = 0.5;
const AUDIO_ELEM = document.querySelector('audio');

const MAX_DROPS = 200;

var audioContext;
var source;
var gainNode;
var analyzer;
var bufferLength;
var dataArray;
var currentVolume;
var playing = false;

var img;
var imgRatio = 16 / 9;
var imgWidth;
var imgHeight;

var drops = [];

function initAudio() {
  audioContext = new AudioContext();
  source = audioContext.createMediaElementSource(AUDIO_ELEM);
  gainNode = audioContext.createGain();
  analyzer = audioContext.createAnalyser();

  currentVolume = gainNode.gain.value = INITIAL_VOLUME;
  source.connect(analyzer);
  analyzer.connect(gainNode);
  gainNode.connect(audioContext.destination);

  analyzer.fftSize = 128;
  bufferLength = analyzer.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function adjustVolume(delta) {
  currentVolume = Math.round(gainNode.gain.value * 100) / 100;

  if ((currentVolume == MAX_VOLUME && delta > 0) ||
    (currentVolume == MIN_VOLUME && delta < 0)) {
    return;
  }

  gainNode.gain.value += delta;
  currentVolume = Math.round(gainNode.gain.value * 100) / 100;
}

function mouseClicked() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  if (playing === false) {
    AUDIO_ELEM.play();
    playing = true;
  } else {
    AUDIO_ELEM.pause();
    playing = false;
  }
}

function mouseWheel(e) {
  var delta = -VOLUME_TICK * Math.sign(e.deltaY);
  adjustVolume(delta);
}

function windowResized() {
  calcImageDimensions();
  resizeCanvas(windowWidth, windowHeight);
}

function calcImageDimensions() {
  imgWidth = windowHeight * imgRatio;
  imgHeight = imgWidth / imgRatio;

  if (imgWidth < windowWidth) {
    imgWidth = windowWidth;
    imgHeight = imgWidth / imgRatio;
  }
}

class Drop {
  constructor() {
    this.x = random(-windowWidth / 3, windowWidth);
    this.y = random(-10, -5);
    this.xs = windowWidth * 0.005;
    this.ys = random(windowHeight * 0.01, windowHeight * 0.02);
    this.len = random(windowHeight * 0.02, windowHeight * 0.04);
    this.opacity = 0;
    this.color = color(168, 221, 247);
  }

  fall() {
    this.x += this.xs;
    this.y += this.ys;

    if (this.x > windowWidth || this.y > windowHeight) {
      this.x = random(-windowWidth / 3, windowWidth);
      this.y = random(-10, -5);
      this.xs = windowWidth * 0.005;
      this.ys = random(windowHeight * 0.01, windowHeight * 0.02);
    }
  }

  show() {
    var x2 = this.x + this.xs / this.ys * this.len;

    this.color.setAlpha(this.opacity);
    strokeWeight(2);
    stroke(this.color);
    line(this.x, this.y, x2, this.y + this.len);
  }

  fadeIn() {
    if (this.opacity < 255) {
      this.opacity += 5;
    }
  }

  fadeOut() {
    if (this.opacity > 0) {
      this.opacity -= 5;
    }
  }
}

function preload() {
  img = loadImage('bg.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calcImageDimensions();
  img.loadPixels();

  for (var i = 0; i < MAX_DROPS; i++) {
    drops[i] = new Drop();
  }

  // Set playing attribute to false if song ends
  AUDIO_ELEM.addEventListener('ended', () => {
    playing = false;
  }, false);

  initAudio();
}

function draw() {
  image(img, 0, 0, imgWidth, imgHeight);

  analyzer.getByteFrequencyData(dataArray);
  var mult = (windowWidth / 4) * dataArray[0] / 255

  var dropAmount = currentVolume / MAX_VOLUME * MAX_DROPS * playing;

  for (var i = 0; i < MAX_DROPS; i++) {
    drops[i].fall();
    drops[i].show();
    
    if (i < dropAmount) {
      drops[i].fadeIn();
    } else {
      drops[i].fadeOut();
    }
  }
}