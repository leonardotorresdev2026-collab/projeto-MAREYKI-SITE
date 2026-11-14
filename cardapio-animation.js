{
  const root = document.getElementById("mareyki-teeth");
  const canvas = root.querySelector("canvas"),
    ctx = canvas.getContext("2d");
  let width = 600,
    height = 360,
    started = 0,
    frame;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = motion.matches;

  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => {
    const n = clamp(x);
    return n * n * (3 - 2 * n);
  };
  function draw(t) {
    ctx.clearRect(0, 0, width, height);
    const cx = width * 0.5,
      cy = height * 0.49;
    const style = getComputedStyle(root);
    const font = parseFloat(style.fontSize);
    const span = Math.min(width * 0.92, font * 3.6);
    const arrive = ease((t - 0.65) / 0.75);
    const bite = ease((t - 2) / 0.25);
    const open = ease((t - 3.6) / 0.45);
    const leave = ease((t - 5.6) / 0.9);
    const visible = arrive * (1 - leave);
    const gap =
      (font * 0.72 + 22) * (1 - bite) + 3 * bite + (font * 0.72 + 22) * open;
    const inhale = ease((t - 1.75) / 0.48);
    const spit = ease((t - 3.83) / 1.12);
    let wordScale = 1,
      wordAlpha = 1,
      wordY = cy;
    if (t >= 1.75 && t < 3.83) {
      wordScale = 1 - inhale * 0.96;
      wordAlpha = 1 - inhale;
    }
    if (t >= 3.83) {
      wordScale = 0.08 + 0.92 * spit + 0.14 * Math.sin(Math.PI * spit);
      wordAlpha = clamp(spit * 5);
      wordY = cy - Math.sin(spit * Math.PI) * 25;
    }
    // The mouth remains behind the word while the enamel closes in front.
    if (visible > 0) {
      ctx.save();
      ctx.globalAlpha = visible * 0.65;
      const shadow = ctx.createRadialGradient(cx, cy, 2, cx, cy, span * 0.52);
      shadow.addColorStop(0, "#03121f");
      shadow.addColorStop(0.65, "#052238");
      shadow.addColorStop(1, "rgba(5,34,56,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        span * 0.62,
        Math.max(27, gap * 1.5),
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
    function word() {
      ctx.save();
      ctx.globalAlpha = wordAlpha;
      ctx.translate(cx, wordY);
      ctx.scale(wordScale, wordScale);
      ctx.font = style.fontWeight + " " + font + "px " + style.fontFamily;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillStyle = style.color;
      ctx.fillText("Cardápio.", 0, 0);
      ctx.restore();
    }
    word();
    function jaw(top) {
      ctx.save();
      ctx.globalAlpha = visible;
      const side = top ? 1 : -1;
      const retreat = (1 - arrive + leave) * height * 0.4;
      ctx.translate(cx, cy - side * (gap + retreat));
      ctx.scale(1, side);
      ctx.shadowColor = "#00101a99";
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 5;
      // A curved blue jaw anchors the ivory teeth.
      const rim = ctx.createLinearGradient(0, -55, 0, 4);
      rim.addColorStop(0, "#153c52");
      rim.addColorStop(0.72, "#4e8998");
      rim.addColorStop(1, "#b2d4d3");
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.moveTo(-span * 0.53, -19);
      ctx.bezierCurveTo(-span * 0.36, -55, span * 0.36, -55, span * 0.53, -19);
      ctx.quadraticCurveTo(span * 0.31, -5, 0, -10);
      ctx.quadraticCurveTo(-span * 0.31, -5, -span * 0.53, -19);
      ctx.fill();
      ctx.shadowBlur = 5;
      const count = 11,
        space = span / count;
      for (let i = 0; i < count; i++) {
        const x = (i - (count - 1) / 2) * space;
        const curve = 12 * Math.pow(x / (span * 0.5), 2);
        const size = space * 0.4;
        const length =
          (top ? 43 : 36) * (1 - (0.27 * Math.abs(x)) / (span * 0.5));
        const enamel = ctx.createLinearGradient(
          x - size,
          -15,
          x + size,
          length,
        );
        enamel.addColorStop(0, "#c1d7cf");
        enamel.addColorStop(0.35, "#fff9e9");
        enamel.addColorStop(0.7, "#e4e9dc");
        enamel.addColorStop(1, "#94b8bd");
        ctx.fillStyle = enamel;
        ctx.beginPath();
        ctx.moveTo(x - size, -15 - curve);
        ctx.quadraticCurveTo(x, -21 - curve, x + size, -15 - curve);
        ctx.bezierCurveTo(
          x + size * 0.65,
          3 - curve,
          x + size * 0.2,
          length - curve,
          x,
          length - curve,
        );
        ctx.bezierCurveTo(
          x - size * 0.2,
          length - curve,
          x - size * 0.65,
          3 - curve,
          x - size,
          -15 - curve,
        );
        ctx.fill();
      }
      ctx.restore();
    }
    if (visible > 0) {
      jaw(true);
      jaw(false);
    }
    if (t > 3.85 && t < 5.45) {
      const u = (t - 3.85) / 1.6;
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        ctx.strokeStyle = "rgba(216,253,255," + (1 - u) * 0.7 + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          cx + Math.cos(angle) * u * span * 0.48,
          cy + Math.sin(angle) * u * 90 - u * u * 60,
          2 + (i % 4) * 1.3,
          0,
          Math.PI * 2,
        );
        ctx.stroke();
      }
    }
  }

  function tick(now) {
    if (paused || document.hidden) return;
    draw(((now - started) / 1000) % 11);
    frame = requestAnimationFrame(tick);
  }
  function play() {
    cancelAnimationFrame(frame);
    started = performance.now();
    paused = false;

    frame = requestAnimationFrame(tick);
  }
  function pause() {
    paused = true;
    cancelAnimationFrame(frame);
    draw(0);
  }
  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(paused ? 0 : ((performance.now() - started) / 1000) % 11);
  }).observe(canvas);
  root.classList.add("is-ready");
  document.fonts.ready.then(() =>
    draw(paused ? 0 : ((performance.now() - started) / 1000) % 11),
  );
  motion.addEventListener("change", () => (motion.matches ? pause() : play()));
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(frame);
    if (!document.hidden && !paused) play();
  });

  if (!paused) play();
}
