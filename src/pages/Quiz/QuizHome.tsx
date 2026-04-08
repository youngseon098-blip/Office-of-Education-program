import { Link } from "react-router-dom";

export default function QuizHome() {
  return (
    <main className="app-shell">
      <section className="hero">
        <h1>방탈출 퍼즐북</h1>
      </section>
      <section>
        <p>퀴즈 홈 화면입니다.</p>
        <Link to="/">홈으로 돌아가기</Link>
      </section>
    </main>
  );
}
