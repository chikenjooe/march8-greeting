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
  // Big pool of flower-ish emoji (works across most platforms)
  const flowers = [
    '🌷','🌸','💐','🌹','🌺','🪻','🌻','🌼','🌿','🍀','🌱','🪴',
    '🥀','🌾','🍃','🍂','🍁','🌵','🎍','🎋','🌲','🌳','🌴',
    '🪷','🌫️','✨','💖','💕','💘','💝','🎀'
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
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];

    const left = Math.random() * 100;
    const size = 18 + Math.random() * 22;
    const fallDur = 5.5 + Math.random() * 9.5; // different speeds
    const delay = -Math.random() * fallDur;
    const swayDur = 1.8 + Math.random() * 3.2;

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${fallDur}s, ${swayDur}s`;
    el.style.animationDelay = `${delay}s, ${Math.random() * 1.2}s`;

    // Click to explode
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (el.classList.contains('explode')) return;
      setScore(score + 1);
      el.classList.add('explode');
      // remove after pop
      setTimeout(() => {
        el.remove();
        // keep density stable
        spawnFlower();
      }, 420);
    });

    // If animation loops, occasionally refresh so they don't sync
    el.addEventListener('animationiteration', (ev) => {
      if (ev.animationName !== 'fall') return;
      // randomize a bit on each full fall
      el.style.left = `${Math.random() * 100}vw`;
      const newFall = 5.5 + Math.random() * 9.5;
      const newSway = 1.8 + Math.random() * 3.2;
      el.style.animationDuration = `${newFall}s, ${newSway}s`;
      el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    });

    container.appendChild(el);
  }

  // initial pack
  const initialCount = 30;
  for (let i = 0; i < initialCount; i++) spawnFlower();
})();
