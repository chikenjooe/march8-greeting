(function(){
  const params = new URLSearchParams(location.search);
  const rawName = (params.get('name') || '').trim();
  const name = rawName.replace(/[<>]/g, '');

  const titleEl = document.getElementById('title');
  const scoreEl = document.getElementById('score');
  const scoreBox = document.querySelector('.score');
  const soundBtn = document.getElementById('sound');
  const toggleBtn = document.getElementById('toggle');
  const card = document.getElementById('card');

  titleEl.textContent = name ? `Дорогая, ${name}!` : 'Дорогая!';

  // (buttons removed) if you need a share link, just append ?name=...

  // Hide / reveal поздравление
  let hidden = false;
  toggleBtn.addEventListener('click', () => {
    hidden = !hidden;
    card.classList.toggle('hidden', hidden);
    toggleBtn.textContent = hidden ? 'Показать поздравление' : 'Скрыть поздравление';
  });

  // 8-bit "Kalinka" (simple chiptune). Must be started by user gesture.
  let audioCtx = null;
  let master = null;
  let playing = false;
  let stopRequested = false;

  // Notes (very simplified motif, loop). 'Kalinka' is public-domain folk melody.
  const bpm = 528; // 4x faster
  const beatMs = 60000 / bpm;
  const seq = [
    // [midiNote, beats]
    [69, 1], [71, 1], [72, 2],
    [72, 1], [71, 1], [69, 2],
    [67, 1], [69, 1], [71, 2],
    [71, 1], [69, 1], [67, 2],
    [64, 2], [67, 2], [69, 4],
  ];

  function midiToFreq(n){
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  function ensureAudio(){
    if (audioCtx) return audioCtx;
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();

    // Master chain (louder + consistent across phones)
    const comp = audioCtx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 8;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;

    master = audioCtx.createGain();
    master.gain.value = 0.22;

    comp.connect(master);
    master.connect(audioCtx.destination);

    audioCtx.__comp = comp;
    return audioCtx;
  }

  async function playLoop(){
    const ctx = ensureAudio();
    stopRequested = false;
    playing = true;
    soundBtn.textContent = '⏸';

    while (!stopRequested) {
      for (const [note, beats] of seq) {
        if (stopRequested) break;

        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.value = midiToFreq(note);

        // envelope
        const now = ctx.currentTime;
        const dur = (beats * beatMs) / 1000;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        o.connect(g);
        g.connect(ctx.__comp);
        o.start(now);
        o.stop(now + dur + 0.02);

        await new Promise(r => setTimeout(r, beats * beatMs));
      }
    }

    playing = false;
    soundBtn.textContent = '♫';
  }

  async function toggleSound(){
    // Some browsers need resume() on gesture
    const ctx = ensureAudio();
    try { await ctx.resume?.(); } catch(e) {}

    if (!playing) {
      playLoop();
    } else {
      stopRequested = true;
    }
  }

  soundBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSound();
  });

  // Game: click falling flowers to pop them
  const container = document.getElementById('tulips');
  // Boss-approved set
  const flowers = [
    '🍾','🍀','🍄','🌹','🌺','🌸','🪻','🌼','🌻','🪷','🌷','🍷','🎁','❤️‍🔥','💖','💝'
  ];
  let score = 0;

  function bumpScoreUI(){
    if (!scoreBox) return;
    scoreBox.classList.remove('pulse','flash');
    // restart animations
    void scoreBox.offsetWidth;
    scoreBox.classList.add('pulse','flash');
    setTimeout(() => scoreBox.classList.remove('pulse','flash'), 320);
  }

  function setScore(v){
    score = v;
    scoreEl.textContent = String(score);
    bumpScoreUI();
  }
  setScore(0);

  function spawnFlower(){
    const el = document.createElement('div');
    el.className = 'tulip pulse';

    const inner = document.createElement('span');
    inner.className = 'inner';
    inner.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.appendChild(inner);

    const left = Math.random() * 100;
    const size = 32 + Math.random() * 68; // ~2x bigger
    const fallDur = 3.8 + Math.random() * 5.2; // faster falling
    // Positive delay so items always ENTER from the top (no mid-screen start)
    const delay = Math.random() * 2.2;
    const swayDur = 2.0 + Math.random() * 3.2;

    el.dataset.size = String(size);

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${fallDur}s`;
    el.style.animationDelay = `${delay}s`;

    inner.style.animationDuration = `${swayDur}s`;
    inner.style.animationDelay = `${Math.random() * 1.2}s`;

    // Direct handler as backup (some mobiles occasionally miss delegation)
    el.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      explodeTulip(el);
    }, {passive:false});

    el.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      explodeTulip(el);
    }, {passive:false});

    container.appendChild(el);
  }

  // Prevent iOS gesture zoom
  document.addEventListener('gesturestart', (e) => e.preventDefault(), {passive:false});
  document.addEventListener('dblclick', (e) => e.preventDefault(), {passive:false});

  // Delegated tap handler: guarantees explosions for ALL falling items
  function explodeTulip(el){
    if (!el) return;

    // haptics
    try { if (navigator.vibrate) navigator.vibrate(8); } catch(e) {}

    // start music on first interaction (autoplay-friendly)
    if (!playing) {
      try { toggleSound(); } catch(e) {}
    }

    // score
    setScore(score + 1);

    // snapshot current position/size
    const rect = el.getBoundingClientRect();
    const size = Number(el.dataset.size || rect.width || 60);

    // remove sticker immediately + respawn
    el.remove();
    spawnFlower();

    // explosion fixed in place (does not fall)
    const boom = document.createElement('div');
    boom.className = 'boomFixed';

    // same visual size as tapped element
    const s = Math.max(48, Math.min(220, size * 1.05));
    boom.style.width = s + 'px';
    boom.style.height = s + 'px';
    boom.style.left = (rect.left + rect.width/2) + 'px';
    boom.style.top = (rect.top + rect.height/2) + 'px';

    document.body.appendChild(boom);
    setTimeout(() => boom.remove(), 520);
  }

  function findTulipTarget(target){
    let n = target;
    while (n && n !== container && n !== document.body) {
      if (n.classList && n.classList.contains('tulip')) return n;
      n = n.parentNode;
    }
    return null;
  }

  function onTap(ev){
    const el = findTulipTarget(ev.target);
    if (!el) return;
    ev.preventDefault();
    explodeTulip(el);
  }

  // Capture on document to avoid any propagation/stacking quirks on mobile
  document.addEventListener('pointerdown', onTap, {capture:true, passive:false});
  document.addEventListener('touchstart', onTap, {capture:true, passive:false});

  // Preload explosion sprite to avoid first-tap delay
  const preload = new Image();
  preload.src = 'assets/explosion-sprite.png';

  // initial pack
  const initialCount = 30;
  for (let i = 0; i < initialCount; i++) spawnFlower();
})();
