import { Link } from "react-router-dom";

export default function PantoneHome() {
  return (
    <main className="app-shell">
      <section className="hero">
        <h1>팬톤 컬러 찾기</h1>
      </section>
      <section>
        <p>팬톤 컬러 찾기 홈 화면입니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </section>
    </main>
  );
}
