import { Link } from "react-router-dom";

export default function Quiz2() {
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
      <section>
        <h1 style={{ margin: "0 0 12px" }}>Quiz 2</h1>
        <p style={{ margin: 0 }}>새벽을 여는 독도</p>
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
