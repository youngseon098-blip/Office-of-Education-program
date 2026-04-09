import { Link } from "react-router-dom";

export default function QuizIntro() {
  return (
    <main
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        backgroundColor: "#07122a",
        backgroundImage: "url('/img/Quiz/Quiz1/lab.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "grid",
        placeItems: "center",
      }}
    >
      <section
        style={{
          display: "grid",
          placeItems: "center",
          gap: "56px",
          transform: "translateY(-70px)",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#f8fafc",
            fontSize: "24px",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          대한민국 이규원검찰일기 연구소에 도착한 당신입니다.
        </p>
        <img
          src="/img/Quiz/Quiz1/mu.webp"
          alt="연구소 도착 이미지"
          style={{
            width: "min(300px, 60vw)",
            height: "auto",
            borderRadius: "12px",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
          }}
        />
      </section>
      <nav
        aria-label="페이지 이동"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "28px",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "14px",
        }}
      >
        <Link
          to="/quiz1"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#f8fafc",
            background: "rgba(7, 18, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            backdropFilter: "blur(3px)",
          }}
        >
          <img
            src="https://api.iconify.design/mdi/arrow-left.svg?color=%23f8fafc"
            alt=""
            width={18}
            height={18}
          />
          이전
        </Link>
        <Link
          to="/quiz1/lab"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "12px",
            textDecoration: "none",
            color: "#f8fafc",
            background: "rgba(7, 18, 42, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            backdropFilter: "blur(3px)",
          }}
        >
          다음
          <img
            src="https://api.iconify.design/mdi/arrow-right.svg?color=%23f8fafc"
            alt=""
            width={18}
            height={18}
          />
        </Link>
      </nav>
    </main>
  );
}
