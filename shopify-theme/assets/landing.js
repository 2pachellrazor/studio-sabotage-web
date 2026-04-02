// ─── 3D Logo (inverted — white on black) ───
(function(){
  const canvas = document.getElementById('logo3d');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = window.SS_ASSETS.logoPng;
  img.onload = function() {
    const W = canvas.width, H = canvas.height;
    const depth = 12;
    let angle = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const absScalePrev = Math.abs(Math.cos(angle));
      const edgeBoost = 1 + 6 * Math.pow(1 - absScalePrev, 2);
      angle += 0.008 * edgeBoost;
      const scale = Math.cos(angle);
      const absScale = Math.abs(scale);
      const centerX = W / 2;
      const imgW = W * 0.85;
      const imgH = H * 0.85;
      const offsetX = centerX - (imgW * absScale) / 2;
      const offsetY = (H - imgH) / 2;
      // Invert: draw white version
      ctx.filter = 'invert(1)';
      const edgeCount = Math.floor(depth * (1 - absScale));
      for (let i = edgeCount; i > 0; i--) {
        ctx.globalAlpha = 0.15;
        ctx.drawImage(img, offsetX + i * 0.5, offsetY + i * 0.3, imgW * absScale, imgH);
      }
      ctx.globalAlpha = 1.0;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(absScale, 1);
      ctx.drawImage(img, 0, 0, imgW, imgH);
      ctx.restore();
      ctx.filter = 'none';
      requestAnimationFrame(draw);
    }
    draw();
  };
})();

// ─── Particle Snakes (inverted — white particles on black) ───
(function() {
  const pCanvas = document.getElementById('particleBg');
  const pCtx = pCanvas.getContext('2d');
  let pW, pH;
  let pMouseX = -1000, pMouseY = -1000;
  const particles = [];
  const PARTICLE_COUNT = 18000;
  const MOUSE_RADIUS = 80;
  let particleAnimId = null;

  function pResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    pW = pCanvas.width = window.innerWidth * dpr;
    pH = pCanvas.height = window.innerHeight * dpr;
    pCanvas.style.width = window.innerWidth + 'px';
    pCanvas.style.height = window.innerHeight + 'px';
  }
  pResize();
  window.addEventListener('resize', () => { pResize(); pSampleImage(); });

  document.addEventListener('mousemove', e => {
    pMouseX = e.clientX * 2;
    pMouseY = e.clientY * 2;
  });
  document.addEventListener('mouseleave', () => { pMouseX = -1000; pMouseY = -1000; });

  const snakeImg = new Image();
  snakeImg.src = window.SS_ASSETS.snakeVertical;
  snakeImg.onload = pSampleImage;

  function pSampleImage() {
    if (!snakeImg.complete || snakeImg.naturalWidth === 0) return;

    const offscreen = document.createElement('canvas');
    const octx = offscreen.getContext('2d');
    offscreen.width = pW;
    offscreen.height = pH;

    const snakeH = pH * 0.88;
    const snakeW = snakeH * (snakeImg.naturalWidth / snakeImg.naturalHeight);
    const topY = pH * 0.06;
    const gap = pW * 0.14;

    // Right snake — original
    const rightX = pW / 2 + gap / 2;
    octx.drawImage(snakeImg, rightX, topY, snakeW, snakeH);

    // Left snake — mirrored
    octx.save();
    octx.translate(pW / 2 - gap / 2, topY);
    octx.scale(-1, 1);
    octx.drawImage(snakeImg, 0, 0, snakeW, snakeH);
    octx.restore();

    const imageData = octx.getImageData(0, 0, pW, pH);
    const darkPixels = [];

    const step = 2;
    for (let y = 0; y < pH; y += step) {
      for (let x = 0; x < pW; x += step) {
        const i = (y * pW + x) * 4;
        const r = imageData.data[i], g = imageData.data[i+1], b = imageData.data[i+2], a = imageData.data[i+3];
        const brightness = (r + g + b) / 3;
        if (brightness < 128 && a > 200) {
          darkPixels.push({ x, y, brightness });
        }
      }
    }

    particles.length = 0;
    const count = Math.min(PARTICLE_COUNT, darkPixels.length);
    const shuffled = darkPixels.sort(() => Math.random() - 0.5);

    for (let i = 0; i < count; i++) {
      const p = shuffled[i];
      const darkness = 1 - p.brightness / 128;
      const size = darkness * 4 + 1.5;
      const isLeft = p.x < pW / 2;

      particles.push({
        homeX: p.x,
        homeY: p.y,
        x: p.x + (Math.random() - 0.5) * 400,
        y: p.y + (Math.random() - 0.5) * 400,
        size,
        alpha: darkness * 0.7 + 0.3,
        vx: 0,
        vy: 0,
        isLeft
      });
    }

    if (!particleAnimId) particleAnimId = requestAnimationFrame(pAnimate);
  }

  function pAnimate() {
    particleAnimId = requestAnimationFrame(pAnimate);
    pCtx.clearRect(0, 0, pW, pH);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      let dx = p.homeX - p.x;
      let dy = p.homeY - p.y;
      p.vx += dx * 0.03;
      p.vy += dy * 0.03;

      const mdx = pMouseX - p.x;
      const mdy = pMouseY - p.y;
      const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mDist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - mDist) / MOUSE_RADIUS * 18;
        p.vx -= (mdx / mDist) * force;
        p.vy -= (mdy / mDist) * force;
      }

      p.vx *= 0.88;
      p.vy *= 0.88;
      p.x += p.vx;
      p.y += p.vy;

      // Inverted: white particles on black background
      pCtx.globalAlpha = p.alpha * 0.85;
      pCtx.fillStyle = '#FFFFFF';
      pCtx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  // Pause animation when tab is hidden (battery/performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (particleAnimId) { cancelAnimationFrame(particleAnimId); particleAnimId = null; }
    } else {
      if (!particleAnimId) particleAnimId = requestAnimationFrame(pAnimate);
    }
  });
})();
