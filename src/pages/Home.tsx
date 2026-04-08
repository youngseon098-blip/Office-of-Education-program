import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./Home.css";

const programs = [
  {
    id: "pantone-color",
    title: "팬톤 컬러 찾기",
    image: "/img/home/팬톤컬러찾기.webp",
    to: "/pantone",
  },
  {
    id: "escape-room",
    title: "방탈출 퍼즐북",
    image: "/img/home/방탈출.webp",
    to: "/quiz",
  },
];

export default function Home() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const timeText = useMemo(
    () =>
      now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    [now],
  );

  const dayLabel = useMemo(
    () =>
      now.toLocaleDateString("ko-KR", {
        weekday: "long",
      }),
    [now],
  );

  const dateNumber = useMemo(() => now.getDate(), [now]);

  return (
    <main className="home-screen">
      <img className="home-deco home-deco-top" src="/img/home/다각형.webp" alt="" />
      <img className="home-deco home-deco-right" src="/img/home/사각형.webp" alt="" />
      <img className="home-deco home-deco-bottom" src="/img/home/사각형2.webp" alt="" />

      <section className="home-shell">
        <header className="home-header">
          <p>Office of Education program</p>
          <h1>
            안내에 따라
            <br />
            프로그램을 선택하세요.
          </h1>
        </header>

        <section className="home-grid" aria-label="프로그램 목록">
          <aside className="home-info">
            <article className="home-info-card home-info-card-time">
              <p>현재 시간</p>
              <strong>{timeText}</strong>
            </article>
            <article className="home-info-card home-info-card-day">
              <p>{dayLabel}</p>
              <strong>{dateNumber}</strong>
            </article>
          </aside>

          <article className="home-program home-program-main">
            <Link
              className="home-program-link"
              to={programs[0].to}
              aria-label={programs[0].title}
            >
              <img
                src={programs[0].image}
                alt={programs[0].title}
                loading="lazy"
              />
              <h2>Pantone Color</h2>
            </Link>
          </article>

          <div className="home-side">
            <article className="home-program home-program-small">
              <img
                src="/img/home/팬톤컬러찾기.webp"
                alt="장식 이미지"
                loading="lazy"
              />
            </article>

            <article className="home-program home-program-quiz">
              <Link
                className="home-program-link"
                to={programs[1].to}
                aria-label={programs[1].title}
              >
                <img
                  src={programs[1].image}
                  alt={programs[1].title}
                  loading="lazy"
                />
                <h2>Quiz</h2>
              </Link>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
