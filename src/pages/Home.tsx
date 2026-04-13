import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const programs = [
  {
    id: "pantone-color",
    title: "팬톤 컬러 찾기",
    to: "/pantone",
  },
  {
    id: "escape-room",
    title: "방탈출 퍼즐북",
    to: "/quiz",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const dayLabel = now.toLocaleDateString("ko-KR", { weekday: "long" });

  return (
    <main className="home-screen">
      <div className="home-root">
        <div className="bg-glow bg-glow-1" aria-hidden="true" />
      </div>
      <img
        className="home-deco home-deco-top"
        src="/img/home/다각형.webp"
        alt=""
      />
      <img
        className="home-deco home-deco-right"
        src="/img/home/사각형.webp"
        alt=""
      />
      <img
        className="home-deco home-deco-bottom"
        src="/img/home/사각형2.webp"
        alt=""
      />

      <section className="home-shell">
        <header className="home-header">
          <p>Office of Education program</p>
          <h1>
            안내에 따라
            <br />
            프로그램을 선택하세요.
          </h1>
          <div className="home-header-sub" lang="en">
            Select your mission · Classified Briefing
          </div>
        </header>

        <section className="home-grid" aria-label="프로그램 목록">
          <aside className="home-info">
            <article className="card clock-card">
              <div className="card-mono">현재 시간 · Current Time</div>
              <div
                className="time-display"
                id="clk"
                aria-live="polite"
                aria-atomic="true"
              >
                {pad(now.getHours())}:{pad(now.getMinutes())}
                <span className="time-secs" id="secs">
                  :{pad(now.getSeconds())}
                </span>
              </div>
            </article>
            <article className="card clock-card">
              <div className="card-mono" id="dn">
                {dayLabel}
              </div>
              <div className="time-display" id="dt">
                {now.getDate()}
              </div>
            </article>
          </aside>

          <article
            className="home-program home-program-main card center-card"
            role="link"
            tabIndex={0}
            aria-label="팬톤 컬러 찾기 페이지로 이동"
            onClick={() => navigate("/pantone")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/pantone");
              }
            }}
          >
            <Link
              className="home-program-link home-pantone-link"
              to={programs[0].to}
              aria-label={programs[0].title}
            >
              <div className="center-bg">
                <div className="wave-lines" aria-hidden="true">
                  <svg
                    viewBox="0 0 300 400"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <path
                      d="M0 80 Q75 40 150 80 Q225 120 300 80"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 120 Q75 80 150 120 Q225 160 300 120"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 160 Q75 120 150 160 Q225 200 300 160"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 200 Q75 160 150 200 Q225 240 300 200"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 240 Q75 200 150 240 Q225 280 300 240"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M0 280 Q75 240 150 280 Q225 320 300 280"
                      fill="none"
                      stroke="#1a6090"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="pantone-visual">
                  <div className="pantone-swatch" />
                  <div className="pantone-brand">PANTONE®</div>
                  <div className="pantone-code">
                    19-4052
                    <br />
                    Classic Blue
                  </div>
                </div>
              </div>
              <div className="center-footer">
                <div className="center-mission">Mission 01 · Color Sense</div>
                <div className="center-title">Pantone Color</div>
                <div className="center-desc">
                  색채 감각 훈련 · 19-4052 Classic Blue를 찾아라
                </div>
              </div>
            </Link>
          </article>

          <div className="home-side">
            <article className="home-program home-program-small card dokdo-card">
              <div className="dokdo-bg">
                <div className="island-shapes" aria-hidden="true">
                  <svg
                    viewBox="0 0 200 160"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    <ellipse
                      cx="80"
                      cy="100"
                      rx="50"
                      ry="25"
                      fill="#1a4030"
                      opacity="0.8"
                    />
                    <ellipse
                      cx="140"
                      cy="110"
                      rx="35"
                      ry="18"
                      fill="#1a4030"
                      opacity="0.6"
                    />
                    <path d="M55 100 Q80 60 105 100" fill="#2a5040" />
                    <path d="M115 110 Q140 75 165 110" fill="#1e4035" />
                    <ellipse
                      cx="100"
                      cy="135"
                      rx="90"
                      ry="20"
                      fill="#0a2018"
                      opacity="0.5"
                    />
                  </svg>
                </div>
              </div>
              <div className="dokdo-footer">
                <div className="dokdo-mission">Mission 02 · Territory</div>
                <div className="dokdo-title">독도 탐방</div>
                <div className="dokdo-desc">
                  우리 땅 독도의 역사와 자연을 탐험하세요
                </div>
              </div>
            </article>

            <article className="home-program home-program-quiz card quiz-card">
              <Link
                className="home-program-link home-quiz-link"
                to={programs[1].to}
                aria-label={programs[1].title}
              >
                <div className="quiz-bg">
                  <div className="caution-lines" aria-hidden="true" />
                </div>
                <div className="quiz-live">
                  <div className="quiz-live-dot" aria-hidden="true" />
                  Live
                </div>
                <div className="quiz-footer">
                  <div className="quiz-mission">Mission 03 · Escape Room</div>
                  <div className="quiz-title">방탈출 퀴즈</div>
                  <div className="quiz-desc">
                    단서를 해독하고 모든 자물쇠를 열어라 🔐
                  </div>
                </div>
              </Link>
            </article>
          </div>
        </section>

        <div className="footer">
          Classified · Education Office Exploration Program · 2026
        </div>
      </section>
    </main>
  );
}
