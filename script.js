(function(){
  const params = new URLSearchParams(location.search);
  const rawName = (params.get('name') || '').trim();
  const name = rawName.replace(/[<>]/g, '');

  const titleEl = document.getElementById('title');
  const scoreEl = document.getElementById('score');
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

      // Replace the emoji with an explosion that continues falling
      inner.textContent = '';
      const boom = document.createElement('img');
      boom.src = 'assets/explosion.gif';
      boom.alt = '💥';
      boom.className = 'boomInline';

      const s = Math.max(44, Math.min(120, size * 2.1));
      boom.style.width = s + 'px';
      boom.style.height = 'auto';

      inner.appendChild(boom);

      // After a short moment, respawn a new falling item
      setTimeout(() => {
        el.remove();
        spawnFlower();
      }, 520);
    });

    // No recycling handler: we let CSS loop. (Reset happens offscreen + fades.)

    container.appendChild(el);
  }

  // initial pack
  const initialCount = 30;
  for (let i = 0; i < initialCount; i++) spawnFlower();
})();
