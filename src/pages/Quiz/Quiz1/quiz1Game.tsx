import { Link } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef } from "react";
import { initQuiz1Game } from "./quiz1GameEngine";
import "./quiz1Game.css";

export default function Quiz1Game() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Quiz 1 · 개척령 어느 어부와의 시그널";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    return initQuiz1Game(el);
  }, []);

  return (
    <div ref={rootRef} className="quiz1-game-root">
      <svg
        aria-hidden
        style={{ position: "absolute", width: 0, height: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="film-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="19" result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -8"
            />
          </filter>
          <filter id="q1g-stamp-rough">
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
          <filter id="stamp-rough">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="5" result="noise" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="0.2" />
          </filter>
        </defs>
      </svg>
      <canvas id="q1g-c-bg" />
      <canvas id="q1g-c-fx" aria-hidden />
      <div id="q1g-overlay" className="q1g-overlay q1g-bg-ocean" />

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

      <div id="q1g-stage-badge" />

      <div id="q1g-scene" />

      <button type="button" id="q1g-prev-btn">
        <img
          src="https://api.iconify.design/ph/arrow-left-bold.svg?color=%23d8c39f"
          alt=""
          width={18}
          height={18}
        />
        <span>PREVIOUS</span>
      </button>
      <button type="button" id="q1g-next-btn">
        <span>NEXT</span>
        <img
          src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%23d8c39f"
          alt=""
          width={18}
          height={18}
        />
      </button>
    </div>
  );
}
