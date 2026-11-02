/**
 * A + D | 6 MONTHS ANNIVERSARY - ROMANTIC EXPERIENCE
 * Interactive logic: Particles, Web Audio Synth, Padlock, Draggable Polaroids, Finale
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. CONFIGURATION & STATE
  // =========================================================================
  const CONFIG = {
    PASSCODE: '1201', // November 17 (17.11) - 6 months anniversary date
    COUNTDOWN_SECONDS: 5,
    AUTOPLAY_ATTEMPT: true
  };

  const STATE = {
    isMusicPlaying: false,
    giftOpened: false,
    isUnlocked: false,
    currentPasscode: '',
    draggedCard: null,
    highestZIndex: 30,
    loveMapInitialized: false
  };

  // DOM Elements
  const body = document.body;
  const musicToggle = document.getElementById('music-toggle');
  const giftBox = document.getElementById('gift-box');
  const giftWrapper = document.getElementById('gift-box-wrapper');
  const openedCard = document.getElementById('opened-card');
  const sceneLock = document.getElementById('scene-lock');
  const padlock = document.getElementById('padlock');
  const keypad = document.getElementById('keypad');
  const passcodeDisplay = document.getElementById('passcode-display');
  const slots = passcodeDisplay.querySelectorAll('.slot');
  const lockMessage = document.getElementById('lock-message');
  const btnHint = document.getElementById('btn-hint');
  const hintPopup = document.getElementById('hint-popup');
  const btnBackspace = document.getElementById('btn-backspace');
  const sceneGallery = document.getElementById('scene-gallery');
  const polaroidCards = document.querySelectorAll('.polaroid-card');
  const btnOpenLetter = document.getElementById('btn-open-letter');
  const sceneLetter = document.getElementById('scene-letter');
  const btnILoveYou = document.getElementById('btn-i-love-you');
  const finaleOverlay = document.getElementById('finale-overlay');
  const countdownNumber = document.getElementById('countdown-number');
  const closedScreen = document.getElementById('closed-screen');
  const btnReplay = document.getElementById('btn-replay');
  const touchContainer = document.getElementById('touch-effects-container');

  // Live Timer DOM Elements
  const cntDays = document.getElementById('cnt-days');
  const cntHours = document.getElementById('cnt-hours');
  const cntMinutes = document.getElementById('cnt-minutes');
  const cntSeconds = document.getElementById('cnt-seconds');

  // =========================================================================
  // 2. SYNTHESIZED AUDIO SYSTEM (WEB AUDIO API)
  // No external mp3 files needed - 100% reliable, zero network latency!
  // =========================================================================
  let audioCtx = null;
  let ambientMelodyTimer = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a soft sweet tone with envelope
  function playNote(freq, type = 'sine', duration = 0.5, volume = 0.15) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Sound Effects
  const SOUNDS = {
    giftOpen() {
      if (!audioCtx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((n, i) => {
        setTimeout(() => playNote(n, 'triangle', 0.8, 0.12), i * 110);
      });
    },
    clickKey() {
      playNote(784, 'sine', 0.08, 0.06);
      if (navigator.vibrate) navigator.vibrate(15);
    },
    keyError() {
      if (!audioCtx) return;
      playNote(220, 'sawtooth', 0.25, 0.1);
      setTimeout(() => playNote(196, 'sawtooth', 0.35, 0.1), 120);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
    },
    lockSuccess() {
      if (!audioCtx) return;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((n, i) => {
        setTimeout(() => playNote(n, 'sine', 0.7, 0.12), i * 130);
      });
      if (navigator.vibrate) navigator.vibrate([50, 100, 150]);
    },
    loveExplosion() {
      if (!audioCtx) return;
      // Grand warm chord
      const chord = [261.63, 329.63, 392.00, 523.25, 659.25];
      chord.forEach((n) => playNote(n, 'triangle', 2.5, 0.1));
      if (navigator.vibrate) navigator.vibrate([100, 100, 200, 100, 300]);
    }
  };

  // Romantic Ambient Synth Melody Loop (Soft Kalimba / Music Box style)
  const ROMANTIC_MELODY = [
    { note: 392.00, dur: 0.6 }, // G4
    { note: 440.00, dur: 0.6 }, // A4
    { note: 523.25, dur: 1.2 }, // C5
    { note: 493.88, dur: 0.8 }, // B4
    { note: 392.00, dur: 0.8 }, // G4
    { note: 329.63, dur: 1.2 }, // E4
    { note: 349.23, dur: 0.6 }, // F4
    { note: 392.00, dur: 0.6 }, // G4
    { note: 440.00, dur: 1.2 }, // A4
    { note: 392.00, dur: 0.8 }, // G4
    { note: 329.63, dur: 0.8 }, // E4
    { note: 261.63, dur: 1.5 }, // C4
  ];

  let melodyIndex = 0;
  function scheduleNextNote() {
    if (!STATE.isMusicPlaying) return;
    const current = ROMANTIC_MELODY[melodyIndex];
    playNote(current.note, 'sine', current.dur, 0.08);
    // Harmonize with soft bass octave
    if (melodyIndex % 3 === 0) {
      playNote(current.note / 2, 'triangle', current.dur * 1.5, 0.04);
    }
    melodyIndex = (melodyIndex + 1) % ROMANTIC_MELODY.length;
    ambientMelodyTimer = setTimeout(scheduleNextNote, current.dur * 1000 * 0.95);
  }

  function toggleMusic() {
    initAudio();
    STATE.isMusicPlaying = !STATE.isMusicPlaying;
    if (STATE.isMusicPlaying) {
      musicToggle.classList.add('playing');
      musicToggle.querySelector('.music-label').textContent = 'Playing ♪';
      scheduleNextNote();
    } else {
      musicToggle.classList.remove('playing');
      musicToggle.querySelector('.music-label').textContent = 'Music';
      clearTimeout(ambientMelodyTimer);
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // =========================================================================
  // 3. AMBIENT CANVAS (ROSE PETALS & FLOATING GLOWING HEARTS)
  // =========================================================================
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  const MAX_PARTICLES = window.innerWidth < 600 ? 28 : 45;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class RomanticParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.type = Math.random() > 0.4 ? 'petal' : 'heart';
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = this.type === 'petal' ? (Math.random() * 9 + 8) : (Math.random() * 12 + 10);
      this.speedY = Math.random() * 1.2 + 0.6;
      this.speedX = Math.random() * 1.2 - 0.6;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.03;
      this.tilt = Math.random() * Math.PI;
      this.tiltSpeed = Math.random() * 0.04 + 0.01;
      this.opacity = Math.random() * 0.45 + 0.35;

      // Petal colors: soft rose, velvet ruby, blush pink
      const petalColors = ['#ff4d6d', '#ff758f', '#ffb3c1', '#c9184a'];
      this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
    }

    update() {
      this.y += this.speedY;
      this.x += Math.sin(this.tilt) * 0.9 + this.speedX;
      this.rotation += this.rotSpeed;
      this.tilt += this.tiltSpeed;

      if (this.y > height + 30 || this.x < -30 || this.x > width + 30) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(Math.cos(this.tilt), 1);
      ctx.globalAlpha = this.opacity;

      if (this.type === 'petal') {
        // Draw elegant rose petal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        ctx.fill();
      } else {
        // Draw floating heart
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', 0, 0);
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new RomanticParticle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // =========================================================================
  // 4. SCREEN TAP INTERACTIVE BURSTS
  // =========================================================================
  function spawnTapHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'tap-heart';
    const hearts = ['❤️', '💖', '✨', '💕', '🌹'];
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty('--angle', `${(Math.random() - 0.5) * 50}deg`);
    touchContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1200);
  }

  window.addEventListener('click', (e) => {
    // Avoid double spawning on key/btn clicks
    if (e.target.closest('button') || e.target.closest('.key-btn')) return;
    spawnTapHeart(e.clientX, e.clientY);
  });

  window.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (e.target.closest('button') || e.target.closest('.key-btn')) return;
    spawnTapHeart(touch.clientX, touch.clientY);
  }, { passive: true });

  // =========================================================================
  // 5. SCENE 1: THE FALLING GIFT BOX (A + D)
  // =========================================================================
  function openGift() {
    if (STATE.giftOpened) return;
    STATE.giftOpened = true;

    initAudio();
    SOUNDS.giftOpen();

    // Trigger opening animation on the gift
    giftWrapper.classList.add('opened');

    // Confetti / sparkle explosion around gift
    const rect = giftBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnTapHeart(centerX + (Math.random() - 0.5) * 160, centerY + (Math.random() - 0.5) * 160);
      }, i * 35);
    }

    // Reveal the opened greeting card
    setTimeout(() => {
      openedCard.classList.remove('hidden');
      requestAnimationFrame(() => {
        openedCard.classList.add('visible');
      });

      // UNLOCK PAGE SCROLL (After opening gift)
      body.classList.remove('scroll-locked');

      // Auto start music softly on first interaction if not yet started
      if (!STATE.isMusicPlaying) {
        toggleMusic();
      }
    }, 450);
  }

  giftBox.addEventListener('click', openGift);
  giftBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openGift();
    }
  });

  // =========================================================================
  // 6. SCENE 2: THE ROMANTIC PADLOCK
  // =========================================================================
  function updateSlots() {
    slots.forEach((slot, index) => {
      if (index < STATE.currentPasscode.length) {
        slot.classList.add('filled');
      } else {
        slot.classList.remove('filled');
      }
    });
  }

  function handleKeypadInput(key) {
    if (STATE.isUnlocked) return;
    initAudio();

    if (STATE.currentPasscode.length < 4) {
      STATE.currentPasscode += key;
      SOUNDS.clickKey();
      updateSlots();

      if (STATE.currentPasscode.length === 4) {
        verifyPasscode();
      }
    }
  }

  function handleBackspace() {
    if (STATE.isUnlocked || STATE.currentPasscode.length === 0) return;
    initAudio();
    SOUNDS.clickKey();
    STATE.currentPasscode = STATE.currentPasscode.slice(0, -1);
    updateSlots();
    passcodeDisplay.classList.remove('error');
    lockMessage.textContent = 'Enter the 4-digit date';
  }

  function verifyPasscode() {
    if (STATE.currentPasscode === CONFIG.PASSCODE) {
      // SUCCESS!
      STATE.isUnlocked = true;
      SOUNDS.lockSuccess();

      lockMessage.innerHTML = '✨ <strong>Code correct! Lock opened ❤️</strong>';
      lockMessage.style.color = '#ffd166';
      padlock.classList.add('unlocked');

      // Padlock Sparkles
      const rect = padlock.getBoundingClientRect();
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          spawnTapHeart(rect.left + rect.width / 2 + (Math.random() - 0.5) * 100, rect.top + (Math.random() - 0.5) * 80);
        }, i * 40);
      }

      // Unlock Gallery Scene (Exact user requirement)
      setTimeout(() => {
        sceneGallery.classList.remove('hidden-until-unlocked');
        sceneGallery.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Initialize or refresh interactive distance map
        setTimeout(() => {
          initLoveMap();
        }, 500);
      }, 900);

    } else {
      // WRONG CODE
      SOUNDS.keyError();
      passcodeDisplay.classList.add('error');
      lockMessage.textContent = 'Try again, my love 💖';
      lockMessage.style.color = '#ff4d6d';

      setTimeout(() => {
        STATE.currentPasscode = '';
        updateSlots();
        passcodeDisplay.classList.remove('error');
      }, 700);
    }
  }

  // Keypad event delegation
  keypad.addEventListener('click', (e) => {
    const keyBtn = e.target.closest('.key-btn');
    if (!keyBtn) return;

    const key = keyBtn.getAttribute('data-key');
    if (key !== null) {
      handleKeypadInput(key);
    }
  });

  btnBackspace.addEventListener('click', handleBackspace);

  btnHint.addEventListener('click', () => {
    initAudio();
    SOUNDS.clickKey();
    hintPopup.classList.toggle('hidden');
  });

  // Keyboard support for desktop
  window.addEventListener('keydown', (e) => {
    if (STATE.isUnlocked) return;
    if (e.key >= '0' && e.key <= '9') {
      handleKeypadInput(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    }
  });

  // =========================================================================
  // 7. SCENE 3: SCATTERED POLAROIDS INTERACTION
  // =========================================================================
  polaroidCards.forEach((card) => {
    // Tap or click brings card to front and straightens it
    card.addEventListener('click', (e) => {
      STATE.highestZIndex += 1;
      card.style.zIndex = STATE.highestZIndex;

      // Toggle active zoom state
      const wasActive = card.classList.contains('is-active');
      polaroidCards.forEach(c => c.classList.remove('is-active'));

      if (!wasActive) {
        card.classList.add('is-active');
        initAudio();
        SOUNDS.clickKey();

        // Spawn small celebratory heart at card position
        const rect = card.getBoundingClientRect();
        spawnTapHeart(rect.left + rect.width / 2, rect.top + 30);
      }
    });

    // Desktop dragging support
    card.addEventListener('mousedown', (e) => {
      if (window.innerWidth < 640) return; // on mobile, prefer tap & natural scroll
      STATE.highestZIndex += 1;
      card.style.zIndex = STATE.highestZIndex;

      const startX = e.clientX;
      const startY = e.clientY;
      const initialLeft = card.offsetLeft;
      const initialTop = card.offsetTop;

      function onMouseMove(moveEvent) {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        card.style.left = `${initialLeft + dx}px`;
        card.style.top = `${initialTop + dy}px`;
        card.style.transform = 'rotate(0deg) scale(1.06)';
      }

      function onMouseUp() {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  });

  // "I have something to tell you" Button Click
  btnOpenLetter.addEventListener('click', () => {
    initAudio();
    SOUNDS.giftOpen();
    sceneLetter.classList.remove('hidden-until-requested');

    // Smoothly scroll down to the huge realistic notebook letter
    setTimeout(() => {
      sceneLetter.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  });

  // =========================================================================
  // LIVE TIMER (COUNTING FROM MAY 17)
  // =========================================================================
  function initLiveTimer() {
    function getMay17StartDate() {
      const now = new Date();
      let year = now.getFullYear();
      if (now.getMonth() < 4) { // Before May
        year -= 1;
      }
      return new Date(year, 4, 17, 0, 0, 0);
    }

    const startDate = getMay17StartDate();

    function updateCounter() {
      const now = new Date();
      const diffMs = Math.max(0, now - startDate);

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      if (cntDays) cntDays.textContent = String(days).padStart(2, '0');
      if (cntHours) cntHours.textContent = String(hours).padStart(2, '0');
      if (cntMinutes) cntMinutes.textContent = String(minutes).padStart(2, '0');
      if (cntSeconds) cntSeconds.textContent = String(seconds).padStart(2, '0');
    }

    updateCounter();
    setInterval(updateCounter, 1000);
  }
  initLiveTimer();

  // =========================================================================
  // INTERACTIVE DISTANCE MAP (LEAFLET + CARTODB DARK)
  // Her: 40°13'54.6"N 69°16'13.5"E (40.231833, 69.270417)
  // Him: 41°20'22.9"N 69°13'54.0"E (41.339694, 69.231667)
  // =========================================================================
  const HER_COORDS = [40.231833, 69.270417];
  const HIM_COORDS = [41.339694, 69.231667];
  let loveMapInstance = null;

  function initLoveMap() {
    if (STATE.loveMapInitialized) {
      if (loveMapInstance) {
        loveMapInstance.invalidateSize();
      }
      return;
    }

    const mapContainer = document.getElementById('love-map');
    if (!mapContainer || typeof L === 'undefined') return;

    try {
      STATE.loveMapInitialized = true;

      const centerLat = (HER_COORDS[0] + HIM_COORDS[0]) / 2;
      const centerLon = (HER_COORDS[1] + HIM_COORDS[1]) / 2;

      loveMapInstance = L.map('love-map', {
        center: [centerLat, centerLon],
        zoom: 8,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false
      });

      // Free OpenStreetMap Tiles (Works 100% without any API key or restrictions)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(loveMapInstance);

      // Custom marker for Her (D)
      const iconHer = L.divIcon({
        className: 'love-custom-marker-wrapper',
        html: `
          <div class="love-custom-marker">
            <div class="marker-pin marker-pin-d">
              <div class="marker-pulse-ring"></div>
              <span class="marker-initial">D</span>
            </div>
            <div class="marker-tag-popup">Dilnura 💖</div>
          </div>
        `,
        iconSize: [40, 58],
        iconAnchor: [20, 36],
        popupAnchor: [0, -36]
      });

      // Custom marker for Him (A)
      const iconHim = L.divIcon({
        className: 'love-custom-marker-wrapper',
        html: `
          <div class="love-custom-marker">
            <div class="marker-pin marker-pin-a">
              <div class="marker-pulse-ring"></div>
              <span class="marker-initial">A</span>
            </div>
            <div class="marker-tag-popup">Asliddin 💙</div>
          </div>
        `,
        iconSize: [40, 58],
        iconAnchor: [20, 36],
        popupAnchor: [0, -36]
      });

      const markerHer = L.marker(HER_COORDS, { icon: iconHer }).addTo(loveMapInstance);
      markerHer.bindPopup("<b>D (My Universe) 💖</b><br>40°13'54.6\"N, 69°16'13.5\"E<br><i>Where all my thoughts fly every single night</i>");

      const markerHim = L.marker(HIM_COORDS, { icon: iconHim }).addTo(loveMapInstance);
      markerHim.bindPopup("<b>A (Forever Yours) 💙</b><br>41°20'22.9\"N, 69°13'54.0\"E<br><i>Counting down the moments until we meet</i>");

      // Glowing dashed flight path connecting the two coordinates
      L.polyline([HER_COORDS, HIM_COORDS], {
        color: '#ff4d6d',
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(loveMapInstance);

      // Fit bounds with comfortable padding
      loveMapInstance.fitBounds([HER_COORDS, HIM_COORDS], {
        padding: [45, 45]
      });

      // Traveling heart along the distance line
      const heartIcon = L.divIcon({
        className: 'traveling-heart',
        html: '<span style="font-size: 20px; filter: drop-shadow(0 0 6px #ff4d6d); display: inline-block;">❤️</span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const travelingHeartMarker = L.marker(HER_COORDS, { icon: heartIcon }).addTo(loveMapInstance);

      let progress = 0;
      let direction = 1;
      function animateTravelingHeart() {
        progress += 0.004 * direction;
        if (progress >= 1) {
          progress = 1;
          direction = -1;
        } else if (progress <= 0) {
          progress = 0;
          direction = 1;
        }

        const currentLat = HER_COORDS[0] + (HIM_COORDS[0] - HER_COORDS[0]) * progress;
        const currentLon = HER_COORDS[1] + (HIM_COORDS[1] - HER_COORDS[1]) * progress;
        travelingHeartMarker.setLatLng([currentLat, currentLon]);

        requestAnimationFrame(animateTravelingHeart);
      }
      animateTravelingHeart();

    } catch (e) {
      console.warn("Map initialization info:", e);
    }
  }

  window.addEventListener('resize', () => {
    if (loveMapInstance) {
      loveMapInstance.invalidateSize();
    }
  });

  // =========================================================================
  // 8. SCENE 4 & 5: "I LOVE YOU" BUTTON & GRAND FINALE
  // =========================================================================
  btnILoveYou.addEventListener('click', () => {
    initAudio();
    SOUNDS.loveExplosion();

    // Show grand finale overlay with falling huge heart
    finaleOverlay.classList.remove('hidden');

    // Spawn massive shower of hearts
    for (let i = 0; i < 40; i++) {
      setTimeout(() => {
        spawnTapHeart(Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.8);
      }, i * 60);
    }

    // Auto-close countdown timer (5 seconds)
    let remaining = CONFIG.COUNTDOWN_SECONDS;
    countdownNumber.textContent = remaining;

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining >= 0) {
        countdownNumber.textContent = remaining;
      }

      if (remaining <= 0) {
        clearInterval(timer);

        // Attempt window.close() (Exact user request)
        try {
          window.close();
        } catch (e) {
          // Modern browsers often block window.close() on scripts that didn't open the window
        }

        // Seamless fallback: fade to romantic closed-screen
        setTimeout(() => {
          closedScreen.classList.remove('hidden');
        }, 500);
      }
    }, 1000);
  });

  // Replay / Re-open Button in case browser blocks window.close
  btnReplay.addEventListener('click', () => {
    finaleOverlay.classList.add('hidden');
    closedScreen.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

});
