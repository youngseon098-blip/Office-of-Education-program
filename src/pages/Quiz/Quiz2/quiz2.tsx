import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../Quiz1/quiz1.css";
import "./quiz2.css";

const MISSION_CODE_OK = "0817";

export default function Quiz2() {
  const stormRef = useRef<HTMLDivElement>(null);
  const rainRef = useRef<HTMLCanvasElement>(null);
  const lightningRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const [missionCode, setMissionCode] = useState("");
  const canEnterGame = missionCode.trim() === MISSION_CODE_OK;

  useEffect(() => {
    document.title = "Quiz 2 · 새벽을 여는 독도";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useEffect(() => {
    const stormEl = stormRef.current;
    const rainEl = rainRef.current;
    const lightningEl = lightningRef.current;
    const flashEl = flashRef.current;
    if (!stormEl || !rainEl || !lightningEl || !flashEl) return;
    const storm = stormEl;
    const rCanvas = rainEl;
    const lCanvas = lightningEl;
    const flash = flashEl;

    const rCtx = rCanvas.getContext("2d");
    const lCtx = lCanvas.getContext("2d");
    if (!rCtx || !lCtx) return;
    const ctx = rCtx;
    const lightningCtx = lCtx;
    let rafId = 0;
    let lightningTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeTimer: ReturnType<typeof setInterval> | null = null;

    function resize() {
      const w = storm.clientWidth;
      const h = storm.clientHeight;
      rCanvas.width = w;
      rCanvas.height = h;
      lCanvas.width = w;
      lCanvas.height = h;
    }

    resize();

    const drops = Array.from({ length: 280 }, () => ({
      x: Math.random() * lCanvas.width,
      y: Math.random() * lCanvas.height,
      len: Math.random() * 16 + 8,
      speed: Math.random() * 8 + 5,
      op: Math.random() * 0.4 + 0.2,
      w: Math.random() * 0.8 + 0.8,
      angle: Math.random() * 0.08 - 0.04,
    }));

    function drawRain() {
      ctx.clearRect(0, 0, rCanvas.width, rCanvas.height);
      drops.forEach((d) => {
        const rad = Math.PI / 2 + 0.22 + d.angle;
        const ex = d.x + Math.cos(rad) * d.len;
        const ey = d.y + Math.sin(rad) * d.len;

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(200, 225, 255, ${d.op})`;
        ctx.lineWidth = d.w;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = `rgba(240, 248, 255, ${d.op * 0.6})`;
        ctx.lineWidth = d.w * 0.35;
        ctx.stroke();
        d.y += d.speed;
        d.x += d.speed * 0.22;
        if (d.y > rCanvas.height || d.x > rCanvas.width) {
          d.x = Math.random() * rCanvas.width - 50;
          d.y = -20;
        }
      });
      rafId = requestAnimationFrame(drawRain);
    }

    function drawBolt(
      x: number,
      y: number,
      angle: number,
      length: number,
      depth: number,
    ) {
      if (length < 15) return;
      const endX = x + Math.cos(angle) * length + (Math.random() - 0.5) * 30;
      const endY = y + Math.sin(angle) * length + (Math.random() - 0.5) * 20;

      lightningCtx.beginPath();
      lightningCtx.moveTo(x, y);
      lightningCtx.lineTo(endX, endY);
      const alpha = Math.max(0.15, 1 - depth * 0.22);
      const lw = Math.max(0.4, 2.5 - depth * 0.5);
      lightningCtx.strokeStyle = `rgba(180,210,255,${alpha})`;
      lightningCtx.lineWidth = lw;
      lightningCtx.stroke();

      lightningCtx.beginPath();
      lightningCtx.moveTo(x, y);
      lightningCtx.lineTo(endX, endY);
      lightningCtx.strokeStyle = `rgba(120,160,255,${alpha * 0.4})`;
      lightningCtx.lineWidth = lw * 4;
      lightningCtx.stroke();

      const branchCount = depth < 3 ? Math.floor(Math.random() * 3) + 1 : 0;
      for (let i = 0; i < branchCount; i += 1) {
        const t = Math.random() * 0.7 + 0.15;
        const bx = x + (endX - x) * t;
        const by = y + (endY - y) * t;
        const ba = angle + (Math.random() - 0.5) * 1.1;
        drawBolt(bx, by, ba, length * (Math.random() * 0.35 + 0.3), depth + 1);
      }
      drawBolt(
        endX,
        endY,
        angle + (Math.random() - 0.5) * 0.35,
        length * 0.65,
        depth + 1,
      );
    }

    function triggerLightning() {
      const w = lCanvas.width;
      const h = lCanvas.height;
      lightningCtx.clearRect(0, 0, w, h);
      const startX = w * 0.2 + Math.random() * w * 0.6;
      const angle = Math.PI / 2 + (Math.random() - 0.5) * 0.6;

      flash.classList.add("active");
      setTimeout(() => flash.classList.remove("active"), 60);
      drawBolt(startX, 0, angle, h * 0.55, 0);

      let op = 1;
      if (fadeTimer) clearInterval(fadeTimer);
      const fade = setInterval(() => {
        op -= 0.18;
        if (op <= 0) {
          clearInterval(fade);
          fadeTimer = null;
          lightningCtx.clearRect(0, 0, w, h);
          return;
        }
        lightningCtx.globalAlpha = op;
        lightningCtx.clearRect(0, 0, w, h);
        drawBolt(startX, 0, angle, h * 0.55, 0);
        lightningCtx.globalAlpha = 1;
      }, 40);
      fadeTimer = fade;
    }

    function scheduleLightning() {
      const delay = Math.random() * 2000 + 800;
      lightningTimer = setTimeout(() => {
        triggerLightning();
        scheduleLightning();
      }, delay);
    }

    drawRain();
    lightningTimer = setTimeout(scheduleLightning, 500);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      if (lightningTimer) clearTimeout(lightningTimer);
      if (fadeTimer) clearInterval(fadeTimer);
    };
  }, []);

  return (
    <main className="quiz1-page quiz2-page">
      <div className="q2-storm-bg" aria-hidden ref={stormRef}>
        <div className="q2-sky" />
        <div className="q2-clouds">
          <div className="q2-cloud c1" />
          <div className="q2-cloud c2" />
          <div className="q2-cloud c3" />
          <div className="q2-cloud c4" />
          <div className="q2-cloud c5" />
        </div>
        <div className="q2-fog">
          <div className="q2-fog1" />
          <div className="q2-fog2" />
          <div className="q2-fog3" />
        </div>
        <canvas id="rain-canvas" ref={rainRef} />
        <canvas id="lightning-canvas" ref={lightningRef} />
        <div className="q2-flash-overlay" ref={flashRef} />
        <div className="q2-vignette" />
      </div>
      <svg
        aria-hidden
        style={{ position: "absolute", width: 0, height: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="stamp-rough">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.065"
              numOctaves="4"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>
      </svg>

      <Link
        className="app-home-link app-home-link--fixed"
        to="/"
        aria-label="홈으로 이동"
      >
        <img
          src="https://api.iconify.design/fluent/home-24-filled.svg?color=%23ffffff"
          alt=""
          width={28}
          height={28}
        />
      </Link>

      <section className="quiz1-dossier">
        <div className="quiz1-folder-tab">Confidential</div>
        <div className="quiz1-paper">
          <div className="quiz1-pin-red" />
          <div className="quiz1-tape-h" />
          <div className="quiz1-paperclip" />

          <div className="quiz1-hdr">
            <div className="quiz1-hdr-title">Cipher Mission</div>
            <div className="quiz1-hdr-num">Case No. 1882-02</div>
          </div>

          <div className="quiz1-stamp-row">
            <div className="quiz1-stamp quiz1-stamp-red">
              <span className="quiz1-stamp-text">극비</span>
            </div>
            <div className="quiz1-stamp quiz1-stamp-blk">
              <span className="quiz1-stamp-text">Top Secret</span>
            </div>
          </div>

          <div className="quiz1-mission-title">
            <div className="quiz1-mt-code">Mission 02 · Dokdo Opens Dawn</div>
            <div className="quiz1-mt-kr">
              <span className="quiz1-mt-line quiz1-mt-line-1">새벽을</span>
              <span className="quiz1-mt-line quiz1-mt-line-2">여는</span>
              <span className="quiz1-mt-line quiz1-mt-line-3">독도</span>
            </div>
            <div className="quiz1-mt-sub">암호를 풀어 진실을 밝혀라!</div>
          </div>

          <div className="quiz1-info-grid">
            <div className="quiz1-info-cell">
              <div className="quiz1-ic-label">Date</div>
              <div className="quiz1-ic-val">현재 · 울릉도 긴급 잠입 임무</div>
            </div>
            <div className="quiz1-info-cell">
              <div className="quiz1-ic-label">Classification</div>
              <div className="quiz1-ic-val red">Active · 안개 원인 파악 필요</div>
            </div>
          </div>

          <div className="quiz1-cut-line">
            <div className="quiz1-cut-icon">✂</div>
            <div className="quiz1-cut-dashes" />
            <div className="quiz1-cut-label">Cipher Brief</div>
            <div className="quiz1-cut-dashes" />
            <div className="quiz1-cut-icon">✂</div>
          </div>

          <div className="quiz1-step-block">
            <div className="quiz1-step-num">
              STEP <span>1</span>
            </div>
            <div className="quiz1-step-title">
              <em>박사의 메시지!</em> 기밀 파일을 해독하라!
            </div>
            <div className="quiz1-step-desc quiz1-step-desc-strong">
              요원 A가 보안관리 AI를 통해 기밀 문서를 전달한다.
              두 개의 보기에서 공통으로 가장 많이 등장하는
              단어를 찾아 목적지를 파악하라.
            </div>
          </div>

          <div className="quiz1-step-block">
            <div className="quiz1-step-num">
              STEP <span>2</span>
            </div>
            <div className="quiz1-step-title">
              <em>암호 해독!</em> 요원 A의 위치를 찾아라!
            </div>
            <div className="quiz1-step-desc quiz1-step-desc-strong">
              도동에서 요원 A를 접선하라. 요원 A가 메일로
              보낸 기밀 파일의 광고판 암호를 해독하여
              단서를 확보하라. 주어진 시간은 단 60분이다.
            </div>
          </div>

          <div className="quiz1-step-block quiz1-step-input">
            <div className="quiz1-field-row">
              <input
                className="quiz1-field-input"
                placeholder="해독 코드를 입력하라..."
                autoComplete="off"
                value={missionCode}
                onChange={(e) => setMissionCode(e.target.value)}
                inputMode="numeric"
                maxLength={8}
              />
              <button
                className="quiz1-field-btn quiz1-field-btn-red"
                type="button"
                aria-label="코드 확인"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#f8e8c0"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="quiz1-tear-bot" />
        </div>
      </section>

      <div className="quiz1-cta-area">
        <div className="quiz1-caution" />
        {canEnterGame ? (
          <Link className="quiz1-cta-btn" to="/quiz2/game">
            지금, 입장하시겠습니까?
          </Link>
        ) : (
          <button
            type="button"
            className="quiz1-cta-btn quiz1-cta-btn-locked"
            disabled
          >
            지금, 입장하시겠습니까?
          </button>
        )}
        <div className="quiz1-caution" />
      </div>

      <div className="quiz1-bottom-lbl">
        Office of Education · Escape Room Program · 1882
      </div>
    </main>
  );
}
