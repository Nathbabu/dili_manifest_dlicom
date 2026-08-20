// Web Audio API Cyber Sound Synthesizer
const CyberAudio = (function() {
  let audioCtx = null;
  let muted = localStorage.getItem('twin_manifest_muted') === 'true';

  function initContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1, rampTo = null) {
    if (muted) return;
    try {
      initContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      if (rampTo !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(rampTo, 20), audioCtx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  return {
    isMuted: () => muted,
    toggleMute: function() {
      muted = !muted;
      localStorage.setItem('twin_manifest_muted', muted);
      return muted;
    },
    click: function() {
      playTone(800, 'square', 0.04, 0.03, 400);
    },
    hover: function() {
      playTone(1200, 'sine', 0.02, 0.015);
    },
    tab: function() {
      initContext();
      if (muted) return;
      playTone(440, 'triangle', 0.06, 0.04, 880);
    },
    equip: function() {
      initContext();
      if (muted) return;
      playTone(523.25, 'triangle', 0.08, 0.05); // C5
      setTimeout(() => playTone(659.25, 'triangle', 0.08, 0.05), 50); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.15, 0.06), 100); // G5
    },
    forge: function() {
      initContext();
      if (muted) return;
      playTone(150, 'sawtooth', 0.3, 0.08, 600);
      setTimeout(() => playTone(880, 'sine', 0.25, 0.08, 1760), 200);
    },
    ascend: function() {
      initContext();
      if (muted) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.3, 0.06), idx * 80);
      });
    },
    success: function() {
      initContext();
      if (muted) return;
      playTone(600, 'sine', 0.08, 0.05, 900);
    },
    error: function() {
      initContext();
      if (muted) return;
      playTone(180, 'sawtooth', 0.15, 0.08, 90);
    }
  };
})();
