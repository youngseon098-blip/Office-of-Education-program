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
      <canvas id="q1g-c-bg" />
      <canvas id="q1g-c-fx" aria-hidden />
      <div id="q1g-overlay" className="q1g-overlay q1g-bg-ocean" />

      <Link to="/" className="q1g-home-btn" aria-label="홈으로 이동">
        <img
          src="https://api.iconify.design/mdi/home.svg?color=%23ffffff"
          alt=""
          width={24}
          height={24}
        />
      </Link>

      <div id="q1g-stage-badge" />

      <div id="q1g-scene" />

      <button type="button" id="q1g-prev-btn">
        ← PREVIOUS
      </button>
      <button type="button" id="q1g-next-btn">
        NEXT →
      </button>
    </div>
  );
}
