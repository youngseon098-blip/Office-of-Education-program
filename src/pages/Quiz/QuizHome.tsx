import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import "./QuizHome.css";

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  speed: number;
  phase: number;
  bright?: boolean;
};

const tarotVideos: {
  id: string;
  title: string;
  src: string;
  to: string;
  quizLabel: string;
  quizTitle: ReactNode;
}[] = [
  {
    id: "moon",
    title: "달",
    src: "/tarot-videos/moon.mp4",
    to: "/quiz1",
    quizLabel: "Quiz 1:",
    quizTitle: (
      <>
        개척령 어느 어부와의
        <br />
        시그널
      </>
    ),
  },
  {
    id: "fire",
    title: "불",
    src: "/tarot-videos/fire.mp4?v=2",
    to: "/quiz2",
    quizLabel: "Quiz 2:",
    quizTitle: "새벽을 여는 독도",
  },
  {
    id: "three",
    title: "삼",
    src: "/tarot-videos/three.mp4",
    to: "/quiz3",
    quizLabel: "Quiz 3:",
    quizTitle: "깨진 안용복의 영혼구슬",
  },
];

export default function QuizHome() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctx2d = canvasEl.getContext("2d");
    if (!ctx2d) return;

    const canvas = canvasEl;
    const ctx = ctx2d;

    let stars: Star[] = [];
    let raf = 0;
    let t = 0;
    let cancelled = false;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function resize() {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    }

    function initStars() {
      const w = canvas.width;
      const h = canvas.height;
      stars = [];
      const count = Math.floor((w * h) / 800);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.2,
          a: Math.random(),
          speed: Math.random() * 0.004 + 0.001,
          phase: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < 30; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.7,
          r: Math.random() * 1.8 + 1,
          a: Math.random() * 0.5 + 0.5,
          speed: Math.random() * 0.002 + 0.001,
          phase: Math.random() * Math.PI * 2,
          bright: true,
        });
      }
    }

    function drawFrame() {
      if (cancelled) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!reduceMotion) t += 0.016;
      for (const s of stars) {
        const alpha = reduceMotion
          ? s.a * 0.75
          : s.a * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        if (s.bright) {
          ctx.fillStyle = `rgba(220,200,255,${alpha})`;
          ctx.shadowColor = "rgba(200,160,255,0.8)";
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = `rgba(180,160,255,${alpha * 0.7})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      if (!reduceMotion) {
        raf = requestAnimationFrame(drawFrame);
      }
    }

    resize();
    initStars();
    drawFrame();

    const onResize = () => {
      resize();
      initStars();
      if (reduceMotion) {
        cancelAnimationFrame(raf);
        drawFrame();
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <main className="quiz-home-root">
      <div className="quiz-home-bg-base" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n1" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n2" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n3" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n4" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n5" aria-hidden="true" />
      <div className="quiz-home-nebula quiz-home-nebula-n6" aria-hidden="true" />

      <canvas
        ref={canvasRef}
        className="quiz-home-stars-canvas"
        aria-hidden="true"
      />

      <div className="quiz-home-light-beam" aria-hidden="true" />

      <svg
        className="quiz-home-deco-ring"
        width="700"
        height="700"
        viewBox="0 0 700 700"
        aria-hidden="true"
      >
        <circle cx="350" cy="350" r="320" fill="none" stroke="#a060ff" strokeWidth="1" />
        <circle cx="350" cy="350" r="280" fill="none" stroke="#8040e0" strokeWidth="0.5" />
        <circle cx="350" cy="350" r="240" fill="none" stroke="#a060ff" strokeWidth="1" />
        <circle cx="350" cy="350" r="180" fill="none" stroke="#8040e0" strokeWidth="0.5" />
        <polygon
          points="350,50 630,487 70,487"
          fill="none"
          stroke="#c080ff"
          strokeWidth="0.8"
        />
        <polygon
          points="350,650 70,213 630,213"
          fill="none"
          stroke="#c080ff"
          strokeWidth="0.8"
        />
        <line x1="350" y1="30" x2="350" y2="670" stroke="#8040e0" strokeWidth="0.4" />
        <line x1="30" y1="350" x2="670" y2="350" stroke="#8040e0" strokeWidth="0.4" />
        <line x1="84" y1="84" x2="616" y2="616" stroke="#6030c0" strokeWidth="0.3" />
        <line x1="616" y1="84" x2="84" y2="616" stroke="#6030c0" strokeWidth="0.3" />
      </svg>

      <div className="quiz-home-fog" aria-hidden="true" />

      <div className="quiz-home-ui">
        <Link
          to="/"
          className="app-home-link app-home-link--fixed"
          aria-label="홈으로 이동"
        >
          <img
            src="https://api.iconify.design/fluent/home-24-filled.svg?color=%23ffffff"
            alt=""
            width={28}
            height={28}
          />
        </Link>
        <div className="quiz-home-topbar">
          <div className="quiz-home-rec-badge" aria-hidden="true">
            <span className="quiz-home-rec-dot" />
            <span>REC</span>
          </div>
        </div>

        <div className="quiz-home-cards-area">
          {tarotVideos.map((video, index) => (
            <Link
              key={video.id}
              to={video.to}
              className="quiz-home-card-column"
              aria-label={`${index + 1}번 퀴즈로 이동`}
            >
              <div className="quiz-home-card-slot">
                <div className="quiz-home-card-inner">
                  <video
                    className="quiz-home-card-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                  >
                    <source src={video.src} type="video/mp4" />
                    브라우저가 영상을 지원하지 않습니다.
                  </video>
                </div>
                <div className="quiz-home-card-notch">
                  <span className="quiz-home-notch-gem" />
                </div>
                <span className="quiz-home-card-corner tl" />
                <span className="quiz-home-card-corner tr" />
                <span className="quiz-home-card-corner bl" />
                <span className="quiz-home-card-corner br" />
                <div className="quiz-home-card-glow" aria-hidden="true" />
              </div>
              <div>
                <div className="quiz-home-label-num">{video.quizLabel}</div>
                <div className="quiz-home-label-title">{video.quizTitle}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="quiz-home-bottom-deco" aria-hidden="true">
          ✦ · · · ✦ · · · ✦
        </div>
      </div>
    </main>
  );
}
