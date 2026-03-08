(function(){
  const params = new URLSearchParams(location.search);
  const rawName = (params.get('name') || '').trim();
  const name = rawName.replace(/[<>]/g, '');

  const titleEl = document.getElementById('title');
  const copyBtn = document.getElementById('copy');
  const openA = document.getElementById('open');

  if (name) {
    titleEl.textContent = `Дорогая, ${name}!`;
  } else {
    titleEl.textContent = 'Дорогая!';
  }

  // Falling tulips
  const container = document.getElementById('tulips');
  const count = 26;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'tulip';
    el.textContent = '🌷';

    const left = Math.random() * 100;
    const size = 18 + Math.random() * 20;
    const duration = 7 + Math.random() * 8;
    const delay = -Math.random() * duration;
    const swayDur = 2.2 + Math.random() * 2.6;

    el.style.left = `${left}vw`;
    el.style.fontSize = `${size}px`;
    el.style.animationDuration = `${duration}s, ${swayDur}s`;
    el.style.animationDelay = `${delay}s, ${Math.random() * 1.2}s`;

    container.appendChild(el);
  }

  function buildUrlWithName(n){
    const u = new URL(location.href);
    u.searchParams.set('name', n);
    return u.toString();
  }

  const exampleName = name || 'Катя';
  openA.href = buildUrlWithName(exampleName);

  copyBtn.addEventListener('click', async () => {
    try {
      const url = buildUrlWithName(exampleName);
      await navigator.clipboard.writeText(url);
      copyBtn.textContent = 'Скопировано!';
      setTimeout(() => copyBtn.textContent = 'Скопировать ссылку с именем', 1200);
    } catch (e) {
      copyBtn.textContent = 'Не вышло, скопируй вручную';
      setTimeout(() => copyBtn.textContent = 'Скопировать ссылку с именем', 1600);
    }
  });
})();
