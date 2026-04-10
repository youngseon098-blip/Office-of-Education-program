import { Link } from "react-router-dom";

export default function Quiz1FishV3() {
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
      }}
    >
      <img
        src="/img/Quiz/Quiz1/fishV.webp"
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "130vw",
          height: "130dvh",
          objectFit: "cover",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <img
        src="/img/Quiz/Quiz1/vintagePaper1.webp"
        alt=""
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 5vh))",
          display: "block",
          width: "auto",
          height: "auto",
          maxWidth: "min(680px, 86vw)",
          maxHeight: "calc(100dvh - 170px)",
          objectFit: "contain",
          zIndex: 1,
          pointerEvents: "none",
          userSelect: "none",
          filter: "drop-shadow(0 12px 32px rgba(0, 0, 0, 0.45))",
        }}
      />
      <section
        aria-label="힌트 문구"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, calc(-50% - 5vh))",
          width: "min(560px, 72vw)",
          maxHeight: "calc(100dvh - 260px)",
          padding: "26px 30px",
          boxSizing: "border-box",
          overflowY: "auto",
          color: "#1f1a13",
          whiteSpace: "pre-line",
          lineHeight: 1.6,
          fontSize: "clamp(24px, 2.8vw, 36px)",
          fontWeight: 700,
          fontFamily: '"SonggangOTF", "Noto Serif KR", serif',
          textAlign: "left",
          zIndex: 2,
        }}
      >
        다음 힌트는 개척령 시기 전라도 출신의 어부가 있는 위치를 가늠할 수 있는
        두가지의 힌트 중 하나입니다. 1. 대복상회 울릉군 울릉읍 도동{" "}
        <span style={{ color: "#b91c1c", fontWeight: 900 }}>A</span>길 6{"\n"}2.
        연합국 최고사령관 각서 (SCAPIN 제67
        <span style={{ color: "#b91c1c", fontWeight: 900 }}>B</span>호)
        {"\n"}3. 안용복의 2차 도해는 16
        <span style={{ color: "#b91c1c", fontWeight: 900 }}>C</span>6년
        {"\n"}4. 울진죽변~독도의 거리{" "}
        <span style={{ color: "#b91c1c", fontWeight: 900 }}>D</span>16,8km
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
          zIndex: 3,
        }}
      >
        <Link
          to="/quiz1/fishv2"
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
          to="/quiz2"
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
