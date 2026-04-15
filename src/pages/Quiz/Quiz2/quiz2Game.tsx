import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./quiz2Game.css";

type Mood = "n" | "u" | "l";

type StageScene = { t: "stage"; num: number; title: string; sub?: string };
type DialogueScene = {
  t: "dlg";
  ch: "director" | "agentA" | "laptop";
  lbl: string;
  mood: Mood;
  lines: string[];
};
type AtmoScene = { t: "atmo"; icon: string; lbl: string; desc: string };
type QuizScene = {
  t: "quiz";
  mood: "n" | "u";
  badge: string;
  title: string;
  body: string;
  ph: string;
  ans: string;
  hint?: string;
};
type MultiQuizScene = {
  t: "quiz-m";
  mood: "n";
  badge: string;
  title: string;
  body: string;
  inputs: { lbl: string; ph: string; ans: string }[];
};
type ResultScene = { t: "result"; lbl: string; ans: string; desc: string };
type SuccessScene = { t: "success" };
type Scene =
  | StageScene
  | DialogueScene
  | AtmoScene
  | QuizScene
  | MultiQuizScene
  | ResultScene
  | SuccessScene;

const ICONS = { director: "👩‍💼", agentA: "🕵️", laptop: "💻" } as const;
const QUIZ_CHECKPOINTS = [7, 12, 17, 22, 26];

const SCENES: Scene[] = [
  { t: "stage", num: 0, title: "MISSION 02", sub: "새벽을 여는 독도" },
  {
    t: "dlg",
    ch: "director",
    lbl: "국정원 최지수 국장",
    mood: "n",
    lines: ["어머, 오셨네요? 방가원요", "저는 국정원 최지수 국장이예요~", "이번에 새로 합류하게 된 신입 요원들이시죠"],
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "국정원 최지수 국장",
    mood: "n",
    lines: [
      "자, 다들 앉으세요. 상황이 급해서 바로 본론부터 들어갈게요.",
      "아시다시피 울릉도는 연평균 기온 12.3도로 꽤 온화한 해양성 기후를 띠는 곳이에요.",
      "그런데 최근 들어 울릉도 일대에 안개가 너무 자주 발생한다는 주민들 신고가 빗발치고 있어요.",
    ],
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "국정원 최지수 국장",
    mood: "n",
    lines: [
      "그냥 단순한 기상 현상이라고 보기엔 심상치 않아요.",
      "그래서 여러분이 직접 울릉도로 잠입해서, 이 안개의 진짜 원인이 뭔지 낱낱이 파악해 주셨으면 해요.",
      "울릉도 현지에 도착하면 요원 A가 대기하고 있을 거예요. 접선해서 문제를 해결하세요.",
    ],
  },
  {
    t: "atmo",
    icon: "⚓",
    lbl: "울릉도로 이동 중",
    desc: "거센 파도 속 크루즈가 울릉도를 향해 나아간다.\n갈매기 소리와 엔진 소리만이 울린다.",
  },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 무전 수신 ]",
    mood: "n",
    lines: [
      "아.아. 요원 A입니다.",
      "아직 당신의 신원이 확인되지 않아 무전으로 먼저 인사 드리는 점 미리 사과 드리겠습니다.",
      "당신들의 신원을 확인하는 점 양해부탁드립니다.",
    ],
  },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 무전 수신 ]",
    mood: "n",
    lines: ["너무 겁먹지는 마십시요. 울릉도로 온다면 통상적으로 하는 관례라고 생각하시면 됩니다.", "그럼 우리 신입 요원님들 실력 좀 보도록 하겠습니다."],
  },
  {
    t: "quiz",
    mood: "n",
    badge: "3급 기밀 절차 · 항구 거리 계산",
    title: "각 알파벳의 숫자를 기입한 후 연산을 계산하시오",
    body: "1. 죽변항 : AB0.3 km  (A=1, B=3)\n2. 묵호항 : CDE.0 km  (C=1, D=6, E=1)\n3. 포항항 : 21F.0 km  (F=7)\n\nSCAPIN 제GHI호  (G=6, H=7, I=7)\n\nX = (G*F) + (D*H) + B\nY = (A+C+E) / I\n\nX + Y = ?",
    ph: "정답 입력 (소수점 포함)",
    ans: "87.4",
    hint: "X=87, Y=0.4",
  },
  { t: "result", lbl: "SIGNAL CONFIRMED", ans: "87.4 km", desc: "울릉도와 독도의 거리는 87.4km입니다.\n신원이 확인되었습니다." },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 무전 수신 ]",
    mood: "n",
    lines: ["신원도 확인 되었으니 제가 있는 곳을 알려 드리겠습니다.", "보는 눈이 많아 구체적인 위치는 암호로 전송하겠습니다."],
  },
  { t: "stage", num: 1, title: "STAGE 1", sub: "암호 해독" },
  {
    t: "dlg",
    ch: "laptop",
    lbl: "[ 보안관리 AI 프로세서 ]",
    mood: "l",
    lines: [
      "(기계음) 안녕하세요 보안관리 AI 프로세서입니다.",
      "(기계음) 요원 A가 당신에게 전달한 기밀 문서입니다.",
      "(기계음) 열람을 원하시면 버튼을 눌러주십시요.",
    ],
  },
  {
    t: "quiz",
    mood: "n",
    badge: "STAGE 1 · 단어 해독",
    title: "다음 문장에서 공통으로 가장 많이 표현된 단어를 해독하세요",
    body: "[보기 1]\n독도 등대(항로표지관리소)는 대한민국 영토 최동단에서 밤바다를 밝히며, 우리 영토의 실효적 지배를 상징하는 핵심 시설. 이 등대의 높이는 15M이다.\n\n[보기 2]\n울릉도 최초의 등대이며 1958년 4월에 첫 불을 밝혔다. 통칭 태하등대라고 하며 높이는 7.6M의 백색 원형 구조물로 약 50km 불빛을 전달한다.",
    ph: "공통 단어 입력",
    ans: "등대",
    hint: "두 지문 모두에서 반복되는 단어",
  },
  { t: "result", lbl: "STAGE 1 CLEAR", ans: "등대식당", desc: "등대식당으로 이동하세요.\n단, 식당 안으로 들어가지 않습니다." },
  { t: "stage", num: 2, title: "STAGE 2", sub: "광고판 해독" },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 도동 ]",
    mood: "n",
    lines: [
      "반갑습니다. 정식으로 인사드리죠. 요원 A입니다.",
      "여기가 그 유명한 울릉도 도동입니다. 이미 적들의 정보망이 이 골목 구석구석까지 뻗어있을 가능성이 높습니다.",
      "저는 지금부터 울릉군청 조사관을 접선해 내부 단서를 확보하겠습니다.",
    ],
  },
  {
    t: "dlg",
    ch: "laptop",
    lbl: "[ 보안관리 AI 프로세서 ]",
    mood: "l",
    lines: [
      "(기계음) 요원 A가 당신에게 전달한 기밀 파일입니다.",
      "(기계음) 해당 파일은 암호로 잠금이 걸려 있습니다.",
      "(기계음) 비밀번호를 풀어 단서를 찾길 바랍니다.",
    ],
  },
  {
    t: "quiz-m",
    mood: "n",
    badge: "STAGE 2 · 광고판 위치 해독",
    title: "해당 장소에는 아래의 숫자가 의미하는 단어가 있다",
    body: "A. 정면   B. 노란색   C. 다리   D. 하트\n\n4 // 3 // 8\n\n→ 4번째 ( ) · 3번째 ( ) · 8번째 ( )",
    inputs: [
      { lbl: "4번째", ph: "4번째 단어", ans: "경상북도" },
      { lbl: "3번째", ph: "3번째 단어", ans: "울릉군" },
      { lbl: "8번째", ph: "8번째 단어", ans: "한국옥외광고협회" },
    ],
  },
  { t: "result", lbl: "STAGE 2 CLEAR", ans: "경상북도 · 울릉군", desc: "한국옥외광고협회\n해당 그림을 보고 장소로 이동합니다." },
  { t: "stage", num: 3, title: "STAGE 3", sub: "긴급 해독" },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 긴급 무전 ]",
    mood: "u",
    lines: [
      "들리십니까? 요원! 여기는 요원 A입니다! 상황이 긴박합니다!",
      "독도를 가리고 있는 저 안개들... 자연 현상이 아니었습니다!",
      "인공 안개 발생기로 독도를 지도상에서 지우려고 하고 있습니다!",
    ],
  },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 긴급 무전 ]",
    mood: "u",
    lines: [
      "시간이 없습니다! 제어 시스템에 복잡한 암호가 걸려 있습니다.",
      "지금 기계에 표시된 문제를 불러드릴 테니, 즉시 해독 코드 보내주십시요!",
      "독도가 완전히 사라지기 전에 서둘러야 합니다!",
    ],
  },
  {
    t: "quiz",
    mood: "u",
    badge: "⚠ STAGE 3 · 긴급 연산",
    title: "각 나라까지의 거리를 계산하여 최종 암호값을 구하시오",
    body: "U = 울릉도  →    87.4 km\nR = 러시아  →  6,000 km\nM = 미국    → 10,500 km\nO = 오키섬  →   157.5 km\n\n( M - R ) - U - O = ?",
    ph: "정답 입력 (소수점 1자리)",
    ans: "4255.1",
    hint: "10500 - 6000 - 87.4 - 157.5",
  },
  { t: "stage", num: 4, title: "STAGE 4", sub: "최종 해독" },
  {
    t: "dlg",
    ch: "director",
    lbl: "[ 최지수 국장 · 긴급 ]",
    mood: "u",
    lines: [
      "요원! 내 말 들려요? 최지수 국장이예요. 상황이 완전히 뒤집혔어요!",
      "요원 A... 그 자식, 일본의 첩자였어요. 다행히 요원 B에게 제거되었어요.",
      "기계는 이미 과부하 상태고, 안개가 독도 전체를 집어삼키기 일보 직전이예요!",
    ],
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "[ 최지수 국장 · 긴급 ]",
    mood: "u",
    lines: ["이제 믿을 건 당신밖에 없어요!", "얼릉 새로운 암호 해독 코드를 분석해주세요!"],
  },
  {
    t: "quiz",
    mood: "u",
    badge: "⚠ STAGE 4 · 최종 암호",
    title: "새로운 공식으로 최종 암호를 계산하시오 — 시간이 없습니다!",
    body: "U = 울릉도  →    87.4 km\nR = 러시아  →  6,000 km\nM = 미국    → 10,500 km\nO = 오키섬  →   157.5 km\n\n( M + R ) + U - O = ?",
    ph: "최종 암호 입력",
    ans: "16429.9",
    hint: "10500 + 6000 + 87.4 - 157.5",
  },
  { t: "success" },
];

function norm(v: string) {
  return v.replace(/,/g, "").replace(/\s/g, "").toLowerCase();
}

export default function Quiz2Game() {
  const [cur, setCur] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [singleInput, setSingleInput] = useState("");
  const [singlePlaceholder, setSinglePlaceholder] = useState("");
  const [multiInputs, setMultiInputs] = useState<string[]>([]);
  const [singleError, setSingleError] = useState(false);
  const [multiErrors, setMultiErrors] = useState<boolean[]>([]);
  const [hintShown, setHintShown] = useState(false);

  const rainRef = useRef<HTMLCanvasElement>(null);
  const boltRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const typeTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const scene = SCENES[cur];

  useEffect(() => {
    document.title = "미션 2: 새벽을 여는 독도";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useEffect(() => {
    const rCanvas = rainRef.current;
    const bCanvas = boltRef.current;
    const flash = flashRef.current;
    if (!rCanvas || !bCanvas || !flash) return;
    const rx = rCanvas.getContext("2d");
    const bx = bCanvas.getContext("2d");
    if (!rx || !bx) return;

    let rainRaf = 0;
    let lightningTimer: ReturnType<typeof setTimeout> | null = null;
    let secondStrikeTimer: ReturnType<typeof setTimeout> | null = null;

    const resize = () => {
      rCanvas.width = window.innerWidth;
      rCanvas.height = window.innerHeight;
      bCanvas.width = window.innerWidth;
      bCanvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drops = Array.from({ length: 250 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: Math.random() * 13 + 5,
      speed: Math.random() * 7 + 5,
      op: Math.random() * 0.38 + 0.18,
      w: Math.random() * 0.7 + 0.65,
      ang: Math.random() * 0.08 - 0.04,
    }));

    const rain = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      rx.clearRect(0, 0, w, h);
      drops.forEach((d) => {
        const rad = Math.PI / 2 + 0.22 + d.ang;
        const ex = d.x + Math.cos(rad) * d.len;
        const ey = d.y + Math.sin(rad) * d.len;
        rx.beginPath();
        rx.moveTo(d.x, d.y);
        rx.lineTo(ex, ey);
        rx.strokeStyle = `rgba(188,215,245,${d.op})`;
        rx.lineWidth = d.w;
        rx.stroke();
        rx.beginPath();
        rx.moveTo(d.x, d.y);
        rx.lineTo(ex, ey);
        rx.strokeStyle = `rgba(240,250,255,${d.op * 0.5})`;
        rx.lineWidth = d.w * 0.28;
        rx.stroke();
        d.y += d.speed;
        d.x += d.speed * 0.22;
        if (d.y > h || d.x > w) {
          d.x = Math.random() * w - 50;
          d.y = -20;
        }
      });
      rainRaf = requestAnimationFrame(rain);
    };

    const bolt = (x: number, y: number, a: number, len: number, dep: number) => {
      if (len < 12) return;
      const ex = x + Math.cos(a) * len + (Math.random() - 0.5) * 28;
      const ey = y + Math.sin(a) * len + (Math.random() - 0.5) * 16;
      const al = Math.max(0.12, 1 - dep * 0.22);
      const lw = Math.max(0.32, 2.4 - dep * 0.5);
      bx.beginPath();
      bx.moveTo(x, y);
      bx.lineTo(ex, ey);
      bx.strokeStyle = `rgba(178,215,255,${al})`;
      bx.lineWidth = lw;
      bx.stroke();
      bx.beginPath();
      bx.moveTo(x, y);
      bx.lineTo(ex, ey);
      bx.strokeStyle = `rgba(118,162,255,${al * 0.38})`;
      bx.lineWidth = lw * 4.5;
      bx.stroke();
      const branch = dep < 3 ? Math.floor(Math.random() * 3) + 1 : 0;
      for (let i = 0; i < branch; i += 1) {
        const tt = Math.random() * 0.7 + 0.15;
        bolt(x + (ex - x) * tt, y + (ey - y) * tt, a + (Math.random() - 0.5) * 1.1, len * (Math.random() * 0.35 + 0.28), dep + 1);
      }
      bolt(ex, ey, a + (Math.random() - 0.5) * 0.35, len * 0.62, dep + 1);
    };

    const strike = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      bx.clearRect(0, 0, w, h);
      const sx = w * 0.15 + Math.random() * w * 0.7;
      const ang = Math.PI / 2 + (Math.random() - 0.5) * 0.65;
      flash.classList.add("on");
      setTimeout(() => flash.classList.remove("on"), 62);
      bolt(sx, 0, ang, h * 0.55, 0);
      let op = 1;
      if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
      const fade = window.setInterval(() => {
        op -= 0.15;
        if (op <= 0) {
          window.clearInterval(fade);
          bx.clearRect(0, 0, w, h);
          return;
        }
        bx.globalAlpha = op;
        bx.clearRect(0, 0, w, h);
        bolt(sx, 0, ang, h * 0.55, 0);
        bx.globalAlpha = 1;
      }, 50);
      fadeTimerRef.current = fade;

      if (Math.random() < 0.35) {
        secondStrikeTimer = setTimeout(() => {
          bx.clearRect(0, 0, w, h);
          flash.classList.add("on");
          setTimeout(() => flash.classList.remove("on"), 42);
          bolt(sx + (Math.random() - 0.5) * 85, 0, ang + (Math.random() - 0.5) * 0.3, h * 0.44, 0);
          setTimeout(() => bx.clearRect(0, 0, w, h), 200);
        }, 125);
      }
    };

    const schedule = () => {
      lightningTimer = setTimeout(() => {
        strike();
        schedule();
      }, Math.random() * 2200 + 900);
    };

    rain();
    lightningTimer = setTimeout(schedule, 800);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rainRaf);
      if (lightningTimer) clearTimeout(lightningTimer);
      if (secondStrikeTimer) clearTimeout(secondStrikeTimer);
      if (fadeTimerRef.current) window.clearInterval(fadeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeTimerRef.current) window.clearTimeout(typeTimerRef.current);
    setLineIdx(0);
    setTypedText("");
    setSingleInput("");
    setSingleError(false);
    setHintShown(false);
    if (scene.t === "quiz") setSinglePlaceholder(scene.ph);
    if (scene.t === "quiz-m") {
      setMultiInputs(scene.inputs.map(() => ""));
      setMultiErrors(scene.inputs.map(() => false));
    } else {
      setMultiInputs([]);
      setMultiErrors([]);
    }
  }, [cur, scene]);

  useEffect(() => {
    if (scene.t !== "dlg") return;
    const line = scene.lines[lineIdx] ?? "";
    setTypedText("");
    setIsTyping(true);
    let i = 0;
    const type = () => {
      if (i < line.length) {
        const ch = line[i];
        i += 1;
        setTypedText((prev) => prev + ch);
        const d = ch === "." || ch === "!" || ch === "?" ? 68 : ch === "," ? 42 : ch === " " ? 30 : 48 + (Math.random() - 0.5) * 16;
        typeTimerRef.current = window.setTimeout(type, d);
      } else {
        setIsTyping(false);
      }
    };
    type();
    return () => {
      if (typeTimerRef.current) window.clearTimeout(typeTimerRef.current);
    };
  }, [scene, lineIdx]);

  const progressDots = useMemo(() => {
    return QUIZ_CHECKPOINTS.map((si) => (cur > si ? "done" : cur >= si ? "now" : ""));
  }, [cur]);

  const changeScene = (updater: (prev: number) => number) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      setCur((prev) => {
        const next = updater(prev);
        return Math.max(0, Math.min(SCENES.length - 1, next));
      });
      setIsTransitioning(false);
    }, 320);
  };

  const adv = () => changeScene((prev) => prev + 1);
  const goBack = () => changeScene((prev) => prev - 1);

  const nextLine = () => {
    if (scene.t !== "dlg") return;
    if (isTyping) {
      if (typeTimerRef.current) window.clearTimeout(typeTimerRef.current);
      setTypedText(scene.lines[lineIdx]);
      setIsTyping(false);
      return;
    }
    if (lineIdx < scene.lines.length - 1) setLineIdx((prev) => prev + 1);
    else adv();
  };

  const submitSingle = () => {
    if (scene.t !== "quiz") return;
    if (norm(singleInput) === norm(scene.ans)) {
      adv();
      return;
    }
    setSingleError(true);
    setSingleInput("");
    setSinglePlaceholder("오답입니다. 다시 시도하세요.");
    window.setTimeout(() => {
      setSingleError(false);
      setSinglePlaceholder(scene.ph);
    }, 1800);
  };

  const submitMulti = () => {
    if (scene.t !== "quiz-m") return;
    const errors = scene.inputs.map((item, idx) => norm(multiInputs[idx] ?? "") !== norm(item.ans));
    setMultiErrors(errors);
    if (errors.every((v) => !v)) {
      adv();
      return;
    }
    window.setTimeout(() => setMultiErrors(scene.inputs.map(() => false)), 500);
    setMultiInputs((prev) => prev.map((v, idx) => (errors[idx] ? "" : v)));
  };

  const moodClass = (mood?: Mood) => (mood === "u" ? "urgent" : mood === "l" ? "laptop" : "");

  return (
    <main className="quiz2game-page">
      <div id="bg-sky" />
      <div className="dcloud dc1" />
      <div className="dcloud dc2" />
      <div className="dcloud dc3" />
      <canvas id="rain-c" ref={rainRef} />
      <div className="fog-l fl2" />
      <div className="fog-l fl1" />
      <canvas id="bolt-c" ref={boltRef} />
      <div id="flash" ref={flashRef} />
      <div id="vig" />

      <div id="topbar">
        <div className="tp-pill">MISSION 02 · 새벽을 여는 독도</div>
      </div>
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
      <div id="prog">
        {progressDots.map((cls, idx) => (
          <div key={idx} className={`pdot ${cls}`} />
        ))}
      </div>
      <div id={`trans ${isTransitioning ? "in" : ""}`} />

      <div id="scene-wrap">
        <div id="char-area">
          {scene.t === "dlg" && (
            <div className="ci-wrap">
              <div className={`ci ${moodClass(scene.mood)}`}>
                <span>{ICONS[scene.ch]}</span>
                <div className="scan" />
              </div>
              <div className={`ci-label ${moodClass(scene.mood)}`}>{scene.lbl}</div>
            </div>
          )}
          {scene.t === "success" && (
            <div className="ci-wrap">
              <div className="ci laptop">
                <span>{ICONS.director}</span>
                <div className="scan" />
              </div>
              <div className="ci-label">국정원 최지수 국장</div>
            </div>
          )}
        </div>

        <div id="scene-content">
          {scene.t === "stage" && (
            <div className="sg-wrap">
              <div className="sg-num">--- {scene.num === 0 ? "INTRO" : `STAGE ${scene.num}`} ---</div>
              <div className="sg-title">{scene.title}</div>
              <div className="sg-sub">{scene.sub ?? ""}</div>
              <button className="sg-btn" onClick={adv}>
                NEXT →
              </button>
            </div>
          )}

          {scene.t === "atmo" && (
            <div className="atmo-wrap">
              <span className="atmo-ico">{scene.icon}</span>
              <div className="atmo-lbl">{scene.lbl}</div>
              <div className="atmo-desc">{scene.desc}</div>
              <div className="atmo-nav">
                <button className="nbtn" onClick={goBack}>
                  ← PREV
                </button>
                <button className="nbtn p" onClick={adv}>
                  NEXT →
                </button>
              </div>
            </div>
          )}

          {scene.t === "dlg" && (
            <>
              <div className={`dlg-box ${moodClass(scene.mood)}`}>
                <div className="dlg-txt">
                  {typedText}
                  <span className={`dlg-cur ${moodClass(scene.mood)}`} />
                </div>
              </div>
              <div className="dlg-nav">
                <button className="nbtn" onClick={goBack}>
                  ← PREV
                </button>
                <span className="pg-lbl">
                  {lineIdx + 1} / {scene.lines.length}
                </span>
                <button className={`nbtn ${!isTyping ? "p" : ""}`} onClick={nextLine}>
                  {isTyping ? "..." : "NEXT →"}
                </button>
              </div>
            </>
          )}

          {scene.t === "quiz" && (
            <>
              <div className={`qz-card ${moodClass(scene.mood)}`}>
                <div className={`qz-badge ${moodClass(scene.mood)}`}>{scene.badge}</div>
                <div className="qz-title">{scene.title}</div>
                <div className={`qz-body ${moodClass(scene.mood)}`}>{scene.body}</div>
                <div className="qi-row">
                  <input
                    className={`qi ${singleError ? "err" : ""}`}
                    value={singleInput}
                    onChange={(e) => setSingleInput(e.target.value)}
                    placeholder={singlePlaceholder}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitSingle();
                    }}
                  />
                  <button className={`qbtn ${moodClass(scene.mood)}`} onClick={submitSingle}>
                    →
                  </button>
                </div>
                <button className="qhint" onClick={() => setHintShown(true)}>
                  {hintShown ? `힌트: ${scene.hint ?? ""}` : "[힌트 보기]"}
                </button>
              </div>
              <div className="bot-nav">
                <button className="nbtn" onClick={goBack}>
                  ← PREV
                </button>
              </div>
            </>
          )}

          {scene.t === "quiz-m" && (
            <>
              <div className="qz-card">
                <div className="qz-badge">{scene.badge}</div>
                <div className="qz-title">{scene.title}</div>
                <div className="qz-body">{scene.body}</div>
                {scene.inputs.map((item, idx) => (
                  <div key={item.lbl} className="mi-row">
                    <span className="mi-lbl">{item.lbl}</span>
                    <input
                      className={`mi ${multiErrors[idx] ? "err" : ""}`}
                      value={multiInputs[idx] ?? ""}
                      onChange={(e) => {
                        const next = [...multiInputs];
                        next[idx] = e.target.value;
                        setMultiInputs(next);
                      }}
                      placeholder={item.ph}
                    />
                  </div>
                ))}
                <button className="msub" onClick={submitMulti}>
                  확인 →
                </button>
              </div>
              <div className="bot-nav">
                <button className="nbtn" onClick={goBack}>
                  ← PREV
                </button>
              </div>
            </>
          )}

          {scene.t === "result" && (
            <div className="rs-wrap">
              <div className="rs-lbl">{scene.lbl}</div>
              <div className="rs-ans">{scene.ans}</div>
              <div className="rs-desc">{scene.desc}</div>
              <div style={{ marginTop: 14, textAlign: "center" }}>
                <button className="nbtn p" onClick={adv}>
                  다음으로 →
                </button>
              </div>
            </div>
          )}

          {scene.t === "success" && (
            <div className="sc-wrap">
              <div className="sc-lbl">--- MISSION COMPLETE ---</div>
              <div className="sc-title">MISSION SUCCESS</div>
              <div className="sc-num">"7"</div>
              <div className="sc-msg">
                수고하셨어요 요원!
                <br />
                덕분에 일본이 만든 안개 발생 기계를 멈출 수 있었어요.
                <br />
                <br />
                대한민국 새벽을 여는 독도를
                <br />
                지키게 해준 당신들, 이번 임무는 완벽했어요.
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
