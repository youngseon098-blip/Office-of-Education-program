import { Link } from "react-router-dom";
import { useEffect, useId, useRef } from "react";
import "./quiz1.css";

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  p: number;
  s: number;
  bright?: boolean;
};

type FogPart = {
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
  dx: number;
  p: number;
};

export default function Quiz1() {
  const svgUid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const starsRef = useRef<HTMLCanvasElement>(null);
  const oceanRef = useRef<HTMLCanvasElement>(null);
  const fogRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.title = "Quiz 1 · 개척령 어느 어부와의 시그널";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useEffect(() => {
    const cs = starsRef.current;
    const co = oceanRef.current;
    const cf = fogRef.current;
    if (!cs || !co || !cf) return;

    const xs = cs.getContext("2d");
    const xo = co.getContext("2d");
    const xf = cf.getContext("2d");
    if (!xs || !xo || !xf) return;

    const canvasStars = cs;
    const canvasOcean = co;
    const canvasFog = cf;
    const starCtx = xs;
    const oceanCtx = xo;
    const fogCtx = xf;

    let W = 0;
    let H = 0;
    let stars: Star[] = [];
    let fogParts: FogPart[] = [];
    let t = 0;
    let raf = 0;
    let cancelled = false;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const waves = Array.from({ length: 8 }, () => ({
      offset: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.4,
      amp: 2 + Math.random() * 4,
      freq: 0.008 + Math.random() * 0.006,
    }));

    function buildStars() {
      stars = [];
      const n = Math.floor((W * H) / 600);
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.55,
          r: Math.random() * 1.2 + 0.2,
          a: Math.random(),
          p: Math.random() * Math.PI * 2,
          s: Math.random() * 0.003 + 0.001,
        });
      }
      for (let i = 0; i < 25; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.5,
          r: Math.random() * 1.6 + 1,
          a: 0.6 + Math.random() * 0.4,
          p: Math.random() * Math.PI * 2,
          s: 0.002,
          bright: true,
        });
      }
    }

    function buildFog() {
      fogParts = [];
      for (let i = 0; i < 12; i++) {
        fogParts.push({
          x: Math.random() * W,
          y: H * 0.45 + Math.random() * H * 0.15,
          w: 200 + Math.random() * 300,
          h: 40 + Math.random() * 60,
          a: Math.random() * 0.06 + 0.02,
          dx: (Math.random() - 0.5) * 0.15,
          p: Math.random() * Math.PI * 2,
        });
      }
    }

    function resize() {
      W = canvasStars.width = canvasOcean.width = canvasFog.width =
        window.innerWidth;
      H = canvasStars.height = canvasOcean.height = canvasFog.height =
        window.innerHeight;
      buildStars();
      buildFog();
    }

    function draw() {
      if (cancelled) return;
      if (!reduceMotion) t += 0.016;

      /* STARS */
      starCtx.clearRect(0, 0, W, H);
      const sg = starCtx.createLinearGradient(0, 0, 0, H * 0.55);
      sg.addColorStop(0, "#01050f");
      sg.addColorStop(1, "rgba(2,8,20,0)");
      starCtx.fillStyle = sg;
      starCtx.fillRect(0, 0, W, H * 0.55);

      for (const s of stars) {
        const al = s.a * (0.4 + 0.6 * Math.sin(t * s.s * 60 + s.p));
        starCtx.beginPath();
        starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        if (s.bright) {
          starCtx.fillStyle = `rgba(210,220,255,${al})`;
          starCtx.shadowColor = "rgba(200,210,255,.7)";
          starCtx.shadowBlur = 5;
        } else {
          starCtx.fillStyle = `rgba(160,170,220,${al * 0.6})`;
          starCtx.shadowBlur = 0;
        }
        starCtx.fill();
      }
      starCtx.shadowBlur = 0;

      /* OCEAN */
      oceanCtx.clearRect(0, 0, W, H);
      const hor = H * 0.53;

      const og = oceanCtx.createLinearGradient(0, hor, 0, H);
      og.addColorStop(0, "#050d1e");
      og.addColorStop(0.3, "#040b18");
      og.addColorStop(1, "#020610");
      oceanCtx.fillStyle = og;
      oceanCtx.fillRect(0, hor, W, H);

      const rc = oceanCtx.createLinearGradient(0, hor, 0, H);
      rc.addColorStop(0, "rgba(140,160,240,0.25)");
      rc.addColorStop(1, "rgba(80,100,180,0.0)");
      oceanCtx.fillStyle = rc;
      oceanCtx.fillRect(W / 2 - 50, hor, 100, H);

      for (let wi = 0; wi < waves.length; wi++) {
        const wv = waves[wi];
        const y = hor + wi * ((H - hor) / 8) + 8;
        oceanCtx.beginPath();
        oceanCtx.moveTo(0, y);
        for (let px = 0; px <= W; px += 4) {
          oceanCtx.lineTo(
            px,
            y + Math.sin(px * wv.freq + t * wv.speed + wv.offset) * wv.amp,
          );
        }
        const distFromHor = (y - hor) / (H - hor);
        const wAlpha = Math.max(0, 0.15 - distFromHor * 0.12);
        oceanCtx.strokeStyle = `rgba(120,150,220,${wAlpha})`;
        oceanCtx.lineWidth = 0.8;
        oceanCtx.stroke();

        const shimX = W / 2 + Math.sin(t * 0.8 + wi) * 30;
        const shimY =
          y +
          Math.sin(shimX * wv.freq + t * wv.speed + wv.offset) * wv.amp;
        oceanCtx.beginPath();
        oceanCtx.arc(shimX, shimY, 1.2, 0, Math.PI * 2);
        oceanCtx.fillStyle = `rgba(200,220,255,${wAlpha * 4})`;
        oceanCtx.fill();
      }

      const beamAngle = -35 + 70 * (0.5 + 0.5 * Math.sin(t / 4));
      const rad = ((beamAngle - 90) * Math.PI) / 180;
      const bGrad = oceanCtx.createLinearGradient(
        W / 2,
        hor,
        W / 2 + Math.cos(rad) * 200,
        hor + Math.sin(rad) * 200,
      );
      bGrad.addColorStop(0, "rgba(255,210,80,0.10)");
      bGrad.addColorStop(1, "rgba(255,210,80,0)");
      oceanCtx.fillStyle = bGrad;
      oceanCtx.beginPath();
      oceanCtx.moveTo(W / 2, hor);
      oceanCtx.lineTo(W / 2 + Math.cos(rad - 0.15) * 280, hor + Math.sin(rad - 0.15) * 280);
      oceanCtx.lineTo(W / 2 + Math.cos(rad + 0.15) * 280, hor + Math.sin(rad + 0.15) * 280);
      oceanCtx.closePath();
      oceanCtx.fill();

      /* FOG */
      fogCtx.clearRect(0, 0, W, H);
      for (const f of fogParts) {
        if (!reduceMotion) {
          f.x += f.dx;
          f.p += 0.003;
        }
        if (f.x > W + f.w / 2) f.x = -f.w / 2;
        if (f.x < -f.w / 2) f.x = W + f.w / 2;
        const fa = f.a * (0.6 + 0.4 * Math.sin(f.p));
        const fg = fogCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.w / 2);
        fg.addColorStop(0, `rgba(80,100,160,${fa})`);
        fg.addColorStop(1, "rgba(80,100,160,0)");
        fogCtx.fillStyle = fg;
        fogCtx.beginPath();
        fogCtx.ellipse(f.x, f.y, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
        fogCtx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(draw);
      }
    }

    resize();
    draw();
    const onResize = () => {
      resize();
      if (reduceMotion) {
        cancelAnimationFrame(raf);
        draw();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const mgId = `quiz1-mg-${svgUid}`;
  const glowId = `quiz1-glow-${svgUid}`;

  return (
    <main className="quiz1-scene">
      <canvas ref={starsRef} className="quiz1-canvas quiz1-canvas-stars" aria-hidden />
      <canvas ref={oceanRef} className="quiz1-canvas quiz1-canvas-ocean" aria-hidden />
      <canvas ref={fogRef} className="quiz1-canvas quiz1-canvas-fog" aria-hidden />

      <div className="quiz1-moon-glow" aria-hidden />
      <div className="quiz1-moon" aria-hidden>
        <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg" width={70} height={70}>
          <defs>
            <radialGradient id={mgId} cx="40%" cy="40%">
              <stop offset="0%" stopColor="#d0d8ff" />
              <stop offset="60%" stopColor="#9090d0" />
              <stop offset="100%" stopColor="#404080" />
            </radialGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="35" cy="35" r="28" fill={`url(#${mgId})`} filter={`url(#${glowId})`} opacity={0.9} />
          <circle cx="46" cy="30" r="22" fill="#020810" />
        </svg>
      </div>

      <div className="quiz1-signal-beam" aria-hidden />
      <div className="quiz1-signal-beam-2" aria-hidden />
      <div className="quiz1-horizon-glow" aria-hidden />

      <div className="quiz1-morse" aria-hidden>
        <div className="quiz1-morse-dot" style={{ width: 4, height: 4 }} />
        <div className="quiz1-morse-dot dash" style={{ width: 12, height: 4 }} />
        <div className="quiz1-morse-dot" style={{ width: 4, height: 4 }} />
        <div className="quiz1-morse-dot" style={{ width: 4, height: 4 }} />
        <div className="quiz1-morse-dot dash" style={{ width: 12, height: 4 }} />
        <div className="quiz1-morse-dot dash" style={{ width: 12, height: 4 }} />
        <div className="quiz1-morse-dot" style={{ width: 4, height: 4 }} />
      </div>

      <div className="quiz1-ui">
        <Link to="/" className="quiz1-home-btn" aria-label="홈으로 이동">
          <img
            src="https://api.iconify.design/mdi/home.svg?color=%23ffffff"
            alt=""
            width={24}
            height={24}
          />
        </Link>

        <div className="quiz1-content">
          <div className="quiz1-crest">
            <div className="quiz1-crest-line" />
            <div className="quiz1-crest-diamond" />
            <div className="quiz1-crest-line" />
          </div>

          <div className="quiz1-quiz-num">Quiz 1</div>

          <div className="quiz1-divider-deco">
            <div className="quiz1-div-line" />
            <div className="quiz1-div-star">✦ ✦ ✦</div>
            <div className="quiz1-div-line quiz1-div-line-r" />
          </div>

          <div className="quiz1-quiz-sub">개척령 어느 어부와의 시그널</div>

          <Link to="/quiz1/game" className="quiz1-start-btn">
            시작하기
          </Link>
        </div>

        <div className="quiz1-bottom-stamp">
          Classified Mission · Signal Intercept · 1882
        </div>
      </div>
    </main>
  );
}
