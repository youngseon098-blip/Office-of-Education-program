import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./quiz1.css";

const MISSION_CODE_OK = "0817";

export default function Quiz1() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [missionCode, setMissionCode] = useState("");
  const canEnterGame = missionCode.trim() === MISSION_CODE_OK;

  useEffect(() => {
    document.title = "Quiz 1 · 개척령 어느 어부와의 시그널";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useEffect(() => {
    const canvasEl = bgRef.current;
    const pageEl = pageRef.current;
    if (!canvasEl || !pageEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;
    const canvas = canvasEl;
    const page = pageEl;
    const ctx = ctxEl;

    function splat(sx: number, sy: number, maxR: number, al: number) {
      const cols = ["#880404", "#aa0606", "#cc0808"];
      function bl(
        bx: number,
        by: number,
        rx: number,
        ry: number,
        rot: number,
        a: number,
        c: string,
      ) {
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      bl(sx, sy, maxR * 0.9, maxR * 0.45, -0.2, al * 0.9, cols[1]);
      bl(sx - maxR * 0.12, sy - maxR * 0.06, maxR * 0.6, maxR * 0.32, 0.1, al * 0.8, cols[0]);
      bl(sx + maxR * 0.15, sy + maxR * 0.05, maxR * 0.45, maxR * 0.24, -0.05, al * 0.75, cols[2]);
    }

    function drawBg() {
      const w = window.innerWidth;
      const h = Math.max(window.innerHeight, page.scrollHeight);
      canvas.width = w;
      canvas.height = h;

      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#1e1510");
      g.addColorStop(0.4, "#241a0e");
      g.addColorStop(0.8, "#1c1208");
      g.addColorStop(1, "#140e06");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 18; i++) {
        const y = (h / 18) * i + Math.sin(i * 1.3) * 12;
        ctx.strokeStyle = `rgba(${i % 2 ? 255 : 200},${i % 2 ? 200 : 150},${i % 2 ? 80 : 60},0.04)`;
        ctx.lineWidth = 2 + Math.sin(i * 0.7) * 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= w; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.008 + i) * 6);
        }
        ctx.stroke();
      }

      splat(w * 0.08, h * 0.12, 28, 0.55);
      splat(w * 0.88, h * 0.08, 18, 0.45);
      splat(w * 0.92, h * 0.4, 14, 0.35);
      splat(w * 0.04, h * 0.55, 16, 0.3);
      splat(w * 0.96, h * 0.7, 12, 0.3);

      const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.8);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);
    }

    drawBg();
    window.addEventListener("resize", drawBg);
    return () => window.removeEventListener("resize", drawBg);
  }, []);

  return (
    <main className="quiz1-page" ref={pageRef}>
      <canvas ref={bgRef} className="quiz1-bgc" aria-hidden />
      <svg
        aria-hidden
        style={{ position: "absolute", width: 0, height: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="stamp-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="4" seed="8" result="noise" />
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
            <div className="quiz1-hdr-title">Secret Mission</div>
            <div className="quiz1-hdr-num">Case No. 1882-UL</div>
          </div>

          <div className="quiz1-stamp-row">
            <div className="quiz1-stamp quiz1-stamp-red">
              <span className="quiz1-stamp-text">기밀</span>
            </div>
            <div className="quiz1-stamp quiz1-stamp-blk">
              <span className="quiz1-stamp-text">Classified</span>
            </div>
          </div>

          <div className="quiz1-mission-title">
            <div className="quiz1-mt-code">Mission 01 · The Fisherman's Signal</div>
            <div className="quiz1-mt-kr">
              <span className="quiz1-mt-line quiz1-mt-line-1">개척령</span>
              <span className="quiz1-mt-line quiz1-mt-line-2">어느 어부와의</span>
              <span className="quiz1-mt-line quiz1-mt-line-3">시그널</span>
            </div>
            <div className="quiz1-mt-sub">당신의 한계를 시험하라!</div>
          </div>

          <div className="quiz1-info-grid">
            <div className="quiz1-info-cell">
              <div className="quiz1-ic-label">Date</div>
              <div className="quiz1-ic-val">1882 · 개척령 시대</div>
            </div>
            <div className="quiz1-info-cell">
              <div className="quiz1-ic-label">Status</div>
              <div className="quiz1-ic-val red">Active · 해독 필요</div>
            </div>
          </div>

          <div className="quiz1-cut-line">
            <div className="quiz1-cut-icon">✂</div>
            <div className="quiz1-cut-dashes" />
            <div className="quiz1-cut-label">Mission Brief</div>
            <div className="quiz1-cut-dashes" />
            <div className="quiz1-cut-icon">✂</div>
          </div>

          <div className="quiz1-step-block">
            <div className="quiz1-step-num">
              STEP <span>1</span>
            </div>
            <div className="quiz1-step-title">
              <em>박사의 브리핑!</em> 시그널의 정체를 파악하라!
            </div>
            <div className="quiz1-step-desc quiz1-step-desc-strong">
              이규원검찰일기 연구소에 도착한 당신, 이대환 박사의 브리핑을 듣고 과거에서 온 시그널의 의미를 이해하라.
            </div>
          </div>

          <div className="quiz1-step-block">
            <div className="quiz1-step-num">
              STEP <span>2</span>
            </div>
            <div className="quiz1-step-title">
              <em>시그널 수신!</em> 어부의 위치를 해독하라!
            </div>
            <div className="quiz1-step-desc quiz1-step-desc-strong">
              과거에서 온 어부의 암호 전화를 수신하고, 힌트를 조합해 그의 위치를 파악하라. 주어진 시간은 단 60분이다.
            </div>
          </div>

          <div className="quiz1-step-block quiz1-step-input">
            <div className="quiz1-field-row">
              <input
                className="quiz1-field-input"
                placeholder="미션 코드를 입력하라..."
                autoComplete="off"
                value={missionCode}
                onChange={(e) => setMissionCode(e.target.value)}
                inputMode="numeric"
                maxLength={8}
              />
              <button className="quiz1-field-btn quiz1-field-btn-red" type="button" aria-label="코드 확인">
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
          <Link className="quiz1-cta-btn" to="/quiz1/game">
            지금, 입장하시겠습니까?
          </Link>
        ) : (
          <button type="button" className="quiz1-cta-btn quiz1-cta-btn-locked" disabled>
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
