// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
// Panner: https://developer.mozilla.org/en-US/docs/Web/API/PannerNode
'use strict';

const VOLUME_TICK = 0.05;
const MAX_VOLUME = 1;
const MIN_VOLUME = 0;
const INITIAL_VOLUME = 0.5;

const PLAY_BUTTON = document.querySelector('button');
const VOLUME_IND = document.querySelector('#volume');
const AUDIO_ELEM = document.querySelector('audio');

var width = window.innerWidth;
var height = window.innerHeight;

var audioContext;
var source;
var gainNode;
var analyzer;
var currentVolume;
var bufferLength;
var dataArray;

var drawCounter = 0;
var angle = 0;

function initAudio() {
  audioContext = new AudioContext();
  source = audioContext.createMediaElementSource(AUDIO_ELEM);
  gainNode = audioContext.createGain();
  analyzer = audioContext.createAnalyser();

  VOLUME_IND.textContent = gainNode.gain.value = INITIAL_VOLUME;
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
  VOLUME_IND.textContent = currentVolume;
}

function setup() {
  // Listen for play/pause button clicks
  PLAY_BUTTON.addEventListener('click', function() {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    } 

    if (this.dataset.playing === 'false') {
      AUDIO_ELEM.play();
      this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
      AUDIO_ELEM.pause();
      this.dataset.playing = 'false';
    }
  }, false);

  // Listen for scroll
  window.addEventListener('wheel', function(e) {
    var delta = -VOLUME_TICK * Math.sign(e.deltaY);
    adjustVolume(delta);
  }, false);

  // Set playing attribute to false if song ends
  AUDIO_ELEM.addEventListener('ended', () => {
    PLAY_BUTTON.dataset.playing = 'false'; 
  }, false);

  initAudio();
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw_removethisafter() {
  background(0);
  translate(windowWidth / 2, windowHeight / 2);
  rectMode(CENTER);
  rotate(angle);
  fill(0);
  stroke(255, 0, 0);

  analyzer.getByteFrequencyData(dataArray);
  var mult = (windowWidth / 4) * dataArray[0]/255
  rect(0, 0, mult, mult);
  angle += 0.02;
  drawCounter++;
}
