// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
(function() {
  'use strict';

  const VOLUME_TICK = 0.05;
  const MAX_VOLUME = 2;
  const MIN_VOLUME = 0;
  const INITIAL_VOLUME = 0.5;

  const audioContext = new AudioContext();
  const audioElement = document.querySelector('audio');
  const track = audioContext.createMediaElementSource(audioElement);
  const gainNode = audioContext.createGain();

  const playButton = document.querySelector('button');
  const volumeIndicator = document.querySelector('#volume');

  volumeIndicator.textContent = gainNode.gain.value = INITIAL_VOLUME;
  track.connect(gainNode).connect(audioContext.destination);

  // Listen for play/pause button clicks
  playButton.addEventListener('click', function() {
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    } 

    if (this.dataset.playing === 'false') {
      audioElement.play();
      this.dataset.playing = 'true';
    } else if (this.dataset.playing === 'true') {
      audioElement.pause();
      this.dataset.playing = 'false';
    }
  }, false);

  // Listen for scroll
  window.addEventListener('wheel', function(e) {
    let delta = -VOLUME_TICK * Math.sign(e.deltaY);
    adjustVolume(delta);
  }, false);

  // Set playing attribute to false if song ends
  audioElement.addEventListener('ended', () => {
    playButton.dataset.playing = 'false'; 
  }, false);

  function adjustVolume(delta) {
    let currentVolume = Math.round(gainNode.gain.value * 100) / 100;

    if ((currentVolume == MAX_VOLUME && delta > 0) || (currentVolume == MIN_VOLUME && delta < 0)) {
      console.log("in here");
      return;
    }

    gainNode.gain.value += delta;
    currentVolume = Math.round(gainNode.gain.value * 100) / 100;
    volumeIndicator.textContent = currentVolume;
  }
})();
