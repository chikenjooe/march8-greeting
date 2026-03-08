(function(){
  const params = new URLSearchParams(location.search);
  const rawName = (params.get('name') || '').trim();
  const name = rawName.replace(/[<>]/g, '');

  const titleEl = document.getElementById('title');
  const copyBtn = document.getElementById('copy');
  const openA = document.getElementById('open');
  const scoreEl = document.getElementById('score');
  const toggleBtn = document.getElementById('toggle');
  const card = document.getElementById('card');

  titleEl.textContent = name ? `Дорогая, ${name}!` : 'Дорогая!';

  function buildUrlWithName(n){
    const u = new URL(location.href);
    u.searchParams.set('name', n);
    return u.toString();
  }

  const exampleName = name || 'Катя';
  openA.href = buildUrlWithName(exampleName);

  copyBtn.addEventListener('click', async () => {
    const url = buildUrlWithName(exampleName);
    try {
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = 'Скопировано!';
      setTimeout(() => copyBtn.textContent = 'Скопировать ссылку', 1200);
    } catch (e) {
      // Fallback: prompt
      window.prompt('Скопируй ссылку:', url);
    }
  });

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

  function setScore(v){
    score = v;
    scoreEl.textContent = String(score);
  }
  setScore(0);

  function spawnFlower(){
    const el = document.createElement('div');
    el.className = 'tulip';

    const inner = document.createElement('span');
    inner.className = 'inner';
    inner.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.appendChild(inner);

    const left = Math.random() * 100;
    const size = 16 + Math.random() * 34; // more variety
    const fallDur = 6.0 + Math.random() * 10.5; // different speeds
    const delay = -Math.random() * fallDur;
    const swayDur = 2.4 + Math.random() * 3.8;

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${fallDur}s`;
    el.style.animationDelay = `${delay}s`;

    inner.style.animationDuration = `${swayDur}s`;
    inner.style.animationDelay = `${Math.random() * 1.2}s`;

    // Click to explode
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (el.classList.contains('explode')) return;

      setScore(score + 1);
      el.classList.add('explode');

      // Explosion GIF (CC0 from OpenGameArt)
      const rect = el.getBoundingClientRect();
      const boom = document.createElement('img');
      boom.src = 'assets/explosion.gif';
      boom.className = 'boom';
      // center explosion on the emoji
      const s = Math.max(72, Math.min(180, rect.width * 2.2));
      boom.style.width = s + 'px';
      boom.style.height = 'auto';
      boom.style.left = (rect.left + rect.width/2) + 'px';
      boom.style.top = (rect.top + rect.height/2) + 'px';
      document.body.appendChild(boom);

      setTimeout(() => boom.remove(), 520);

      setTimeout(() => {
        el.remove();
        spawnFlower();
      }, 280);
    });

    // When a flower finishes a fall cycle, re-randomize smoothly
    el.addEventListener('animationiteration', (ev) => {
      if (ev.animationName !== 'fall') return;
      el.style.left = `${Math.random() * 100}vw`;
      const newFall = 6.0 + Math.random() * 10.5;
      el.style.animationDuration = `${newFall}s`;
      const newSize = 16 + Math.random() * 34;
      el.style.fontSize = `${newSize}px`;
      inner.textContent = flowers[Math.floor(Math.random() * flowers.length)];

      const newSway = 2.4 + Math.random() * 3.8;
      inner.style.animationDuration = `${newSway}s`;
    });

    container.appendChild(el);
  }

  // initial pack
  const initialCount = 30;
  for (let i = 0; i < initialCount; i++) spawnFlower();
})();
