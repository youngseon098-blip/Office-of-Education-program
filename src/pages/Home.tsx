import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Home.css";
import { BASE } from "../utils/base";

const TOPTRUMPS_SKIP_INTRO_KEY = "toptrumps_skip_intro_overlay";

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

  function goToTopTrumpsMission() {
    try {
      localStorage.removeItem(TOPTRUMPS_SKIP_INTRO_KEY);
    } catch (_) {}
    navigate(programs[0].to);
  }

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
        src={BASE + "img/home/다각형.webp"}
        alt=""
      />
      <img
        className="home-deco home-deco-right"
        src={BASE + "img/home/사각형.webp"}
        alt=""
      />
      <img
        className="home-deco home-deco-bottom"
        src={BASE + "img/home/사각형2.webp"}
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
            onClick={goToTopTrumpsMission}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                goToTopTrumpsMission();
              }
            }}
          >
            <Link
              className="home-program-link home-pantone-link"
              to={programs[0].to}
              aria-label={programs[0].title}
              onClick={(event) => {
                event.preventDefault();
                goToTopTrumpsMission();
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: "16px",
                  overflow: "hidden",
                  aspectRatio: "1.65",
                  cursor: "pointer",
                  background:
                    "linear-gradient(175deg,#0e2233 0%,#162f45 25%,#1a3a52 45%,#0f1e2e 70%,#080f18 100%)",
                }}
              >
                {/* 수평선 빛 */}
                <div
                  style={{
                    position: "absolute",
                    top: "28%",
                    left: 0,
                    right: 0,
                    height: 180,
                    background:
                      "radial-gradient(ellipse at 52% 0%,rgba(255,200,120,0.18) 0%,rgba(180,140,80,0.08) 40%,transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                {/* 구름 */}
                <svg
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "55%",
                    opacity: 0.18,
                  }}
                  viewBox="0 0 800 280"
                  preserveAspectRatio="none"
                >
                  <ellipse cx="200" cy="80" rx="180" ry="55" fill="#c8d8e8" />
                  <ellipse cx="420" cy="60" rx="220" ry="45" fill="#d0dde8" />
                  <ellipse cx="650" cy="90" rx="160" ry="50" fill="#c0d0e0" />
                  <ellipse cx="100" cy="110" rx="120" ry="35" fill="#b8cad8" />
                  <ellipse cx="580" cy="50" rx="140" ry="38" fill="#ccdae6" />
                </svg>

                {/* 바다 물결 */}
                <svg
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "50%",
                    opacity: 0.35,
                  }}
                  viewBox="0 0 800 250"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,60 C120,40 240,80 380,55 C520,30 640,70 800,50 L800,250 L0,250 Z"
                    fill="#1a4060"
                  />
                  <path
                    d="M0,110 C140,88 280,128 420,105 C560,82 680,118 800,98 L800,250 L0,250 Z"
                    fill="#122d45"
                  />
                  <path
                    d="M0,155 C160,135 300,170 460,150 C600,132 710,162 800,145 L800,250 L0,250 Z"
                    fill="#0c1f30"
                  />
                </svg>

                {/* 범선 실루엣 */}
                <svg
                  style={{
                    position: "absolute",
                    bottom: "12%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "48%",
                    opacity: 0.72,
                    filter: "blur(0.4px)",
                  }}
                  viewBox="0 0 320 300"
                  fill="none"
                >
                  <path
                    d="M85,230 Q160,248 235,230 L222,265 Q160,276 98,265 Z"
                    fill="#0a1520"
                  />
                  <rect x="98" y="212" width="124" height="22" rx="3" fill="#0a1520" />
                  <rect x="157" y="30" width="3.5" height="185" fill="#162535" rx="1" />
                  <rect x="108" y="75" width="2.5" height="142" fill="#162535" rx="1" />
                  <path
                    d="M160,35 C185,60 210,95 205,130 C200,155 170,168 160,172 L160,35Z"
                    fill="rgba(220,210,185,0.82)"
                  />
                  <path
                    d="M157,35 C132,58 108,92 112,128 C116,153 145,166 157,170 L157,35Z"
                    fill="rgba(215,205,180,0.78)"
                  />
                  <path
                    d="M110,78 C130,100 148,128 145,158 C143,172 118,180 110,183 L110,78Z"
                    fill="rgba(210,200,175,0.72)"
                  />
                  <rect x="108" y="90" width="100" height="2" rx="1" fill="#162535" opacity="0.6" />
                  <rect x="108" y="140" width="97" height="1.5" rx="1" fill="#162535" opacity="0.5" />
                  <path d="M160,30 L180,40 L160,50 Z" fill="rgba(160,50,50,0.85)" />
                  <line
                    x1="98"
                    y1="215"
                    x2="68"
                    y2="195"
                    stroke="#162535"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110,268 Q160,278 210,268"
                    stroke="rgba(100,160,200,0.15)"
                    strokeWidth="6"
                    fill="none"
                  />
                </svg>

                {/* 수면 반짝임 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "10%",
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(90deg,transparent 10%,rgba(180,220,255,0.12) 30%,rgba(220,240,255,0.25) 50%,rgba(180,220,255,0.12) 70%,transparent 90%)",
                    pointerEvents: "none",
                  }}
                />

                {/* 상단 라벨 */}
                <div style={{ position: "absolute", top: 14, left: 18 }}>
                  <span
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 9,
                      letterSpacing: 4,
                      color: "rgba(180,200,220,0.55)",
                    }}
                  >
                    MISSION 01 · VOYAGE
                  </span>
                </div>

                {/* LIVE 배지 */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    background: "rgba(120,20,20,0.85)",
                    borderRadius: 4,
                    padding: "3px 9px",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    border: "1px solid rgba(180,60,60,0.4)",
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#ff5555",
                      animation: "blink 1s step-end infinite",
                      boxShadow: "0 0 5px #ff3333",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: 2,
                      color: "rgba(255,200,200,0.9)",
                      fontFamily: "monospace",
                    }}
                  >
                    LIVE
                  </span>
                </div>

                {/* 하단 텍스트 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 20px 18px",
                    background:
                      "linear-gradient(0deg,rgba(5,10,18,0.98) 55%,rgba(5,10,18,0.7) 80%,transparent)",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 26,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background:
                          "linear-gradient(90deg,rgba(120,40,40,0.9),rgba(120,40,40,0.1))",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 8,
                        letterSpacing: 3,
                        color: "rgba(160,80,70,0.85)",
                        fontFamily: "Cinzel, serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      HWASUNG COMPANY &amp; EDUCATION
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background:
                          "linear-gradient(90deg,rgba(120,40,40,0.1),rgba(120,40,40,0.9))",
                      }}
                    />
                  </div>
                  <h2
                    style={{
                      fontFamily: "Cinzel, serif",
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#e8dfc8",
                      margin: "0 0 4px",
                      letterSpacing: 3,
                      textShadow: "0 2px 12px rgba(100,140,180,0.3)",
                      textAlign: "left",
                    }}
                  >
                    Cruise Mission
                  </h2>
                  <p
                    style={{
                      fontFamily: "Noto Sans KR, sans-serif",
                      fontSize: 11,
                      fontWeight: 300,
                      color: "rgba(160,180,200,0.7)",
                      margin: 0,
                      letterSpacing: 1,
                      textAlign: "left",
                    }}
                  >
                    대항해시대의 울릉도를 탐험하라
                  </p>
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
