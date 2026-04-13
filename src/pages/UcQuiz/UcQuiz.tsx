import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./UcQuiz.css";

type Choice = {
  id: string;
  label: string;
};

function formatMMSS(totalSeconds: number) {
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function UcQuiz() {
  const choices: Choice[] = useMemo(
    () => [
      { id: "986.5", label: "986.5m" },
      { id: "987.5", label: "987.5m" },
      { id: "988.5", label: "988.5m" },
      { id: "985.5", label: "985.5m" },
    ],
    [],
  );

  const correctId = "986.5";

  const startMsRef = useRef<number>(Date.now());
  const [elapsedSec, setElapsedSec] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startMsRef.current) / 1000));
    }, 250);
    return () => window.clearInterval(t);
  }, []);

  function onSubmit() {
    if (!selectedId) return;
    if (selectedId === correctId) {
      setCorrectCount((c) => c + 1);
      setResult("correct");
      return;
    }
    setWrongCount((w) => w + 1);
    setResult("wrong");
  }

  function onReset() {
    setSelectedId(null);
    setResult("idle");
  }

  const submitDisabled = !selectedId || result !== "idle";

  return (
    <main className="ucq-root">
      <section className="ucq-shell">
        <section className="ucq-top-stats" aria-label="퀴즈 진행 정보">
          <div className="ucq-points" aria-hidden="true">
            <div className="ucq-points-num">1</div>
            <div className="ucq-points-unit">번</div>
          </div>

          <div className="ucq-metrics">
            <div className="ucq-metric">
              <div className="ucq-metric-row">
                <span className="ucq-metric-ico" aria-hidden="true">
                  ⏱️
                </span>
                <span className="ucq-metric-text">사용시간:</span>
                <span className="ucq-metric-num">{formatMMSS(elapsedSec)}</span>
              </div>
            </div>
            <div className="ucq-metric">
              <div className="ucq-metric-row">
                <span className="ucq-metric-ico" aria-hidden="true">
                  ❌
                </span>
                <span className="ucq-metric-text">오답횟수:</span>
                <span className="ucq-metric-num">{String(wrongCount).padStart(2, "0")}</span>
              </div>
            </div>
            <div className="ucq-metric">
              <div className="ucq-metric-row">
                <span className="ucq-metric-ico" aria-hidden="true">
                  ✅
                </span>
                <span className="ucq-metric-text">정답횟수:</span>
                <span className="ucq-metric-num">{String(correctCount).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="ucq-card" aria-label="울릉크루즈 미션">
          <div className="ucq-card-kicker">울릉크루즈 · MISSION NO. 12</div>

          <h1 className="ucq-question">
            다음 사진을 선내에서 찾은 후 <span className="ucq-hl">정답</span>을 맞추세요.
          </h1>

          <div className="ucq-photo-row" aria-label="사진 보기">
            <button
              type="button"
              className="ucq-photo-btn"
              onClick={() => setIsModalOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isModalOpen}
            >
              <span className="ucq-photo-icon" aria-hidden="true">
                📸
              </span>
            </button>
            <span className="ucq-photo-help">사진 보기</span>
          </div>

          <form
            className="ucq-choices"
            aria-label="선택지"
            onSubmit={(e) => {
              e.preventDefault();
              // 제출은 하단 고정 버튼에서 처리
            }}
          >
            {choices.map((c, idx) => (
              <label
                key={c.id}
                className={`ucq-choice ${selectedId === c.id ? "is-selected" : ""} ${
                  result !== "idle" && c.id === correctId ? "is-correct" : ""
                } ${result === "wrong" && selectedId === c.id ? "is-wrong" : ""}`}
              >
                <span className="ucq-choice-num">{idx + 1}</span>
                <span className="ucq-choice-text">{c.label}</span>
                <input
                  className="ucq-choice-input"
                  type="radio"
                  name="ucq-answer"
                  value={c.id}
                  checked={selectedId === c.id}
                  onChange={() => {
                    if (result !== "idle") return;
                    setSelectedId(c.id);
                  }}
                />
                <span className="ucq-radio" aria-hidden="true" />
              </label>
            ))}
          </form>

          {result !== "idle" && (
            <div
              className={`ucq-result ${result === "correct" ? "is-correct" : "is-wrong"}`}
              role="status"
              aria-live="polite"
            >
              <span className="ucq-result-ico" aria-hidden="true">
                {result === "correct" ? "✅" : "⚠️"}
              </span>
              <span className="ucq-result-text">
                {result === "correct"
                  ? "정답입니다!"
                  : "오답입니다. 다시 선택 후 제출하세요."}
              </span>
            </div>
          )}
        </section>
      </section>

      <div className="ucq-bottom-bar" role="presentation">
        <div className="ucq-bottom-inner" aria-label="제출 영역">
          <button
            type="button"
            className="ucq-bottom-submit"
            disabled={submitDisabled}
            onClick={onSubmit}
          >
            답변제출
          </button>
          <button
            type="button"
            className="ucq-bottom-reset"
            onClick={onReset}
            disabled={result === "idle" && !selectedId}
          >
            다시 선택
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="ucq-modal-backdrop"
          role="presentation"
          onClick={() => setIsModalOpen(false)}
        >
          <section
            className="ucq-modal"
            role="dialog"
            aria-modal="true"
            aria-label="사진 퀴즈"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="ucq-modal-top">
              <div className="ucq-modal-title">사진</div>
              <button
                type="button"
                className="ucq-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </header>

            <figure className="ucq-modal-figure">
              <img
                className="ucq-modal-img"
                src="/img/UcQuiz/%EC%84%B1%EC%9D%B8%EB%B4%89.webp"
                alt="성인봉(해발 986.5m) 안내 표지"
                loading="eager"
                decoding="async"
              />
            </figure>
          </section>
        </div>
      )}
    </main>
  );
}
