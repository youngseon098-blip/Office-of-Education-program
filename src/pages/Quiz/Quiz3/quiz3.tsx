import { Link } from "react-router-dom";

export default function Quiz3() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "#07122a",
        color: "#f8fafc",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
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
        }}
      >
        <img
          src="https://api.iconify.design/mdi/home.svg?color=%23ffffff"
          alt=""
          width={24}
          height={24}
        />
      </Link>
      <section>
        <h1 style={{ margin: "0 0 12px" }}>Quiz 3</h1>
        <p style={{ margin: 0 }}>깨진 안용복의 영혼구슬</p>
        <button
          type="button"
          style={{
            marginTop: "18px",
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.28)",
            background: "rgba(255, 255, 255, 0.12)",
            color: "#f8fafc",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          시작하기
        </button>
      </section>
    </main>
  );
}
