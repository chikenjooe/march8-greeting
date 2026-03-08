(function(){
  const params = new URLSearchParams(location.search);
  const rawName = (params.get('name') || '').trim();
  const name = rawName.replace(/[<>]/g, '');

  const titleEl = document.getElementById('title');
  const scoreEl = document.getElementById('score');
  const scoreBox = document.querySelector('.score');
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

    // score
    setScore(score + 1);

    // snapshot current position/size
    const rect = el.getBoundingClientRect();
    const size = Number(el.dataset.size || rect.width || 60);

    // remove sticker immediately + respawn
    el.remove();
    spawnFlower();

    // explosion fixed in place (does not fall)
    const boom = document.createElement('img');
    boom.src = 'assets/explosion_only.gif';
    boom.alt = '💥';
    boom.className = 'boomFixed';
    boom.decoding = 'async';
    boom.loading = 'eager';

    // same visual size as tapped element
    const s = Math.max(48, Math.min(220, size * 1.05));
    boom.style.width = s + 'px';
    boom.style.height = 'auto';
    boom.style.left = (rect.left + rect.width/2) + 'px';
    boom.style.top = (rect.top + rect.height/2) + 'px';

    boom.onerror = () => {
      // fallback: quick text pop
      const t = document.createElement('div');
      t.className = 'boomText';
      t.textContent = '💥';
      t.style.left = boom.style.left;
      t.style.top = boom.style.top;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 360);
    };

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

  // initial pack
  const initialCount = 30;
  for (let i = 0; i < initialCount; i++) spawnFlower();
})();
