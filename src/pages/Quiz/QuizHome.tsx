import { Link } from "react-router-dom";

const tarotVideos = [
  { id: "moon", title: "달", src: "/tarot-videos/moon.mp4", to: "/quiz1" },
  { id: "fire", title: "불", src: "/tarot-videos/fire.mp4?v=2", to: "/quiz2" },
  { id: "three", title: "삼", src: "/tarot-videos/three.mp4", to: "/quiz3" },
];

export default function QuizHome() {
  return (
    <main
      className="app-shell"
      style={{
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        maxWidth: "none",
        margin: 0,
        overflow: "hidden",
        background: "#07122a",
      }}
    >
      <img
        src="/img/home/다각형.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          width: "clamp(580px, 28vw, 546px)",
          top: "-320px",
          left: "25%",
          opacity: 0.7,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        src="/img/home/사각형.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          width: "clamp(491px, 20vw, 290px)",
          right: "-300px",
          top: "24%",
          opacity: 0.6,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <img
        src="/img/home/사각형2.webp"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          width: "clamp(466px, 28vw, 308px)",
          left: "-172px",
          bottom: "-120px",
          opacity: 0.5,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Link
        to="/"
        aria-label="홈으로 이동"
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.16)",
          display: "grid",
          placeItems: "center",
          backdropFilter: "blur(2px)",
          zIndex: 2,
        }}
      >
        <img
          src="https://api.iconify.design/mdi/home.svg?color=%23ffffff"
          alt=""
          width={24}
          height={24}
        />
      </Link>
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          margin: "72px 0 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {tarotVideos.map((video, index) => (
          <Link
            key={video.id}
            to={video.to}
            aria-label={`${index + 1}번 퀴즈로 이동`}
            style={{
              borderRadius: "14px",
              lineHeight: 0,
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div style={{ borderRadius: "14px", overflow: "hidden" }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  display: "block",
                  borderRadius: "14px",
                }}
              >
                <source src={video.src} type="video/mp4" />
                브라우저가 영상을 지원하지 않습니다.
              </video>
            </div>
            {index === 0 && (
              <p
                style={{
                  margin: "10px 2px 0",
                  lineHeight: 1.35,
                  color: "#f8fafc",
                  textAlign: "center",
                }}
              >
                <span style={{ display: "block", fontSize: "22px", fontWeight: 800 }}>
                  Quiz 1:
                </span>
                <span style={{ display: "block", marginTop: "4px", fontSize: "18px", fontWeight: 600 }}>
                  개척령 어느 어부와의 시그널
                </span>
              </p>
            )}
            {index === 1 && (
              <p
                style={{
                  margin: "10px 2px 0",
                  lineHeight: 1.35,
                  color: "#f8fafc",
                  textAlign: "center",
                }}
              >
                <span style={{ display: "block", fontSize: "22px", fontWeight: 800 }}>
                  Quiz 2:
                </span>
                <span style={{ display: "block", marginTop: "4px", fontSize: "18px", fontWeight: 600 }}>
                  새벽을 여는 독도
                </span>
              </p>
            )}
            {index === 2 && (
              <p
                style={{
                  margin: "10px 2px 0",
                  lineHeight: 1.35,
                  color: "#f8fafc",
                  textAlign: "center",
                }}
              >
                <span style={{ display: "block", fontSize: "22px", fontWeight: 800 }}>
                  Quiz 3:
                </span>
                <span style={{ display: "block", marginTop: "4px", fontSize: "18px", fontWeight: 600 }}>
                  깨진 안용복의 영혼구슬
                </span>
              </p>
            )}
          </Link>
        ))}
      </section>
    </main>
  );
}
