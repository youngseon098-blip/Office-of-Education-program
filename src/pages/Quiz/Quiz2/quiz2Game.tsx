import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./quiz2Game.css";
import {
  disableIntroAudio,
  enableIntroAudio,
  retryIntroAudioPlayback,
} from "./introAudioController";

type Mood = "n" | "u" | "l";

type StageScene = {
  t: "stage";
  num: number;
  title: string;
  sub?: string;
  icon?: string;
};
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

const ICONS = { director: "🧑🏻‍🦳", agentA: "🕵🏻‍♂️", laptop: "💻" } as const;
const QUIZ_CHECKPOINTS = [7, 12, 17, 22, 26];
const INTRO_FULL_TEXT =
  "울릉도에 이상 징후가 포착되고\n당신은 지금 잠입 요원으로\n현장에 투입된다.";
const DIALOGUE_EMPHASIS_TEXTS = ["안개의 진짜 원인", "요원 A가"] as const;
const DIALOGUE_EMPHASIS_REGEX = new RegExp(
  `(${DIALOGUE_EMPHASIS_TEXTS.map((text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})`,
  "g",
);
const LAPTOP_GLITCH_CHARS = "!@#$%^&*░▒▓█■□▪";
const LAPTOP_GLITCH_TOTAL_FRAMES = 36;

const SCENES: Scene[] = [
  {
    t: "stage",
    num: 0,
    title:
      "울릉도에 이상 징후가 포착되고\n당신은 잠입 요원으로 현장에 투입된다.",
    sub: "MISSION · START",
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "국정원 최지수 국장",
    mood: "n",
    lines: [
      "오셨군요, 반가워요. 저는 국정원 최지수 국장이예요.",
      "이번에 새로 합류하게 된 신입 요원들이시죠? 자, 다들 앉으세요. 상황이 급해서 바로 본론으로 들어갈게요.",
    ],
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "국정원 최지수 국장",
    mood: "n",
    lines: [
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
      "울릉도 현장에 도착하면 요원 A가 대기하고 있을 거예요. 접선해서 문제를 해결하세요.",
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
      "아.아. 요원 A입니다. 아직 당신의 신원이 확인되지 않아 무전으로 먼저 인사 드리는 점 미리 사과 드리겠습니다.",
      "절차가 절차인만큼 당신들의 신원을 확인하는 점 양해부탁드립니다.",
    ],
  },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 무전 수신 ]",
    mood: "n",
    lines: [
      "너무 겁먹지는 마십시요. 울릉도로 온다면 통상적으로 하는 관례라고 생각하시면 됩니다.",
      "그럼 우리 신입 요원님들 실력 좀 보도록 하겠습니다.",
    ],
  },
  {
    t: "quiz",
    mood: "n",
    badge: "3급 기밀 절차 · 항구 거리 계산",
    title: "각 알파벳의 숫자를 기입한 후 연산을 계산하시오.",
    body: "1. 죽변항 : AB0.3 km  (A=1, B=3)\n2. 묵호항 : CDE.0 km  (C=1, D=6, E=1)\n3. 포항항 : 21F.0 km  (F=7)\n\nSCAPIN 제GHI호  (G=6, H=7, I=7)\n\nX = (G*F) + (D*H) + B\nY = (A+C+E) / I\n\nX + Y = ?",
    ph: "정답 입력 (소수점 포함 00.0)",
    ans: "87.4",
    hint: "울릉도",
  },
  {
    t: "result",
    lbl: "SIGNAL CONFIRMED",
    ans: "87.4 km",
    desc: "울릉도와 독도의 거리는 87.4km입니다.\n신원이 확인되었습니다.",
  },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 무전 수신 ]",
    mood: "n",
    lines: [
      "신원도 확인 되었으니 제가 있는 곳을 알려 드리겠습니다. 보는 눈이 많아 구체적인 위치는 암호로 전송하겠습니다.",
    ],
  },
  { t: "stage", num: 1, title: "STAGE 1", sub: "암호 해독" },
  {
    t: "dlg",
    ch: "laptop",
    lbl: "[ 보안관리 AI 프로세서 ]",
    mood: "l",
    lines: [
      "안녕하세요 보안관리 AI 프로세서입니다. 요원 A가 당신에게 전달한 기밀 문서입니다.",
      "열람을 원하시면 버튼을 눌러주십시오.",
    ],
  },
  {
    t: "quiz",
    mood: "n",
    badge: "STAGE 1 · 단어 해독",
    title: "다음 문장에서 공통으로 가장 많이 표현된 단어를 해독하세요.",
    body: "[보기 1]\n독도 등대(항로표지관리소)는 대한민국 영토 최동단에서 밤바다를 밝히며, 우리 영토의 실효적 지배를 상징하는 핵심 시설. 이 등대의 높이는 15M이다.\n\n[보기 2]\n울릉도 최초의 등대이며 1958년 4월에 첫 불을 밝혔다. 통칭 태하등대라고 하며 높이는 7.6M의 백색 원형 콘크리트 구조물로 약 50km 거리까지 불빛을 전달한다.",
    ph: "공통 단어 입력",
    ans: "등대",
    hint: "두 지문 모두에서 반복되는 단어",
  },
  {
    t: "result",
    lbl: "STAGE 1 CLEAR",
    ans: "등대식당",
    desc: "등대식당으로 이동하세요.\n단, 식당 안으로 들어가지 않습니다.",
  },
  { t: "stage", num: 2, title: "STAGE 2", sub: "광고판 해독" },
  {
    t: "dlg",
    ch: "agentA",
    lbl: "[ 요원 A · 도동 ]",
    mood: "n",
    lines: [
      "반갑습니다. 정식으로 인사드리죠. 요원 A입니다.",
      "여기가 그 유명한 울릉도 도동입니다. 이미 적들의 정보망이 이 골목 구석구석까지 뻗어있을 가능성이 높습니다.",
      "저는 지금부터 울릉군청 조사관을 접선해 내부 단서를 확보하겠습니다. 그사이 요원님들께 제가 사전 조사한 기밀 파일을 보냈습니다.",
      "그 파일을 해독한다면 단서를 조금이라도 찾을 수 있을것 같습니다.",
    ],
  },
  {
    t: "dlg",
    ch: "laptop",
    lbl: "[ 보안관리 AI 프로세서 ]",
    mood: "l",
    lines: [
      "요원 A가 당신에게 전달한 기밀 파일입니다. 해당 파일은 암호로 잠금이 걸려 있습니다.",
      "비밀번호를 풀어 단서를 찾길 바랍니다.",
    ],
  },
  {
    t: "quiz-m",
    mood: "n",
    badge: "STAGE 2 · 광고판 위치 해독",
    title: "해당 장소에는 아래의 숫자가 의미하는 단어가 있다.",
    body: "A. 정면   B. 노란색   C. 다리   D. 하트\n\n4 // 3 // 8\n\n→ 4개 ( ) · 3개 ( ) · 8개 ( )",
    inputs: [
      { lbl: "4개", ph: "4개", ans: "경상북도" },
      { lbl: "3개", ph: "3개", ans: "울릉군" },
      { lbl: "8개", ph: "8개", ans: "한국옥외광고협회" },
    ],
  },
  {
    t: "result",
    lbl: "STAGE 2 CLEAR",
    ans: "경상북도 · 울릉군",
    desc: "본 화면은 다음 장소의 힌트입니다.\n해당 힌트 그림을 보고 장소로 이동합니다.",
  },
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
      "시간이 없습니다! 지금 제 앞에 있는 제어 시스템에 복잡한 암호가 걸려 있습니다!",
      "지금 기계에 표시된 문제를 불러드릴 테니, 즉시 분석해서 해독 코드를 보내주십시요!",
      "독도가 완전히 사라지기 전에 서둘러야 합니다!",
    ],
  },
  {
    t: "quiz",
    mood: "u",
    badge: "⚠ STAGE 3 · 긴급 연산",
    title: "각 나라까지의 거리를 계산하여 최종 암호값을 구하시오.",
    body: "U = 울릉도  →    87.4 km\nR = 러시아  →  6,000 km\nM = 미국    → 10,500 km\nO = 오키섬  →   157.5 km\n\n( M - R ) - U - O = ?",
    ph: "정답 입력 (소수점 1자리까지 입력하세요.)",
    ans: "4255.1",
    hint: "0,000.0",
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
      "하지만 기계는 이미 과부하 상태고, 안개가 독도 전체를 집어삼키기 일보 직전이예요!",
    ],
  },
  {
    t: "dlg",
    ch: "director",
    lbl: "[ 최지수 국장 · 긴급 ]",
    mood: "u",
    lines: [
      "이제 믿을 건 당신밖에 없어요!",
      "얼른 새로운 암호 해독 코드를 분석해주세요!",
    ],
  },
  {
    t: "quiz",
    mood: "u",
    badge: "⚠ STAGE 4 · 최종 암호",
    title: "새로운 공식으로 최종 암호를 계산하시오 — 시간이 없습니다!",
    body: "U = 울릉도  →    87.4 km\nR = 러시아  →  6,000 km\nM = 미국    → 10,500 km\nO = 오키섬  →   157.5 km\n\n( M + R ) + U - O = ?",
    ph: "최종 암호 입력 (소수점 1자리까지 입력하세요.)",
    ans: "16,429.9",
    hint: "00,000.0",
  },
  { t: "success" },
];

function norm(v: string) {
  return v.replace(/,/g, "").replace(/\s/g, "").toLowerCase();
}

const BIRD_PATH_D =
  "M256.661,691.06l-18.2.553-25.165.525-28.234.549-27.83.559-46.007.215a7.519,7.519,0,0,1-5.7-2.72,8.822,8.822,0,0,1-1.016-7.226c2.33-7.446,6.27-13.963,10.291-20.67l15.15-25.27c9.667-16.124,18.9-31.9,27.712-48.524,6.724-12.7,12.44-25.23,18.5-38.277,8.624-18.557,16.82-36.815,24.053-56.017,7.87-20.891,13.65-41.951,19.424-63.427l6.129-22.793a101.409,101.409,0,0,0,2.461-11.183,226.618,226.618,0,0,1-55.12,8.068c-21.684.674-47.707-.651-68.815-5.44a156.159,156.159,0,0,1-69.376-35.763A101.931,101.931,0,0,1,14.77,339.228C1.958,317.5-1.017,296.649.278,271.73,1.459,249,9.024,223.985,19.251,203.538c10.03-20.054,21.914-38.854,37.047-55.576a350.784,350.784,0,0,1,40.424-37.956c30.813-24.8,71.14-48.885,106.493-66.82l51.678-26.218,13.35-6.853,9.95-4.268L290.643.435a6.638,6.638,0,0,1,7.338,1.837c1.321,1.809.44,4.55-.966,6.058-2.042,2.19-3.973,4.371-6.043,6.435l-6.824,6.8L266.692,37.892,229.655,72.239,206.892,93.215c-11.132,10.258-38.041,41.5-45.784,56.039,31.245-16.394,59.37-25.839,94.419-26.624,3.985-.089,7.6-.232,11.51-.028l10.209.532c34.413,1.792,72.613,15.437,96.771,40.88,23.245,24.48,36.7,57.128,42.307,90.127,3.181,18.738,5,38.384,3.954,57.264l-.641,11.556c-2.389,43.121-24.62,100.343-48.8,136.561l-36.627,54.865c-16.25,24.341-30.1,44.346-38.863,73-8.2,26.818-8.957,54.495-1.119,81.514a32.773,32.773,0,0,0,3.291,8.327,8.436,8.436,0,0,1,.553,7.126,7.763,7.763,0,0,1-5.222,3.944,151.7,151.7,0,0,1-22.875,2.2Zm43.908-417.846c-5.4-7.85-13.487-12.692-22.4-14.928a92.472,92.472,0,0,0-17.846-2.852,260.445,260.445,0,0,0-29.649,0l-18.342,1.115-10.4.561c-13.318.718-25.153.912-38.161-2.343a46.369,46.369,0,0,1-30.986-25.346,52.484,52.484,0,0,1-4.417-26.36c1.34-15.735,6.181-30.233,13.636-43.992a233.946,233.946,0,0,1,21.56-33.572c11.558-14.766,23.315-29.067,36.961-41.835l8.245-7.715,22.233-20.31,30.882-29.108-52.71,26.318c-34.686,17.319-72.289,40.187-102.9,63.9-10.43,8.079-19.659,16.779-29.281,25.883C57.35,161.215,41.9,183.549,29.8,207.707c-14.182,28.314-22.057,61.681-17.056,93.178a94.213,94.213,0,0,0,30.759,55.824,144.026,144.026,0,0,0,61.889,31.919c19.545,4.651,46,6.156,66.106,5.5,16.782-.549,33.136-2.156,49.5-6.585a171.4,171.4,0,0,0,50.822-23.264,79.28,79.28,0,0,0,30.019-37.218,71.581,71.581,0,0,0,5.215-28.244c-.127-8.856-1.163-17.86-6.486-25.6M117.515,682.2l38.635-.257,27.814-.546,27.258-.549,26.152-.532,17.982-.543,11.67-.477,8.784-.5,8.034-.494c.48-.03,1.163-.936.923-1.379-2.3-4.235-3.429-9.6-4.193-14.444-2.186-13.878-3.866-27.164-2.87-41.214a171.741,171.741,0,0,1,17.31-63.91,290.182,290.182,0,0,1,21.009-36.162l15.458-22.719,22.57-33.6C380.561,425.4,406,369.854,408.329,322.42l.676-13.775c.26-5.3.261-10.42,0-15.74l-.654-13.126c-.611-12.265-2.882-23.94-5.649-35.973a175.119,175.119,0,0,0-16.128-43.159,132.419,132.419,0,0,0-19.71-27.82C345.4,149.4,307.7,135.555,276.692,134.411l-12.353-.456c-16.791-.62-38.072,2.021-54.3,7.011-17.476,5.374-38.887,14.143-53.478,25.026a98.05,98.05,0,0,1-8.1,5.59,93.73,93.73,0,0,0-8.764,31.585c-1.88,18.081,7.116,34.65,24.932,40.075,11.423,3.478,24.381,3.277,36.331,2.587l28.713-1.656a286.357,286.357,0,0,1,31.214-.04,100.746,100.746,0,0,1,21.475,3.6,48.588,48.588,0,0,1,27.316,18.728c6.619,9.414,8.545,20.558,8.7,31.838a84.988,84.988,0,0,1-6.963,35.232c-7.341,17.357-19.486,31.25-35.322,41.489a195.411,195.411,0,0,1-36.185,18.394,52,52,0,0,1-1.416,11.123l-6.553,24.5c-6.251,23.369-12.358,46.385-20.891,69.112-11.248,29.964-38.99,90.59-55.11,117.659l-24.372,40.926-8.132,13.774c-2.237,3.79-4.711,7.36-5.919,11.691";

const MUSIC1_TRIGGER_INDEX = SCENES.findIndex(
  (item) =>
    item.t === "dlg" &&
    item.ch === "director" &&
    item.lbl === "국정원 최지수 국장" &&
    item.lines[0]?.includes("오셨군요"),
);
const MUSIC1_AUDIO_SRC = "/mp3/Quiz2/music1.mp3?v=20260420b";
const MUSIC2_TRIGGER_INDEX = SCENES.findIndex(
  (item) =>
    item.t === "dlg" &&
    item.ch === "laptop" &&
    item.lines[0].includes("안녕하세요"),
);
const MUSIC3_TRIGGER_INDEX = SCENES.findIndex(
  (item) =>
    item.t === "dlg" &&
    item.ch === "agentA" &&
    item.lbl === "[ 요원 A · 긴급 무전 ]" &&
    item.lines[0].includes("들리십니까? 요원!"),
);
const MUSIC4_TRIGGER_INDEX = SCENES.findIndex((item) => item.t === "success");
const SUCCESS_SCENE_INDEX = SCENES.findIndex((item) => item.t === "success");
const MUSIC2_AUDIO_SRC = "/mp3/Quiz2/music2.mp3?v=20260420";
const MUSIC3_AUDIO_SRC = "/mp3/Quiz2/music3.mp3?v=20260420";
const MUSIC4_AUDIO_SRC = "/mp3/Quiz2/music5.mp3?v=20260421";
const ONE_PAGE_SFX_SRC = "/mp3/Quiz2/1.mp3?v=20260420";
const KEYBO_SFX_SRC = "/mp3/Quiz2/keybo.mp3?v=20260420";
const HORN_SFX_SRC = "/mp3/Quiz2/horn.mp3?v=20260420";
const TALKIE_SFX_SRC = "/mp3/Quiz2/Talkie2.mp3?v=20260420";
const AI_SFX_SRC = "/mp3/Quiz2/ai.mp3?v=20260420";
const DATA_SFX_SRC = "/mp3/Quiz2/data.mp3?v=20260420";
const STAGE_SFX_SRC = "/mp3/Quiz2/STAGE.mp3?v=20260420";
const DIALOGUE_NEXT_DELAY_MS = 3000;
const ATMO_NEXT_DELAY_MS = 5000;

function getInitialSceneIndex() {
  const clamp = (n: number) => Math.max(0, Math.min(SCENES.length - 1, n));
  if (typeof window === "undefined") return 0;

  const params = new URLSearchParams(window.location.search);
  const sceneParam = params.get("scene");

  if (sceneParam === "last" || sceneParam === "success") {
    return clamp(SUCCESS_SCENE_INDEX >= 0 ? SUCCESS_SCENE_INDEX : SCENES.length - 1);
  }

  if (sceneParam != null) {
    const parsed = Number(sceneParam);
    if (Number.isFinite(parsed)) return clamp(parsed);
  }

  return 0;
}

export default function Quiz2Game() {
  const [cur, setCur] = useState(getInitialSceneIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [atmoTypedText, setAtmoTypedText] = useState("");
  const [isAtmoTyping, setIsAtmoTyping] = useState(false);
  const [harborAnimOn, setHarborAnimOn] = useState(false);
  const [urgentCalcAnimOn, setUrgentCalcAnimOn] = useState(false);
  const [stage4RemainingSec, setStage4RemainingSec] = useState<number>(300);
  const [rippleRings, setRippleRings] = useState<number[]>([]);
  const [singleInput, setSingleInput] = useState("");
  const [singlePlaceholder, setSinglePlaceholder] = useState("");
  const [multiInputs, setMultiInputs] = useState<string[]>([]);
  const [singleError, setSingleError] = useState(false);
  const [multiErrors, setMultiErrors] = useState<boolean[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [introIconVisible, setIntroIconVisible] = useState(false);
  const [introTypedText, setIntroTypedText] = useState("");
  const [introTypingDone, setIntroTypingDone] = useState(false);
  const [introMetaVisible, setIntroMetaVisible] = useState(false);

  const rainRef = useRef<HTMLCanvasElement>(null);
  const boltRef = useRef<HTMLCanvasElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const signalNoiseRef = useRef<HTMLCanvasElement>(null);
  const typeTimerRef = useRef<number | null>(null);
  const atmoTypeTimerRef = useRef<number | null>(null);
  const dialogueRafRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const introTimersRef = useRef<number[]>([]);

  const signalRainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signalCountRafRef = useRef<number | null>(null);
  const signalTimersRef = useRef<number[]>([]);
  const harborWrapRef = useRef<HTMLDivElement | null>(null);
  const harborFlashIntervalRef = useRef<number | null>(null);
  const stageRainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageTimersRef = useRef<number[]>([]);
  const stage4TimerRef = useRef<number | null>(null);
  const successRainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const successParticleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const successFlashRef = useRef<HTMLDivElement | null>(null);
  const successRainRafRef = useRef<number | null>(null);
  const successParticleRafRef = useRef<number | null>(null);
  const transitionLockRef = useRef(false);

  const scene = SCENES[cur];
  const isIntroStage = scene.t === "stage" && scene.num === 0;

  const [signalResultOn, setSignalResultOn] = useState(false);
  const [signalDistanceDisplay, setSignalDistanceDisplay] = useState("0.0");
  const [signalLightningOpacity, setSignalLightningOpacity] = useState(0);
  const [stageFxOn, setStageFxOn] = useState(false);
  const [stageLightningOpacity, setStageLightningOpacity] = useState(0);
  const [music1On, setMusic1On] = useState(false);
  const [music2On, setMusic2On] = useState(false);
  const [music3On, setMusic3On] = useState(false);
  const [music4On, setMusic4On] = useState(false);
  const [dialogueNextReady, setDialogueNextReady] = useState(true);
  const [atmoNextReady, setAtmoNextReady] = useState(true);
  const music1Ref = useRef<HTMLAudioElement | null>(null);
  const music2Ref = useRef<HTMLAudioElement | null>(null);
  const music3Ref = useRef<HTMLAudioElement | null>(null);
  const music4Ref = useRef<HTMLAudioElement | null>(null);
  const onePageSfxRef = useRef<HTMLAudioElement | null>(null);
  const keyboSfxRef = useRef<HTMLAudioElement | null>(null);
  const hornSfxRef = useRef<HTMLAudioElement | null>(null);
  const talkieSfxRef = useRef<HTMLAudioElement | null>(null);
  const aiSfxRef = useRef<HTMLAudioElement | null>(null);
  const dataSfxRef = useRef<HTMLAudioElement | null>(null);
  const stageSfxRef = useRef<HTMLAudioElement | null>(null);
  const playedStageSfxRef = useRef<Set<number>>(new Set());
  const pendingStageSfxRef = useRef<number | null>(null);
  const dialogueNextDelayTimerRef = useRef<number | null>(null);
  const atmoNextDelayTimerRef = useRef<number | null>(null);

  const signalDistanceTarget = useMemo(() => {
    if (scene.t !== "result" || scene.lbl !== "SIGNAL CONFIRMED") return null;
    const m = scene.ans.match(/(\d+(?:\.\d+)?)/);
    return m ? Number(m[1]) : null;
  }, [scene]);

  useEffect(() => {
    document.title = "미션 2: 새벽을 여는 독도";
    return () => {
      document.title = "Office of Education Program";
    };
  }, []);

  useEffect(() => {
    const owner = "quiz2-game-intro";
    if (isIntroStage) enableIntroAudio(owner);
    else disableIntroAudio(owner);
    return () => {
      disableIntroAudio(owner);
    };
  }, [isIntroStage]);

  useEffect(() => {
    const unlockAudio = () => {
      if (isIntroStage) retryIntroAudioPlayback();
      const pendingStageNum = pendingStageSfxRef.current;
      const isPendingStagePage =
        pendingStageNum != null &&
        scene.t === "stage" &&
        scene.num === pendingStageNum;
      if (isPendingStagePage) {
        if (!stageSfxRef.current) {
          stageSfxRef.current = new Audio(STAGE_SFX_SRC);
          stageSfxRef.current.loop = false;
        }
        const stageSfx = stageSfxRef.current;
        stageSfx.currentTime = 0;
        void stageSfx
          .play()
          .then(() => {
            if (pendingStageSfxRef.current != null) {
              playedStageSfxRef.current.add(pendingStageSfxRef.current);
            }
            pendingStageSfxRef.current = null;
          })
          .catch(() => {
            // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
          });
      }
      if (music1On && music1Ref.current) void music1Ref.current.play().catch(() => { });
      if (music2On && music2Ref.current) void music2Ref.current.play().catch(() => { });
      if (music3On && music3Ref.current) void music3Ref.current.play().catch(() => { });
      if (music4On && music4Ref.current) void music4Ref.current.play().catch(() => { });
    };

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, [isIntroStage, music1On, music2On, music3On, music4On, scene]);

  useEffect(() => {
    const shouldPlayMusic1 =
      MUSIC1_TRIGGER_INDEX >= 0 &&
      cur >= MUSIC1_TRIGGER_INDEX &&
      (MUSIC2_TRIGGER_INDEX < 0 || cur < MUSIC2_TRIGGER_INDEX);
    const shouldPlayMusic2 =
      MUSIC2_TRIGGER_INDEX >= 0 &&
      cur >= MUSIC2_TRIGGER_INDEX &&
      (MUSIC3_TRIGGER_INDEX < 0 || cur < MUSIC3_TRIGGER_INDEX);
    const shouldPlayMusic3 =
      MUSIC3_TRIGGER_INDEX >= 0 &&
      cur >= MUSIC3_TRIGGER_INDEX &&
      (MUSIC4_TRIGGER_INDEX < 0 || cur < MUSIC4_TRIGGER_INDEX);
    const shouldPlayMusic4 =
      MUSIC4_TRIGGER_INDEX >= 0 && cur >= MUSIC4_TRIGGER_INDEX;
    setMusic1On(shouldPlayMusic1);
    setMusic2On(shouldPlayMusic2);
    setMusic3On(shouldPlayMusic3);
    setMusic4On(shouldPlayMusic4);
  }, [cur]);

  useEffect(() => {
    if (!music1Ref.current) {
      music1Ref.current = new Audio(MUSIC1_AUDIO_SRC);
      music1Ref.current.loop = true;
    }
    const music1 = music1Ref.current;
    if (music1On) {
      void music1.play().catch(() => {
        // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
      });
      return;
    }
    music1.pause();
    music1.currentTime = 0;
  }, [music1On]);

  useEffect(() => {
    if (!music2Ref.current) {
      music2Ref.current = new Audio(MUSIC2_AUDIO_SRC);
      music2Ref.current.loop = true;
    }
    const music2 = music2Ref.current;
    if (music2On) {
      void music2.play().catch(() => {
        // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
      });
      return;
    }
    music2.pause();
    music2.currentTime = 0;
  }, [music2On]);

  useEffect(() => {
    if (!music3Ref.current) {
      music3Ref.current = new Audio(MUSIC3_AUDIO_SRC);
      music3Ref.current.loop = true;
    }
    const music3 = music3Ref.current;
    if (music3On) {
      void music3.play().catch(() => {
        // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
      });
      return;
    }
    music3.pause();
    music3.currentTime = 0;
  }, [music3On]);

  useEffect(() => {
    if (!music4Ref.current) {
      music4Ref.current = new Audio(MUSIC4_AUDIO_SRC);
      music4Ref.current.loop = true;
    }
    const music4 = music4Ref.current;
    if (music4On) {
      void music4.play().catch(() => {
        // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
      });
      return;
    }
    music4.pause();
    music4.currentTime = 0;
  }, [music4On]);

  useEffect(() => {
    if (!onePageSfxRef.current) {
      onePageSfxRef.current = new Audio(ONE_PAGE_SFX_SRC);
      onePageSfxRef.current.loop = false;
    }
    const onePageSfx = onePageSfxRef.current;
    const isOnTargetPage =
      MUSIC1_TRIGGER_INDEX >= 0 && cur === MUSIC1_TRIGGER_INDEX;
    if (isOnTargetPage) {
      onePageSfx.currentTime = 0;
      void onePageSfx.play().catch(() => {
        // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
      });
      return;
    }
    onePageSfx.pause();
    onePageSfx.currentTime = 0;
  }, [cur]);

  useEffect(() => {
    if (!keyboSfxRef.current) {
      keyboSfxRef.current = new Audio(KEYBO_SFX_SRC);
      keyboSfxRef.current.loop = false;
    }

    const isAfterFirstDirectorPage =
      MUSIC1_TRIGGER_INDEX >= 0 &&
      (cur > MUSIC1_TRIGGER_INDEX ||
        (cur === MUSIC1_TRIGGER_INDEX && lineIdx > 0));
    const isTargetDialoguePage = scene.t === "dlg" && scene.ch === "director";
    if (!isAfterFirstDirectorPage || !isTargetDialoguePage) return;

    const keyboSfx = keyboSfxRef.current;
    keyboSfx.currentTime = 0;
    void keyboSfx.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
  }, [cur, lineIdx, scene.t, scene.t === "dlg" ? scene.ch : ""]);

  useEffect(() => {
    if (!talkieSfxRef.current) {
      talkieSfxRef.current = new Audio(TALKIE_SFX_SRC);
      talkieSfxRef.current.loop = false;
    }

    const isAfterFirstDirectorPage =
      MUSIC1_TRIGGER_INDEX >= 0 &&
      (cur > MUSIC1_TRIGGER_INDEX ||
        (cur === MUSIC1_TRIGGER_INDEX && lineIdx > 0));
    const isAgentADialoguePage = scene.t === "dlg" && scene.ch === "agentA";
    if (!isAfterFirstDirectorPage || !isAgentADialoguePage) return;

    const talkieSfx = talkieSfxRef.current;
    talkieSfx.currentTime = 0;
    void talkieSfx.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
  }, [cur, lineIdx, scene.t, scene.t === "dlg" ? scene.ch : ""]);

  useEffect(() => {
    if (!aiSfxRef.current) {
      aiSfxRef.current = new Audio(AI_SFX_SRC);
      aiSfxRef.current.loop = false;
    }

    const isAfterFirstDirectorPage =
      MUSIC1_TRIGGER_INDEX >= 0 &&
      (cur > MUSIC1_TRIGGER_INDEX ||
        (cur === MUSIC1_TRIGGER_INDEX && lineIdx > 0));
    const isLaptopDialoguePage = scene.t === "dlg" && scene.ch === "laptop";
    if (!isAfterFirstDirectorPage || !isLaptopDialoguePage) return;

    const aiSfx = aiSfxRef.current;
    aiSfx.currentTime = 0;
    void aiSfx.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
  }, [cur, lineIdx, scene.t, scene.t === "dlg" ? scene.ch : ""]);

  useEffect(() => {
    if (!hornSfxRef.current) {
      hornSfxRef.current = new Audio(HORN_SFX_SRC);
      hornSfxRef.current.loop = false;
    }
    const isTargetAtmoPage =
      scene.t === "atmo" && scene.lbl === "울릉도로 이동 중";
    if (!isTargetAtmoPage) return;

    const hornSfx = hornSfxRef.current;
    hornSfx.currentTime = 0;
    void hornSfx.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
  }, [cur]);

  useEffect(() => {
    if (!dataSfxRef.current) {
      dataSfxRef.current = new Audio(DATA_SFX_SRC);
      dataSfxRef.current.loop = false;
    }

    const isSignalConfirmedPage =
      scene.t === "result" && scene.lbl === "SIGNAL CONFIRMED";
    if (!isSignalConfirmedPage) return;

    const dataSfx = dataSfxRef.current;
    dataSfx.currentTime = 0;
    void dataSfx.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
  }, [cur]);

  useEffect(() => {
    if (scene.t !== "stage") return;
    const stageNum = scene.num;
    if (stageNum < 1 || stageNum > 4) return;
    if (playedStageSfxRef.current.has(stageNum)) return;

    if (!stageSfxRef.current) {
      stageSfxRef.current = new Audio(STAGE_SFX_SRC);
      stageSfxRef.current.loop = false;
    }
    const stageSfx = stageSfxRef.current;
    stageSfx.currentTime = 0;
    void stageSfx
      .play()
      .then(() => {
        playedStageSfxRef.current.add(stageNum);
        if (pendingStageSfxRef.current === stageNum) {
          pendingStageSfxRef.current = null;
        }
      })
      .catch(() => {
        pendingStageSfxRef.current = stageNum;
      });
  }, [scene]);

  useEffect(() => {
    return () => {
      if (!music1Ref.current) return;
      music1Ref.current.pause();
      music1Ref.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!music2Ref.current) return;
      music2Ref.current.pause();
      music2Ref.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!music3Ref.current) return;
      music3Ref.current.pause();
      music3Ref.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!music4Ref.current) return;
      music4Ref.current.pause();
      music4Ref.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!onePageSfxRef.current) return;
      onePageSfxRef.current.pause();
      onePageSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!keyboSfxRef.current) return;
      keyboSfxRef.current.pause();
      keyboSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!hornSfxRef.current) return;
      hornSfxRef.current.pause();
      hornSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!talkieSfxRef.current) return;
      talkieSfxRef.current.pause();
      talkieSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!aiSfxRef.current) return;
      aiSfxRef.current.pause();
      aiSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!dataSfxRef.current) return;
      dataSfxRef.current.pause();
      dataSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (!stageSfxRef.current) return;
      stageSfxRef.current.pause();
      stageSfxRef.current.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (dialogueNextDelayTimerRef.current) {
      window.clearTimeout(dialogueNextDelayTimerRef.current);
      dialogueNextDelayTimerRef.current = null;
    }

    const shouldDelayNext =
      scene.t === "dlg" &&
      MUSIC1_TRIGGER_INDEX >= 0 &&
      cur >= MUSIC1_TRIGGER_INDEX;

    if (!shouldDelayNext) {
      setDialogueNextReady(true);
      return;
    }

    if (isTyping) {
      setDialogueNextReady(false);
      return;
    }

    setDialogueNextReady(false);
    dialogueNextDelayTimerRef.current = window.setTimeout(() => {
      setDialogueNextReady(true);
      dialogueNextDelayTimerRef.current = null;
    }, DIALOGUE_NEXT_DELAY_MS);

    return () => {
      if (dialogueNextDelayTimerRef.current) {
        window.clearTimeout(dialogueNextDelayTimerRef.current);
        dialogueNextDelayTimerRef.current = null;
      }
    };
  }, [cur, lineIdx, isTyping, scene.t]);

  useEffect(() => {
    if (atmoNextDelayTimerRef.current) {
      window.clearTimeout(atmoNextDelayTimerRef.current);
      atmoNextDelayTimerRef.current = null;
    }

    const shouldDelayAtmoNext =
      scene.t === "atmo" && scene.lbl === "울릉도로 이동 중";
    if (!shouldDelayAtmoNext) {
      setAtmoNextReady(true);
      return;
    }

    setAtmoNextReady(false);
    atmoNextDelayTimerRef.current = window.setTimeout(() => {
      setAtmoNextReady(true);
      atmoNextDelayTimerRef.current = null;
    }, ATMO_NEXT_DELAY_MS);

    return () => {
      if (atmoNextDelayTimerRef.current) {
        window.clearTimeout(atmoNextDelayTimerRef.current);
        atmoNextDelayTimerRef.current = null;
      }
    };
  }, [cur, scene.t, scene.t === "atmo" ? scene.lbl : ""]);

  useEffect(() => {
    // SIGNAL CONFIRMED result-specific animations (count up + staged reveal + lightning flash)
    signalTimersRef.current.forEach((t) => window.clearTimeout(t));
    signalTimersRef.current = [];
    if (signalCountRafRef.current != null) {
      cancelAnimationFrame(signalCountRafRef.current);
      signalCountRafRef.current = null;
    }

    if (scene.t !== "result" || scene.lbl !== "SIGNAL CONFIRMED") {
      setSignalResultOn(false);
      setSignalDistanceDisplay("0.0");
      setSignalLightningOpacity(0);
      return;
    }

    setSignalResultOn(false);
    setSignalDistanceDisplay("0.0");
    setSignalLightningOpacity(0);

    const tShow = window.setTimeout(() => setSignalResultOn(true), 80);
    signalTimersRef.current.push(tShow);

    const tCount = window.setTimeout(() => {
      const target = signalDistanceTarget ?? 0;
      const durationMs = 1200;
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min((now - start) / durationMs, 1);
        const ease = 1 - Math.pow(1 - p, 4);
        const v = target * ease;
        setSignalDistanceDisplay(v.toFixed(1));
        if (p < 1) signalCountRafRef.current = requestAnimationFrame(step);
      };
      signalCountRafRef.current = requestAnimationFrame(step);
    }, 600);
    signalTimersRef.current.push(tCount);

    let cancelled = false;
    const scheduleLightning = () => {
      if (cancelled) return;
      const nextDelay = Math.random() * 7000 + 4000;
      const tNext = window.setTimeout(() => {
        if (cancelled) return;
        const base = Math.random() * 0.04 + 0.01;
        setSignalLightningOpacity(base);
        const tOff = window.setTimeout(() => {
          setSignalLightningOpacity(0);
          if (Math.random() > 0.5) {
            const tDouble = window.setTimeout(() => {
              setSignalLightningOpacity(Math.random() * 0.03);
              const tDoubleOff = window.setTimeout(
                () => setSignalLightningOpacity(0),
                50,
              );
              signalTimersRef.current.push(tDoubleOff);
            }, 100);
            signalTimersRef.current.push(tDouble);
          }
        }, 60);
        signalTimersRef.current.push(tOff);
        scheduleLightning();
      }, nextDelay);
      signalTimersRef.current.push(tNext);
    };
    scheduleLightning();

    return () => {
      cancelled = true;
      signalTimersRef.current.forEach((t) => window.clearTimeout(t));
      signalTimersRef.current = [];
      if (signalCountRafRef.current != null) {
        cancelAnimationFrame(signalCountRafRef.current);
        signalCountRafRef.current = null;
      }
    };
  }, [scene, signalDistanceTarget]);

  useEffect(() => {
    stageTimersRef.current.forEach((t) => window.clearTimeout(t));
    stageTimersRef.current = [];
    setStageFxOn(false);
    setStageLightningOpacity(0);

    if (scene.t !== "stage" || scene.num === 0) return;

    const tOn = window.setTimeout(() => setStageFxOn(true), 150);
    stageTimersRef.current.push(tOn);

    let cancelled = false;
    const scheduleLightning = () => {
      if (cancelled) return;
      const nextDelay = Math.random() * 8000 + 5000;
      const tNext = window.setTimeout(() => {
        if (cancelled) return;
        const base = Math.random() * 0.035 + 0.008;
        setStageLightningOpacity(base);
        const tOff = window.setTimeout(() => {
          setStageLightningOpacity(0);
          if (Math.random() > 0.5) {
            const tDouble = window.setTimeout(() => {
              setStageLightningOpacity(Math.random() * 0.025);
              const tDoubleOff = window.setTimeout(
                () => setStageLightningOpacity(0),
                45,
              );
              stageTimersRef.current.push(tDoubleOff);
            }, 90);
            stageTimersRef.current.push(tDouble);
          }
        }, 55);
        stageTimersRef.current.push(tOff);
        scheduleLightning();
      }, nextDelay);
      stageTimersRef.current.push(tNext);
    };
    scheduleLightning();

    return () => {
      cancelled = true;
      stageTimersRef.current.forEach((t) => window.clearTimeout(t));
      stageTimersRef.current = [];
    };
  }, [scene]);

  useEffect(() => {
    if (scene.t !== "stage" || scene.num === 0) return;
    const canvas = stageRainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drops: {
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
    }[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      drops = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 16 + 7,
        speed: Math.random() * 4 + 3,
        alpha: Math.random() * 0.18 + 0.04,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        ctx.save();
        ctx.strokeStyle = `rgba(140,210,255,${d.alpha})`;
        ctx.lineWidth = 0.65;
        ctx.translate(d.x, d.y);
        ctx.rotate(0.17);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, d.len);
        ctx.stroke();
        ctx.restore();

        d.y += d.speed;
        d.x -= d.speed * 0.17;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
        if (d.x < 0) d.x = canvas.width;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [scene]);

  useEffect(() => {
    if (scene.t !== "result" || scene.lbl !== "SIGNAL CONFIRMED") return;
    const canvas = signalRainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let drops: {
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
    }[] = [];

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      drops = Array.from({ length: 110 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        len: Math.random() * 16 + 7,
        speed: Math.random() * 4 + 3,
        alpha: Math.random() * 0.2 + 0.05,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of drops) {
        ctx.save();
        ctx.strokeStyle = `rgba(140,210,255,${d.alpha})`;
        ctx.lineWidth = 0.7;
        ctx.translate(d.x, d.y);
        ctx.rotate(0.18);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, d.len);
        ctx.stroke();
        ctx.restore();

        d.y += d.speed;
        d.x -= d.speed * 0.18;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
        if (d.x < 0) d.x = canvas.width;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, [scene]);

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

    const bolt = (
      x: number,
      y: number,
      a: number,
      len: number,
      dep: number,
    ) => {
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
        bolt(
          x + (ex - x) * tt,
          y + (ey - y) * tt,
          a + (Math.random() - 0.5) * 1.1,
          len * (Math.random() * 0.35 + 0.28),
          dep + 1,
        );
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
          bolt(
            sx + (Math.random() - 0.5) * 85,
            0,
            ang + (Math.random() - 0.5) * 0.3,
            h * 0.44,
            0,
          );
          setTimeout(() => bx.clearRect(0, 0, w, h), 200);
        }, 125);
      }
    };

    const schedule = () => {
      lightningTimer = setTimeout(
        () => {
          strike();
          schedule();
        },
        Math.random() * 2200 + 900,
      );
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
    const isAgentA = scene.t === "dlg" && scene.ch === "agentA";
    if (!isAgentA) {
      setRippleRings([]);
      return;
    }

    const addRipple = () => {
      const id = Date.now() + Math.random();
      setRippleRings((prev) => [...prev, id]);
      window.setTimeout(() => {
        setRippleRings((prev) => prev.filter((v) => v !== id));
      }, 2200);
    };

    addRipple();
    const intervalId = window.setInterval(addRipple, 380);
    return () => window.clearInterval(intervalId);
  }, [scene.t, scene.t === "dlg" ? scene.ch : "", cur]);

  useEffect(() => {
    if (scene.t !== "dlg") return;
    if (dialogueRafRef.current != null) {
      cancelAnimationFrame(dialogueRafRef.current);
      dialogueRafRef.current = null;
    }
    const line = scene.lines[lineIdx] ?? "";
    setTypedText("");
    setIsTyping(true);

    if (scene.ch === "laptop") {
      let frame = 0;
      const step = () => {
        const progress = frame / LAPTOP_GLITCH_TOTAL_FRAMES;
        const out = line
          .split("")
          .map((ch, i) => {
            if (ch === " ") return " ";
            if (progress > i / Math.max(1, line.length)) return ch;
            return LAPTOP_GLITCH_CHARS[
              Math.floor(Math.random() * LAPTOP_GLITCH_CHARS.length)
            ];
          })
          .join("");
        setTypedText(out);

        if (frame < LAPTOP_GLITCH_TOTAL_FRAMES) {
          frame += 1;
          dialogueRafRef.current = requestAnimationFrame(step);
        } else {
          setTypedText(line);
          setIsTyping(false);
          dialogueRafRef.current = null;
        }
      };
      dialogueRafRef.current = requestAnimationFrame(step);
      return () => {
        if (dialogueRafRef.current != null) {
          cancelAnimationFrame(dialogueRafRef.current);
          dialogueRafRef.current = null;
        }
      };
    }

    let i = 0;
    const type = () => {
      if (i < line.length) {
        const ch = line[i];
        i += 1;
        setTypedText((prev) => prev + ch);
        const d =
          ch === "." || ch === "!" || ch === "?"
            ? 68
            : ch === ","
              ? 42
              : ch === " "
                ? 30
                : 48 + (Math.random() - 0.5) * 16;
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

  useEffect(() => {
    if (atmoTypeTimerRef.current) window.clearTimeout(atmoTypeTimerRef.current);
    setAtmoTypedText("");
    setIsAtmoTyping(false);

    if (scene.t !== "atmo") return;
    const text = scene.desc ?? "";
    setIsAtmoTyping(true);
    let i = 0;
    const typeWriter = () => {
      if (i < text.length) {
        const ch = text[i];
        i += 1;
        setAtmoTypedText((prev) => prev + ch);
        atmoTypeTimerRef.current = window.setTimeout(typeWriter, 75);
      } else {
        setIsAtmoTyping(false);
      }
    };
    typeWriter();
    return () => {
      if (atmoTypeTimerRef.current)
        window.clearTimeout(atmoTypeTimerRef.current);
    };
  }, [scene]);

  useEffect(() => {
    setUrgentCalcAnimOn(false);
    if (scene.t !== "quiz" || scene.badge !== "⚠ STAGE 3 · 긴급 연산") return;
    const t = window.setTimeout(() => setUrgentCalcAnimOn(true), 120);
    return () => window.clearTimeout(t);
  }, [scene]);

  useEffect(() => {
    if (stage4TimerRef.current) {
      window.clearInterval(stage4TimerRef.current);
      stage4TimerRef.current = null;
    }
    if (scene.t !== "quiz" || scene.badge !== "⚠ STAGE 4 · 최종 암호") return;

    setStage4RemainingSec(300);
    stage4TimerRef.current = window.setInterval(() => {
      setStage4RemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (stage4TimerRef.current) {
        window.clearInterval(stage4TimerRef.current);
        stage4TimerRef.current = null;
      }
    };
  }, [scene]);

  useEffect(() => {
    if (harborFlashIntervalRef.current) {
      window.clearInterval(harborFlashIntervalRef.current);
      harborFlashIntervalRef.current = null;
    }
    setHarborAnimOn(false);

    const isHarborQuiz =
      scene.t === "quiz" &&
      (scene.badge === "3급 기밀 절차 · 항구 거리 계산" ||
        scene.badge === "STAGE 1 · 단어 해독");
    if (!isHarborQuiz) return;

    // Stagger entrance trigger (purely via CSS transitions)
    const t = window.setTimeout(() => setHarborAnimOn(true), 80);

    // Variable glitch flash (random highlight letters)
    harborFlashIntervalRef.current = window.setInterval(() => {
      const root = harborWrapRef.current;
      if (!root) return;
      const vars = Array.from(root.querySelectorAll(".q2-harbor-hl"));
      if (vars.length === 0) return;
      const target = vars[
        Math.floor(Math.random() * vars.length)
      ] as HTMLElement;
      target.classList.add("q2-harbor-hl-flash");
      window.setTimeout(
        () => target.classList.remove("q2-harbor-hl-flash"),
        90,
      );
    }, 1800);

    return () => {
      window.clearTimeout(t);
      if (harborFlashIntervalRef.current) {
        window.clearInterval(harborFlashIntervalRef.current);
        harborFlashIntervalRef.current = null;
      }
    };
  }, [scene]);

  useEffect(() => {
    if (scene.t !== "dlg") return;
    const canvas = signalNoiseRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let phase = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      const w = canvas.clientWidth || 320;
      const h = canvas.clientHeight || 56;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawNoise = () => {
      const w = canvas.clientWidth || 320;
      const h = canvas.clientHeight || 56;
      ctx.clearRect(0, 0, w, h);

      phase += 1;
      const doGlitch = phase % 82 < 7;
      if (doGlitch) {
        const slices = Math.floor(Math.random() * 7) + 4;
        for (let s = 0; s < slices; s += 1) {
          const sy = Math.floor(Math.random() * h);
          const sh = Math.floor(Math.random() * 4) + 1;
          const shift = Math.floor(Math.random() * 26) - 13;
          const alpha = 0.1 + Math.random() * 0.22;

          ctx.save();
          ctx.globalCompositeOperation = "screen";
          ctx.translate(shift, 0);
          ctx.fillStyle = `rgba(90, 200, 180, ${alpha})`;
          ctx.fillRect(0, sy, w, sh);
          if (Math.random() > 0.55) {
            ctx.fillStyle = `rgba(224, 85, 85, ${alpha * 0.9})`;
            ctx.fillRect(0, sy, w, 1);
          }
          ctx.restore();
        }
      }
      rafId = requestAnimationFrame(drawNoise);
    };

    resize();
    window.addEventListener("resize", resize);
    rafId = requestAnimationFrame(drawNoise);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [scene.t, cur]);

  useEffect(() => {
    if (successRainRafRef.current != null) {
      cancelAnimationFrame(successRainRafRef.current);
      successRainRafRef.current = null;
    }
    if (successParticleRafRef.current != null) {
      cancelAnimationFrame(successParticleRafRef.current);
      successParticleRafRef.current = null;
    }

    const rc = successRainCanvasRef.current;
    const pc = successParticleCanvasRef.current;
    const fl = successFlashRef.current;
    if (!rc || !pc || !fl || scene.t !== "success") return;
    const cx = rc.getContext("2d");
    const px = pc.getContext("2d");
    if (!cx || !px) return;

    type Drop = { x: number; y: number; len: number; speed: number; alpha: number };
    type Pt = { x: number; y: number; r: number; alpha: number; life: number };
    let drops: Drop[] = [];
    let pts: Pt[] = [];
    let width = 0;
    let height = 0;
    let flashTimers: number[] = [];

    const resize = () => {
      width = rc.clientWidth || rc.parentElement?.clientWidth || 480;
      height = rc.clientHeight || rc.parentElement?.clientHeight || 720;
      rc.width = width;
      rc.height = height;
      pc.width = width;
      pc.height = height;
      drops = Array.from({ length: 120 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        len: Math.random() * 14 + 6,
        speed: Math.random() * 4 + 3,
        alpha: Math.random() * 0.16 + 0.04,
      }));
      pts = Array.from({ length: 36 }, () => ({
        x: width * 0.2 + Math.random() * width * 0.6,
        y: height * 0.47 + Math.random() * 55,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.38 + 0.15,
        life: Math.random(),
      }));
    };

    const drawRain = () => {
      cx.clearRect(0, 0, width, height);
      drops.forEach((d) => {
        cx.save();
        cx.strokeStyle = `rgba(140,210,255,${d.alpha})`;
        cx.lineWidth = 0.65;
        cx.translate(d.x, d.y);
        cx.rotate(0.17);
        cx.beginPath();
        cx.moveTo(0, 0);
        cx.lineTo(0, d.len);
        cx.stroke();
        cx.restore();
        d.y += d.speed;
        d.x -= d.speed * 0.17;
        if (d.y > height) {
          d.y = -d.len;
          d.x = Math.random() * width;
        }
        if (d.x < 0) d.x = width;
      });
      successRainRafRef.current = requestAnimationFrame(drawRain);
    };

    const drawPts = () => {
      px.clearRect(0, 0, width, height);
      pts.forEach((p) => {
        p.life += 0.0045;
        if (p.life > 1) {
          p.x = width * 0.2 + Math.random() * width * 0.6;
          p.y = height * 0.47 + Math.random() * 55;
          p.life = 0;
        }
        const pl = Math.sin(p.life * Math.PI);
        px.save();
        px.globalAlpha = pl * p.alpha;
        px.fillStyle = "#5af0c4";
        px.shadowBlur = 6;
        px.shadowColor = "#5af0c4";
        px.beginPath();
        px.arc(p.x + Math.sin(p.life * 5) * 3, p.y - p.life * height * 0.48, p.r, 0, Math.PI * 2);
        px.fill();
        px.restore();
      });
      successParticleRafRef.current = requestAnimationFrame(drawPts);
    };

    const flashLoop = () => {
      fl.style.opacity = (Math.random() * 0.032 + 0.007).toString();
      const tOff = window.setTimeout(() => {
        fl.style.opacity = "0";
        if (Math.random() > 0.5) {
          const tSecond = window.setTimeout(() => {
            fl.style.opacity = (Math.random() * 0.018).toString();
            const tSecondOff = window.setTimeout(() => {
              fl.style.opacity = "0";
            }, 48);
            flashTimers.push(tSecondOff);
          }, 95);
          flashTimers.push(tSecond);
        }
      }, 58);
      const tNext = window.setTimeout(flashLoop, Math.random() * 9000 + 6000);
      flashTimers.push(tOff, tNext);
    };

    resize();
    window.addEventListener("resize", resize);
    successRainRafRef.current = requestAnimationFrame(drawRain);
    const startPtsTimer = window.setTimeout(() => {
      successParticleRafRef.current = requestAnimationFrame(drawPts);
    }, 1100);
    flashTimers.push(startPtsTimer);
    flashLoop();

    return () => {
      if (successRainRafRef.current != null) {
        cancelAnimationFrame(successRainRafRef.current);
        successRainRafRef.current = null;
      }
      if (successParticleRafRef.current != null) {
        cancelAnimationFrame(successParticleRafRef.current);
        successParticleRafRef.current = null;
      }
      flashTimers.forEach((timer) => window.clearTimeout(timer));
      flashTimers = [];
      fl.style.opacity = "0";
      window.removeEventListener("resize", resize);
    };
  }, [scene.t]);

  useEffect(() => {
    introTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    introTimersRef.current = [];
    setIntroIconVisible(false);
    setIntroTypedText("");
    setIntroTypingDone(false);
    setIntroMetaVisible(false);

    if (!isIntroStage) return;

    const addIntroTimer = (timerId: number) => {
      introTimersRef.current.push(timerId);
      return timerId;
    };

    addIntroTimer(
      window.setTimeout(() => {
        setIntroIconVisible(true);
      }, 400),
    );

    const typeChar = (idx: number) => {
      if (idx >= INTRO_FULL_TEXT.length) {
        setIntroTypingDone(true);
        addIntroTimer(
          window.setTimeout(() => {
            setIntroMetaVisible(true);
          }, 500),
        );
        return;
      }
      const ch = INTRO_FULL_TEXT[idx];
      setIntroTypedText((prev) => prev + ch);
      const delay = ch === "\n" ? 300 : Math.random() * 60 + 40;
      addIntroTimer(
        window.setTimeout(() => {
          typeChar(idx + 1);
        }, delay),
      );
    };

    addIntroTimer(
      window.setTimeout(() => {
        typeChar(0);
      }, 1200),
    );

    return () => {
      introTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      introTimersRef.current = [];
    };
  }, [isIntroStage]);

  const progressDots = useMemo(() => {
    return QUIZ_CHECKPOINTS.map((si) =>
      cur > si ? "done" : cur >= si ? "now" : "",
    );
  }, [cur]);

  const changeScene = (updater: (prev: number) => number) => {
    if (transitionLockRef.current) return;
    transitionLockRef.current = true;
    setIsTransitioning(true);
    window.setTimeout(() => {
      setCur((prev) => {
        const next = updater(prev);
        return Math.max(0, Math.min(SCENES.length - 1, next));
      });
      setIsTransitioning(false);
      transitionLockRef.current = false;
    }, 320);
  };

  const adv = () => changeScene((prev) => prev + 1);
  const goBack = () => changeScene((prev) => prev - 1);
  const onHomeClick = () => {
    setMusic1On(false);
    setMusic2On(false);
    setMusic3On(false);
    setMusic4On(false);
  };

  const nextLine = () => {
    if (scene.t !== "dlg") return;
    if (isTyping) {
      if (typeTimerRef.current) window.clearTimeout(typeTimerRef.current);
      setTypedText(scene.lines[lineIdx]);
      setIsTyping(false);
      return;
    }
    if (
      MUSIC1_TRIGGER_INDEX >= 0 &&
      cur >= MUSIC1_TRIGGER_INDEX &&
      !dialogueNextReady
    ) {
      return;
    }
    if (lineIdx < scene.lines.length - 1) setLineIdx((prev) => prev + 1);
    else adv();
  };

  const submitSingle = () => {
    if (scene.t !== "quiz") return;
    if (norm(singleInput) === norm(scene.ans)) {
      if (scene.badge === "⚠ STAGE 4 · 최종 암호" && stage4TimerRef.current) {
        window.clearInterval(stage4TimerRef.current);
        stage4TimerRef.current = null;
      }
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
    const errors = scene.inputs.map(
      (item, idx) => norm(multiInputs[idx] ?? "") !== norm(item.ans),
    );
    setMultiErrors(errors);
    if (errors.every((v) => !v)) {
      adv();
      return;
    }
    window.setTimeout(() => setMultiErrors(scene.inputs.map(() => false)), 500);
    setMultiInputs((prev) => prev.map((v, idx) => (errors[idx] ? "" : v)));
  };

  const moodClass = (mood?: Mood) =>
    mood === "u" ? "urgent" : mood === "l" ? "laptop" : "";
  const dialogueBgClass =
    scene.t === "dlg" && scene.ch === "agentA"
      ? "q2-dialogue-agent"
      : scene.t === "dlg" && scene.ch === "laptop"
        ? "q2-dialogue-laptop"
        : "";
  const renderHarborValue = (text: string) => {
    const parts = text.split(/([A-I])/g);
    return parts.map((part, idx) =>
      /^[A-I]$/.test(part) ? (
        <span className="q2-harbor-hl" key={`${part}-${idx}`}>
          {part}
        </span>
      ) : (
        <Fragment key={`${part}-${idx}`}>{part}</Fragment>
      ),
    );
  };
  const renderDialogueText = (text: string) => {
    if (!DIALOGUE_EMPHASIS_TEXTS.some((target) => text.includes(target))) {
      return text;
    }
    const parts = text.split(DIALOGUE_EMPHASIS_REGEX);
    return parts.map((part, idx) =>
      DIALOGUE_EMPHASIS_TEXTS.includes(
        part as (typeof DIALOGUE_EMPHASIS_TEXTS)[number],
      ) ? (
        <span className="dlg-emphasis" key={`${part}-${idx}`}>
          {part}
        </span>
      ) : (
        <Fragment key={`${part}-${idx}`}>{part}</Fragment>
      ),
    );
  };

  return (
    <main
      className={`quiz2game-page ${scene.t === "dlg" ? "q2-dialogue-jisoo" : ""} ${dialogueBgClass} ${scene.t === "atmo" ? "q2-atmo-page" : ""} ${scene.t === "result" ? "q2-result-page" : ""} ${scene.t === "success" ? "q2-success-page" : ""} ${scene.t === "stage" && scene.num !== 0 ? "q2-stage-page" : ""} ${scene.t === "quiz" ? "q2-quiz-page" : ""} ${scene.t === "quiz-m" ? "q2-quizm-page" : ""} ${scene.t === "quiz" && (scene.badge === "3급 기밀 절차 · 항구 거리 계산" || scene.badge === "STAGE 1 · 단어 해독") ? "q2-harbor-page" : ""} ${scene.t === "quiz" && scene.badge === "⚠ STAGE 3 · 긴급 연산" ? "q2-s3-page" : ""} ${scene.t === "quiz" && scene.badge === "⚠ STAGE 4 · 최종 암호" ? "q2-s4-page" : ""}`}
    >
      <div id="bg-sky" />
      {scene.t === "atmo" && (
        <video
          className="q2-atmo-video"
          src="/img/Quiz/Quiz2/yacht.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
        />
      )}
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
        onClick={onHomeClick}
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

      <div id="scene-wrap" className={isIntroStage ? "intro-layout" : ""}>
        <div id="char-area">
          {scene.t === "dlg" && (
            <div className="ci-wrap">
              <div className={`ci ${moodClass(scene.mood)}`}>
                <span>{ICONS[scene.ch]}</span>
                <div className="scan" />
              </div>
              <div className={`ci-label ${moodClass(scene.mood)}`}>
                {scene.lbl}
              </div>
            </div>
          )}
        </div>

        <div id="scene-content">
          {scene.t === "stage" && (
            <>
              {scene.num !== 0 ? (
                <div className={`q2-stage-scene ${stageFxOn ? "is-on" : ""}`}>
                  <canvas ref={stageRainCanvasRef} className="q2-stage-rain" />
                  <div
                    className="q2-stage-lightning"
                    style={{ opacity: stageLightningOpacity }}
                  />
                  <div className="q2-stage-glow" />
                  <div className="q2-stage-scan" />

                  <div className="q2-stage-hdr q2-stage-anim">
                    <div className="q2-stage-hdr-pill">
                      <span className="q2-stage-hdr-dot" aria-hidden />
                      <span className="q2-stage-hdr-text">
                        MISSION 02 · 새벽을 여는 독도
                      </span>
                    </div>
                  </div>

                  <div className="q2-stage-main">
                    <div className="q2-stage-ring q2-stage-anim">
                      <svg
                        className="q2-stage-ring-svg"
                        viewBox="0 0 130 130"
                        aria-hidden
                      >
                        <circle
                          cx="65"
                          cy="65"
                          r="60"
                          fill="none"
                          stroke="rgba(90,240,196,0.12)"
                          strokeWidth="1"
                        />
                        <circle
                          cx="65"
                          cy="65"
                          r="60"
                          fill="none"
                          stroke="#5af0c4"
                          strokeWidth="1.5"
                          strokeDasharray="50 327"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="65"
                          cy="65"
                          r="48"
                          fill="none"
                          stroke="rgba(90,240,196,0.08)"
                          strokeWidth="0.8"
                        />
                        <circle
                          cx="65"
                          cy="65"
                          r="48"
                          fill="none"
                          stroke="rgba(90,240,196,0.3)"
                          strokeWidth="0.8"
                          strokeDasharray="20 282"
                          strokeLinecap="round"
                          className="q2-stage-ring-svg2"
                        />
                      </svg>
                      <div className="q2-stage-ring-core">
                        <span className="q2-stage-ring-kicker">STAGE</span>
                        <span className="q2-stage-ring-num">{scene.num}</span>
                      </div>
                    </div>

                    <div className="q2-stage-sep q2-stage-anim">
                      <div className="q2-stage-sep-line left" />
                      <span className="q2-stage-sep-text">
                        --- STAGE {scene.num} ---
                      </span>
                      <div className="q2-stage-sep-line right" />
                    </div>

                    <div className="q2-stage-ttl q2-stage-anim">
                      <h1 className="q2-stage-h1">STAGE {scene.num}</h1>
                    </div>

                    <div className="q2-stage-tag q2-stage-anim">
                      <div className="q2-stage-tag-line" />
                      <span className="q2-stage-tag-text">
                        {scene.sub ?? ""}
                      </span>
                      <div className="q2-stage-tag-line" />
                    </div>

                    <div className="q2-stage-info q2-stage-anim">
                      <div className="q2-stage-info-col">
                        <div className="q2-stage-info-k">LEVEL</div>
                        <div className="q2-stage-info-v">3급</div>
                      </div>
                      <div className="q2-stage-info-col">
                        <div className="q2-stage-info-k">TYPE</div>
                        <div className="q2-stage-info-v">해독</div>
                      </div>
                      <div className="q2-stage-info-col">
                        <div className="q2-stage-info-k">STATUS</div>
                        <div className="q2-stage-info-status">
                          <span className="q2-stage-info-dot" aria-hidden />
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="q2-stage-btn q2-stage-anim">
                    <button className="q2-stage-next" onClick={adv}>
                      <span>NEXT</span>
                      <img
                        src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%235af0c4"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`sg-wrap ${scene.num === 0 ? "intro" : "q2-stage-center"}`}
                >
                  {scene.num !== 0 && (
                    <div className="sg-num">--- STAGE {scene.num} ---</div>
                  )}
                  {scene.num === 0 && (
                    <div
                      className={`sg-intro-icon ${introIconVisible ? "intro-visible" : ""}`}
                      aria-hidden
                    >
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 56 56"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <filter id="q2-intro-glow">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <ellipse
                          cx="24"
                          cy="22"
                          rx="14"
                          ry="9"
                          fill="rgba(90,120,165,.38)"
                        />
                        <ellipse
                          cx="34"
                          cy="20"
                          rx="11"
                          ry="8"
                          fill="rgba(90,120,165,.35)"
                        />
                        <ellipse
                          cx="28"
                          cy="25"
                          rx="16"
                          ry="9"
                          fill="rgba(80,110,155,.40)"
                        />
                        <path
                          d="M30 24 L23 36 L28 36 L22 50 L36 32 L30 32 Z"
                          fill="rgba(48,210,215,.85)"
                          filter="url(#q2-intro-glow)"
                        />
                      </svg>
                    </div>
                  )}
                  {scene.num === 0 ? (
                    <div className="main-text">
                      {introTypedText.split("\n").map((line, idx, arr) => (
                        <span key={`intro-line-${idx}`}>
                          {line}
                          {idx < arr.length - 1 && <br />}
                        </span>
                      ))}
                      {!introTypingDone && (
                        <span className="main-text-cursor" />
                      )}
                    </div>
                  ) : (
                    <div className="sg-title">{scene.title}</div>
                  )}
                  <div
                    className={`sg-sub ${isIntroStage ? (introMetaVisible ? "intro-visible" : "intro-hidden") : ""}`}
                  >
                    {scene.sub ?? ""}
                  </div>
                  {scene.num === 0 && <div className="sg-line" aria-hidden />}
                  {scene.num === 0 && (
                    <button
                      className={`sg-btn ${isIntroStage ? (introMetaVisible ? "intro-visible" : "intro-hidden") : ""}`}
                      onClick={adv}
                    >
                      <span>NEXT</span>
                      <img
                        src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%233ee8cc"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </button>
                  )}
                </div>
              )}
            </>
          )}

          {scene.t === "atmo" && (
            <div className="atmo-wrap">
              <span className="atmo-ico">{scene.icon}</span>
              <div className="atmo-lbl">{scene.lbl}</div>
              <div className="atmo-desc">
                {atmoTypedText}
                {isAtmoTyping && <span className="atmo-cursor" aria-hidden />}
              </div>
              <div className="atmo-nav">
                <button className="nbtn" onClick={goBack}>
                  <img
                    src="https://api.iconify.design/ph/arrow-left-bold.svg?color=%234de8ea"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <span>PREV</span>
                </button>
                <button
                  className={`nbtn ${atmoNextReady ? "p" : ""}`}
                  onClick={adv}
                  disabled={!atmoNextReady}
                >
                  <span>{atmoNextReady ? "NEXT" : "..."}</span>
                  <img
                    src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                    alt=""
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>
          )}

          {scene.t === "dlg" && (
            <>
              <div className={`dlg-box ${moodClass(scene.mood)}`}>
                {scene.ch === "agentA" ? (
                  <div className="q2-agent-glitch" aria-hidden>
                    <div className="q2-agent-screenfx">
                      <div className="q2-agent-scanlines" />
                      <div className="q2-agent-scanbar" />
                      <div className="q2-agent-pulse" />
                      <div className="q2-agent-vignette" />
                    </div>
                    <div className="q2-agent-frame" />
                    <div className="q2-agent-corner tl" />
                    <div className="q2-agent-corner tr" />
                    <div className="q2-agent-corner bl" />
                    <div className="q2-agent-corner br" />
                    <div className="q2-agent-ripple-wrap">
                      {rippleRings.map((id) => (
                        <div className="ripple-ring" key={id} />
                      ))}
                    </div>
                    <div className={`tx-label ${isTyping ? "is-on" : ""}`}>
                      ● TX
                    </div>
                  </div>
                ) : scene.ch === "laptop" ? (
                  <div className="q2-laptop-mock" aria-hidden>
                    <div className="q2-laptop-screen">
                      <div className="q2-laptop-screen-inner">
                        <div className="q2-laptop-scanlines" />
                        <div className="q2-laptop-sweep" />
                        <div className="q2-laptop-term">
                          <div className="q2-laptop-term-head">
                            SECURITY AI v2.7.1 // BOOT SEQUENCE
                          </div>
                          <div className="q2-laptop-term-sep" />
                          <div className="q2-laptop-term-line l1">
                            &gt; 보안 시스템 초기화 중...
                          </div>
                          <div className="q2-laptop-term-line l2">
                            &gt; 암호화 레이어 로드 완료
                          </div>
                          <div className="q2-laptop-term-line l3">
                            &gt; 신원 인증 대기 중...
                          </div>
                          <div className="q2-laptop-term-line l4">
                            &gt; [WARNING] 외부 접근 감지
                          </div>
                          <div className="q2-laptop-term-line l5">
                            &gt; AI 프로세서 온라인
                            <span className="q2-laptop-underscore">_</span>
                          </div>
                          <div className="q2-laptop-eq">
                            <span className="b b1" />
                            <span className="b b2" />
                            <span className="b b3" />
                            <span className="b b4" />
                            <span className="b b5" />
                            <span className="b b6" />
                            <span className="b b7" />
                            <span className="b b8" />
                          </div>
                        </div>
                      </div>
                      <div className="q2-laptop-cam" />
                    </div>
                    <div className="q2-laptop-hinge" />
                    <div className="q2-laptop-base">
                      <div className="q2-laptop-kb r1">
                        <span className="k k1" />
                        <span className="k k2" />
                        <span className="k k3" />
                        <span className="k k4 glow" />
                      </div>
                      <div className="q2-laptop-kb r2">
                        <span className="k k5" />
                        <span className="k k6" />
                        <span className="k k7" />
                      </div>
                      <div className="q2-laptop-track" />
                    </div>
                  </div>
                ) : (
                  <canvas
                    ref={signalNoiseRef}
                    className="q2-signal-noise"
                    aria-hidden
                  />
                )}
                {scene.t === "dlg" && (
                  <div className="q2-dialogue-name">{scene.lbl}</div>
                )}
                <div className="dlg-txt">
                  {renderDialogueText(typedText)}
                  <span className={`dlg-cur ${moodClass(scene.mood)}`} />
                </div>
              </div>
              <div className="dlg-nav">
                <button className="nbtn" onClick={goBack}>
                  <img
                    src="https://api.iconify.design/ph/arrow-left-bold.svg?color=%234de8ea"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <span>PREV</span>
                </button>
                <span className="pg-lbl">
                  {lineIdx + 1} / {scene.lines.length}
                </span>
                <button
                  className={`nbtn ${!isTyping && dialogueNextReady ? "p" : ""}`}
                  onClick={nextLine}
                  disabled={!isTyping && !dialogueNextReady}
                >
                  {isTyping || !dialogueNextReady ? (
                    "..."
                  ) : (
                    <>
                      <span>NEXT</span>
                      <img
                        src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {scene.t === "quiz" && (
            <>
              {scene.badge === "3급 기밀 절차 · 항구 거리 계산" ? (
                <div
                  ref={harborWrapRef}
                  className={`q2-harbor-wrap q2-harbor-anim ${harborAnimOn ? "is-on" : ""}`}
                >
                  <div className="q2-harbor-top">
                    <div className="q2-harbor-pill">
                      <span className="q2-harbor-dot" aria-hidden />
                      <span className="q2-harbor-pill-txt">{scene.badge}</span>
                    </div>
                  </div>

                  <h2 className="q2-harbor-title">{scene.title}</h2>

                  <div className="q2-harbor-grid">
                    <div className="q2-harbor-card q2-harbor-card--teal">
                      <div className="q2-harbor-card-kicker">WAYPOINT DATA</div>

                      <div className="q2-harbor-way">
                        <div className="q2-harbor-way-row">
                          <span className="q2-harbor-way-idx">1.</span>
                          <div className="q2-harbor-way-body">
                            <div className="q2-harbor-way-line">
                              <span className="q2-harbor-way-name">죽변항</span>
                              <span className="q2-harbor-way-val">
                                {" "}
                                : {renderHarborValue("AB0.3 km")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="q2-harbor-sep" aria-hidden />

                        <div className="q2-harbor-way-row">
                          <span className="q2-harbor-way-idx">2.</span>
                          <div className="q2-harbor-way-body">
                            <div className="q2-harbor-way-line">
                              <span className="q2-harbor-way-name">묵호항</span>
                              <span className="q2-harbor-way-val">
                                {" "}
                                : {renderHarborValue("CDE.0 km")}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="q2-harbor-sep" aria-hidden />

                        <div className="q2-harbor-way-row">
                          <span className="q2-harbor-way-idx">3.</span>
                          <div className="q2-harbor-way-body">
                            <div className="q2-harbor-way-line">
                              <span className="q2-harbor-way-name">포항항</span>
                              <span className="q2-harbor-way-val">
                                {" "}
                                : {renderHarborValue("21F.0 km")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="q2-harbor-card q2-harbor-card--violet">
                      <div className="q2-harbor-card-kicker q2-harbor-card-kicker--violet">
                        CLASSIFIED REF
                      </div>

                      <div className="q2-harbor-ref-title">
                        SCAPIN 제{renderHarborValue("GHI")}호
                      </div>

                      <div
                        className="q2-harbor-sep q2-harbor-sep--violet"
                        aria-hidden
                      />

                      <div className="q2-harbor-card-kicker q2-harbor-card-kicker--violet">
                        FORMULA
                      </div>
                      <div className="q2-harbor-formula">
                        <div className="q2-harbor-formula-line">
                          X = (G×F) + (D×H) + B
                        </div>
                        <div className="q2-harbor-formula-line">
                          Y = (A+C+E) / I
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="q2-harbor-target">
                    <div>
                      <div className="q2-harbor-target-kicker">
                        TARGET VALUE
                      </div>
                      <div className="q2-harbor-target-val">X + Y = ?</div>
                    </div>
                    <div className="q2-harbor-target-bar" aria-hidden />
                    <div className="q2-harbor-target-note">
                      소수점 포함
                      <br />
                      최종값 입력
                    </div>
                  </div>

                  <div className="q2-harbor-inputrow">
                    <div className="q2-harbor-inputwrap">
                      <input
                        className={`q2-harbor-input ${singleError ? "err" : ""}`}
                        value={singleInput}
                        onChange={(e) => setSingleInput(e.target.value)}
                        placeholder={singlePlaceholder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitSingle();
                        }}
                      />
                    </div>
                    <button className="q2-harbor-submit" onClick={submitSingle}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  <div className="q2-harbor-hint">
                    <button
                      className="q2-harbor-hintbtn"
                      onClick={() => setHintShown((v) => !v)}
                    >
                      [ 힌트 보기 ]
                    </button>
                    {hintShown && scene.hint && (
                      <div className="q2-harbor-hintbox">{scene.hint}</div>
                    )}
                  </div>
                </div>
              ) : scene.badge === "STAGE 1 · 단어 해독" ? (
                <div
                  ref={harborWrapRef}
                  className={`q2-harbor-wrap q2-harbor-anim ${harborAnimOn ? "is-on" : ""}`}
                >
                  <div className="q2-harbor-top">
                    <div className="q2-harbor-pill">
                      <span className="q2-harbor-dot" aria-hidden />
                      <span className="q2-harbor-pill-txt">{scene.badge}</span>
                    </div>
                  </div>

                  <h2 className="q2-harbor-title">{scene.title}</h2>

                  {(() => {
                    const raw = scene.body ?? "";
                    const parts = raw.split(/\[보기 2\]/);
                    const v1 = (parts[0] ?? "")
                      .replace(/^\[보기 1\]\s*/m, "")
                      .trim();
                    const v2 = (parts[1] ?? "").trim();
                    return (
                      <div className="q2-harbor-grid">
                        <div className="q2-harbor-card q2-harbor-card--teal">
                          <div className="q2-harbor-card-kicker">[보기 1]</div>
                          <div className="q2-harbor-bodytext">{v1}</div>
                        </div>
                        <div className="q2-harbor-card q2-harbor-card--violet">
                          <div className="q2-harbor-card-kicker q2-harbor-card-kicker--violet">
                            [보기 2]
                          </div>
                          <div className="q2-harbor-bodytext">{v2}</div>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="q2-harbor-target">
                    <div>
                      <div className="q2-harbor-target-kicker">
                        TARGET VALUE
                      </div>
                      <div className="q2-harbor-target-val">공통 단어 = ?</div>
                    </div>
                    <div className="q2-harbor-target-bar" aria-hidden />
                    <div className="q2-harbor-target-note">
                      공통 단어
                      <br />
                      입력
                    </div>
                  </div>

                  <div className="q2-harbor-inputrow">
                    <div className="q2-harbor-inputwrap">
                      <input
                        className={`q2-harbor-input ${singleError ? "err" : ""}`}
                        value={singleInput}
                        onChange={(e) => setSingleInput(e.target.value)}
                        placeholder={singlePlaceholder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitSingle();
                        }}
                      />
                    </div>
                    <button className="q2-harbor-submit" onClick={submitSingle}>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  <div className="q2-harbor-hint">
                    <button
                      className="q2-harbor-hintbtn"
                      onClick={() => setHintShown((v) => !v)}
                    >
                      [ 힌트 보기 ]
                    </button>
                    {hintShown && scene.hint && (
                      <div className="q2-harbor-hintbox">{scene.hint}</div>
                    )}
                  </div>
                </div>
              ) : scene.badge === "⚠ STAGE 3 · 긴급 연산" ? (
                <div
                  className={`q2-s3-wrap ${urgentCalcAnimOn ? "is-on" : ""} ${hintShown ? "hint-open" : ""}`}
                >
                  <div className="q2-s3-border" aria-hidden />
                  <div className="q2-s3-top">
                    <div className="q2-s3-pill">
                      <svg
                        className="q2-s3-ico"
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                          stroke="#e05030"
                          strokeWidth="2.5"
                        />
                        <line
                          x1="12"
                          y1="9"
                          x2="12"
                          y2="13"
                          stroke="#e05030"
                          strokeWidth="2.5"
                        />
                        <line
                          x1="12"
                          y1="17"
                          x2="12.01"
                          y2="17"
                          stroke="#e05030"
                          strokeWidth="2.5"
                        />
                      </svg>
                      <span className="q2-s3-pilltxt">
                        {scene.badge.replace(/^⚠\s*/, "")}
                      </span>
                      <span className="q2-s3-alertdot" aria-hidden />
                    </div>
                  </div>

                  <h2 className="q2-s3-title">{scene.title}</h2>

                  {(() => {
                    const raw = scene.body ?? "";
                    const lines = raw
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean);
                    const rowLines = lines.filter((l) => /^[URMO]\s*=/.test(l));
                    const formulaLine =
                      lines.find((l) => l.includes("=") && l.includes("?")) ??
                      "";

                    const parsed = rowLines.map((l) => {
                      const m = l.match(
                        /^([URMO])\s*=\s*([^→]+)→\s*([0-9,\.]+)\s*km/i,
                      );
                      return {
                        k: m?.[1] ?? "",
                        name: (m?.[2] ?? "").trim(),
                        val: (m?.[3] ?? "").trim(),
                      };
                    });
                    const byKey = Object.fromEntries(
                      parsed.map((p) => [p.k, p]),
                    ) as Record<
                      string,
                      { k: string; name: string; val: string }
                    >;

                    const mkCard = (
                      k: "U" | "R" | "M" | "O",
                      tone: "teal" | "red",
                    ) => {
                      const p = byKey[k] ?? { k, name: "", val: "" };
                      return (
                        <div
                          className={`q2-s3-varcard tone-${tone} ${urgentCalcAnimOn ? "in" : ""}`}
                          key={k}
                        >
                          <div className={`q2-s3-varbadge tone-${tone}`}>
                            VAR
                          </div>
                          <div className="q2-s3-varrow">
                            <span className={`q2-s3-vark tone-${tone}`}>
                              {p.k}
                            </span>
                            <span className={`q2-s3-eq tone-${tone}`}>=</span>
                            <span className={`q2-s3-varname tone-${tone}`}>
                              {p.name}
                            </span>
                          </div>
                          <div
                            className={`q2-s3-varval tone-${tone} q2-s3-varq`}
                          >
                            {p.k}와의 거리는?
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        <div className="q2-s3-grid">
                          {mkCard("U", "teal")}
                          {mkCard("R", "red")}
                          {mkCard("M", "red")}
                          {mkCard("O", "teal")}
                        </div>

                        <div
                          className={`q2-s3-formula ${urgentCalcAnimOn ? "in" : ""}`}
                        >
                          <div>
                            <div className="q2-s3-formula-k">
                              TARGET FORMULA
                            </div>
                            <div className="q2-s3-formula-v">{formulaLine}</div>
                          </div>
                          <div className="q2-s3-formula-note">
                            소수점
                            <br />
                            1자리
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div
                    className={`q2-s3-inputrow ${urgentCalcAnimOn ? "in" : ""}`}
                  >
                    <input
                      className={`q2-s3-in ${singleError ? "err" : ""}`}
                      value={singleInput}
                      onChange={(e) => setSingleInput(e.target.value)}
                      placeholder={singlePlaceholder}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitSingle();
                      }}
                    />
                    <button
                      className="q2-s3-go"
                      onClick={submitSingle}
                      aria-label="제출"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>

                  <div className={`q2-s3-hint ${urgentCalcAnimOn ? "in" : ""}`}>
                    <button
                      className="q2-s3-hintbtn"
                      onClick={() => setHintShown((v) => !v)}
                    >
                      [ 힌트 보기 ]
                    </button>
                    {hintShown && scene.hint && (
                      <div className="q2-s3-hintbox">{scene.hint}</div>
                    )}
                  </div>
                </div>
              ) : scene.badge === "⚠ STAGE 4 · 최종 암호" ? (
                <div className={`q2-s4-wrap ${hintShown ? "hint-open" : ""}`}>
                  <div className="q2-s4-border" aria-hidden />

                  {(() => {
                    const pad = (n: number) => String(n).padStart(2, "0");
                    const m = Math.floor(stage4RemainingSec / 60);
                    const s = stage4RemainingSec % 60;
                    const pct = Math.max(
                      0,
                      Math.min(100, (stage4RemainingSec / 300) * 100),
                    );

                    const raw = scene.body ?? "";
                    const lines = raw
                      .split("\n")
                      .map((l) => l.trim())
                      .filter(Boolean);
                    const rowLines = lines.filter((l) => /^[URMO]\s*=/.test(l));
                    const formulaLine =
                      lines.find((l) => l.includes("=") && l.includes("?")) ??
                      "";

                    const parsed = rowLines.map((l) => {
                      const mm = l.match(
                        /^([URMO])\s*=\s*([^→]+)→\s*([0-9,\.]+)\s*km/i,
                      );
                      return {
                        k: mm?.[1] ?? "",
                        name: (mm?.[2] ?? "").trim(),
                        val: (mm?.[3] ?? "").trim(),
                      };
                    });
                    const byKey = Object.fromEntries(
                      parsed.map((p) => [p.k, p]),
                    ) as Record<
                      string,
                      { k: string; name: string; val: string }
                    >;

                    const row = (k: "U" | "R" | "M" | "O") => {
                      const p = byKey[k] ?? { k, name: "", val: "" };
                      const isTeal = k === "U" || k === "O";
                      return (
                        <div className={`q2-s4-row ${k}`} key={k}>
                          <span
                            className={`q2-s4-k ${isTeal ? "teal" : "red"}`}
                          >
                            {p.k}
                          </span>
                          <div className="q2-s4-meta">
                            <div className="q2-s4-name">{p.name}</div>
                            <div
                              className={`q2-s4-val ${isTeal ? "teal" : "red"}`}
                            >
                              {p.val} <span className="q2-s4-unit">km</span>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <>
                        <div className="q2-s4-hdr">
                          <div className="q2-s4-pill">
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                                stroke="#e05030"
                                strokeWidth="2.5"
                              />
                              <line
                                x1="12"
                                y1="9"
                                x2="12"
                                y2="13"
                                stroke="#e05030"
                                strokeWidth="2.5"
                              />
                              <line
                                x1="12"
                                y1="17"
                                x2="12.01"
                                y2="17"
                                stroke="#e05030"
                                strokeWidth="2.5"
                              />
                            </svg>
                            <span className="q2-s4-pilltxt">
                              STAGE 4 · 최종 암호
                            </span>
                            <span className="q2-s4-dot" aria-hidden />
                          </div>

                          <div className="q2-s4-time">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#e05030"
                              strokeWidth="2"
                              strokeLinecap="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            <span className="q2-s4-timek">TIME</span>
                            <span
                              className={`q2-s4-timer ${stage4RemainingSec <= 30 ? "is-urgent" : ""}`}
                            >
                              {pad(m)}:{pad(s)}
                            </span>
                          </div>
                        </div>

                        <h2 className="q2-s4-title">
                          새로운 공식으로 최종 암호를 계산하시오
                          <br />
                          <span className="q2-s4-title-sub">
                            — 시간이 없습니다!
                          </span>
                        </h2>

                        <div className="q2-s4-table">
                          <div className="q2-s4-kicker">DISTANCE DATABASE</div>
                          <div className="q2-s4-grid">
                            {row("U")}
                            {row("R")}
                            {row("M")}
                            {row("O")}
                          </div>
                        </div>

                        <div className="q2-s4-formula">
                          <div className="q2-s4-formula-top" aria-hidden />
                          <div className="q2-s4-formula-k">FINAL FORMULA</div>
                          <div className="q2-s4-formula-v">{formulaLine}</div>
                          <div className="q2-s4-formula-scan" aria-hidden />
                        </div>

                        <div className="q2-s4-bar">
                          <div
                            className="q2-s4-bar-in"
                            style={{ width: `${pct}%` }}
                            aria-hidden
                          />
                        </div>

                        <div className="q2-s4-inputrow">
                          <input
                            className={`q2-s4-in ${singleError ? "err" : ""}`}
                            value={singleInput}
                            onChange={(e) => setSingleInput(e.target.value)}
                            placeholder={singlePlaceholder}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitSingle();
                            }}
                          />
                          <button
                            className="q2-s4-go"
                            onClick={submitSingle}
                            aria-label="제출"
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </button>
                        </div>

                        <button
                          className="q2-s4-hintbtn"
                          onClick={() => setHintShown((v) => !v)}
                        >
                          [ 힌트 보기 ]
                        </button>
                        {hintShown && scene.hint && (
                          <div className="q2-s4-hintbox">{scene.hint}</div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className={`qz-card ${moodClass(scene.mood)}`}>
                  <div className={`qz-badge ${moodClass(scene.mood)}`}>
                    {scene.badge}
                  </div>
                  <div className="qz-title">{scene.title}</div>
                  <div className={`qz-body ${moodClass(scene.mood)}`}>
                    {scene.body}
                  </div>
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
                    <button
                      className={`qbtn ${moodClass(scene.mood)}`}
                      onClick={submitSingle}
                    >
                      →
                    </button>
                  </div>
                  <button
                    className="qhint"
                    onClick={() => setHintShown((v) => !v)}
                  >
                    [ 힌트 보기 ]
                  </button>
                  {hintShown && scene.hint && (
                    <div className="qhint-box">{scene.hint}</div>
                  )}
                </div>
              )}
              <div className="bot-nav">
                <button className="nbtn" onClick={goBack}>
                  <img
                    src="https://api.iconify.design/ph/arrow-left-bold.svg?color=%234de8ea"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <span>PREV</span>
                </button>
              </div>
            </>
          )}

          {scene.t === "quiz-m" && (
            <>
              {scene.badge === "STAGE 2 · 광고판 위치 해독" ? (
                <div className="q2-s2-wrap">
                  <div className="q2-s2-top">
                    <div className="q2-s2-pill">
                      <span className="q2-s2-dot" aria-hidden />
                      <span className="q2-s2-pilltxt">{scene.badge}</span>
                    </div>
                  </div>

                  <h2 className="q2-s2-title">{scene.title}</h2>

                  {(() => {
                    const lines = (scene.body ?? "")
                      .split("\n")
                      .map((l) => l.trim());
                    const optionsLine =
                      lines.find((l) => l.startsWith("A.")) ?? "";
                    const numsLine =
                      lines.find((l) => /^\d+\s*\/\//.test(l)) ?? "";
                    const arrowLine =
                      lines.find((l) => l.startsWith("→")) ?? "";

                    const optMatches = Array.from(
                      optionsLine.matchAll(/([A-D])\.\s*([^\s]+)/g),
                    );
                    const opts = optMatches.map((m) => ({
                      k: m[1] ?? "",
                      v: m[2] ?? "",
                    }));

                    const nums = numsLine
                      .split("//")
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 3);

                    return (
                      <>
                        <div className="q2-s2-card q2-s2-card--teal">
                          <div className="q2-s2-kicker">KEYWORD OPTIONS</div>
                          <div className="q2-s2-optgrid">
                            {opts.map((o) => (
                              <div className="q2-s2-opt" key={o.k}>
                                <span className="q2-s2-optk">{o.k}.</span>
                                <span className="q2-s2-optv">{o.v}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="q2-s2-card q2-s2-card--violet">
                          <div className="q2-s2-kicker q2-s2-kicker--violet">
                            DECODE SEQUENCE
                          </div>
                          <div className="q2-s2-seq">
                            {nums.map((n, idx) => (
                              <Fragment key={`${n}-${idx}`}>
                                <div className="q2-s2-numcard">
                                  <div className="q2-s2-num">{n}</div>
                                  <div className="q2-s2-numsub">개</div>
                                </div>
                                {idx < nums.length - 1 && (
                                  <div className="q2-s2-slash">//</div>
                                )}
                              </Fragment>
                            ))}
                          </div>
                          <div className="q2-s2-arrowline">
                            <span className="q2-s2-arrow">→</span>
                            <span className="q2-s2-arrowtxt">
                              {arrowLine.replace(/^→\s*/, "")}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  <div className="q2-s2-inputk">ANSWER INPUT</div>

                  <div className="q2-s2-inputs">
                    {scene.inputs.map((item, idx) => {
                      const n = (item.lbl.match(/\d+/)?.[0] ?? "").trim();
                      return (
                        <div key={item.lbl} className="q2-s2-inrow">
                          <div className="q2-s2-inidx">
                            <span className="q2-s2-innum">{n}</span>
                            <span className="q2-s2-insub">개</span>
                          </div>
                          <input
                            className={`q2-s2-in ${multiErrors[idx] ? "err" : ""}`}
                            value={multiInputs[idx] ?? ""}
                            onChange={(e) => {
                              const next = [...multiInputs];
                              next[idx] = e.target.value;
                              setMultiInputs(next);
                            }}
                            placeholder={item.ph}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button className="q2-s2-confirm" onClick={submitMulti}>
                    확인
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              ) : (
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
              )}
              <div className="bot-nav">
                <button className="nbtn" onClick={goBack}>
                  <img
                    src="https://api.iconify.design/ph/arrow-left-bold.svg?color=%234de8ea"
                    alt=""
                    width={18}
                    height={18}
                  />
                  <span>PREV</span>
                </button>
              </div>
            </>
          )}

          {scene.t === "result" && (
            <>
              {scene.lbl === "SIGNAL CONFIRMED" ? (
                <div className="q2-signal-scene">
                  <canvas
                    ref={signalRainCanvasRef}
                    className="q2-signal-rain"
                  />
                  <div
                    className="q2-signal-lightning"
                    style={{ opacity: signalLightningOpacity }}
                  />
                  <div className="q2-signal-glow" />
                  <div className="q2-signal-vignette" />
                  <div className="q2-signal-scan" />

                  <div
                    className={`q2-signal-inner ${signalResultOn ? "is-on" : ""}`}
                  >
                    <div className="q2-signal-topbar">
                      <div className="q2-signal-topline left" />
                      <div className="q2-signal-pill">
                        <span className="q2-signal-dot" />
                        <span className="q2-signal-pilltext">
                          SIGNAL CONFIRMED
                        </span>
                      </div>
                      <div className="q2-signal-topline right" />
                    </div>

                    <div className="q2-signal-dist">
                      <div className="q2-signal-distkicker">
                        DISTANCE CALCULATED
                      </div>
                      <div className="q2-signal-distmain">
                        <span className="q2-signal-num">
                          {signalDistanceDisplay}
                        </span>
                        <span className="q2-signal-unit">km</span>
                        <div className="q2-signal-underline" />
                      </div>
                    </div>

                    <div className="q2-signal-coords">
                      <div className="q2-signal-card">
                        <div className="q2-signal-cardlbl">FROM</div>
                        <div className="q2-signal-cardtitle">울릉도</div>
                        <div className="q2-signal-cardsub">
                          37°30′N 130°52′E
                        </div>
                      </div>
                      <div className="q2-signal-arrow" aria-hidden="true">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <line
                            x1="5"
                            y1="12"
                            x2="19"
                            y2="12"
                            stroke="rgba(90,240,196,0.4)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <polyline
                            points="12 5 19 12 12 19"
                            stroke="rgba(90,240,196,0.4)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </svg>
                      </div>
                      <div className="q2-signal-card">
                        <div className="q2-signal-cardlbl">TO</div>
                        <div className="q2-signal-cardtitle">독도</div>
                        <div className="q2-signal-cardsub">
                          37°14′N 131°52′E
                        </div>
                      </div>
                    </div>

                    <div className="q2-signal-status">
                      <div className="q2-signal-statushead">
                        <span className="q2-signal-statusdot" />
                        <span className="q2-signal-statustitle">
                          IDENTITY VERIFIED
                        </span>
                      </div>
                      <div className="q2-signal-statussep" />
                      <p className="q2-signal-statusmsg">
                        울릉도와 독도의 거리는{" "}
                        <span className="q2-signal-strong">87.4km</span>
                        입니다.
                        <br />
                        신원이 확인되었습니다.
                      </p>
                    </div>

                    <div className="q2-signal-btn">
                      <button className="nbtn p" onClick={adv}>
                        <span>NEXT</span>
                        <img
                          src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                          alt=""
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>

                    <div className="q2-signal-bottombar">
                      <div className="q2-signal-bottomline left" />
                      <span className="q2-signal-bottomtext">
                        MISSION 02 · 새벽을 여는 독도
                      </span>
                      <div className="q2-signal-bottomline right" />
                    </div>
                  </div>
                </div>
              ) : scene.lbl === "STAGE 1 CLEAR" ? (
                <div className="q2-clear-scene">
                  <div className="q2-clear-glow" />

                  <div className="q2-clear-inner">
                    <div className="q2-clear-ring">
                      <svg
                        className="q2-clear-ring-svg"
                        viewBox="0 0 110 110"
                        aria-hidden
                      >
                        <circle
                          cx="55"
                          cy="55"
                          r="50"
                          fill="none"
                          stroke="rgba(90,240,196,0.1)"
                          strokeWidth="1.5"
                        />
                        <circle
                          className="q2-clear-ring-progress"
                          cx="55"
                          cy="55"
                          r="50"
                          fill="none"
                          stroke="#5af0c4"
                          strokeWidth="2"
                          strokeDasharray="314"
                          strokeDashoffset="314"
                        />
                        <circle
                          cx="55"
                          cy="55"
                          r="40"
                          fill="none"
                          stroke="rgba(90,240,196,0.06)"
                          strokeWidth="1"
                        />
                        <circle
                          className="q2-clear-ring-spin"
                          cx="55"
                          cy="55"
                          r="40"
                          fill="none"
                          stroke="rgba(90,240,196,0.25)"
                          strokeWidth="1"
                          strokeDasharray="15 237"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="q2-clear-core">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5af0c4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>CLEAR</span>
                      </div>
                    </div>

                    <div className="q2-clear-stage-label">
                      <div className="q2-clear-stage-line left" />
                      <span>{scene.lbl}</span>
                      <div className="q2-clear-stage-line right" />
                    </div>

                    <div className="q2-clear-title-box">
                      <div className="q2-clear-title-kicker">
                        NEXT DESTINATION
                      </div>
                      <h1 className="q2-clear-title">{scene.ans}</h1>
                    </div>

                    <div className="q2-clear-info-card">
                      <div className="q2-clear-info-grid">
                        <div className="q2-clear-info-col left">
                          <div className="q2-clear-info-k">LOCATION</div>
                          <div className="q2-clear-info-v">울릉도 내</div>
                        </div>
                        <div className="q2-clear-info-col right">
                          <div className="q2-clear-info-k">CAUTION</div>
                          <div className="q2-clear-caution">
                            <span
                              className="q2-clear-caution-dot"
                              aria-hidden
                            />
                            식당 내 진입 금지
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="q2-clear-order-box">
                      <div className="q2-clear-order-k">ORDER</div>
                      <p className="q2-clear-order-msg">
                        등대식당으로 이동하세요.
                        <br />
                        <span>단, 식당 안으로 들어가지 않습니다.</span>
                      </p>
                    </div>

                    <div className="q2-clear-next">
                      <button className="nbtn p" onClick={adv}>
                        <span>NEXT</span>
                        <img
                          src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                          alt=""
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ) : scene.lbl === "STAGE 2 CLEAR" ? (
                <div className="q2-s2clear-scene">
                  <div className="q2-s2clear-lightning" aria-hidden />
                  <div className="q2-s2clear-bird-bg" aria-hidden>
                    <svg viewBox="0 0 420.574 693.461" fill="none">
                      <path d={BIRD_PATH_D} fill="rgba(90,240,196,0.22)" />
                    </svg>
                  </div>
                  <div className="q2-s2clear-bird-sm" aria-hidden>
                    <svg viewBox="0 0 420.574 693.461" fill="none">
                      <path d={BIRD_PATH_D} fill="rgba(90,240,196,0.24)" />
                    </svg>
                  </div>

                  <div className="q2-s2clear-main">
                    <div className="q2-s2clear-bird-center" aria-hidden>
                      <svg viewBox="0 0 420.574 693.461" fill="none">
                        <path d={BIRD_PATH_D} fill="rgba(90,240,196,0.45)" />
                      </svg>
                    </div>

                    <div className="q2-s2clear-label">
                      <div className="q2-s2clear-line left" />
                      <div className="q2-s2clear-pill">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5af0c4"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>STAGE 2 CLEAR</span>
                      </div>
                      <div className="q2-s2clear-line right" />
                    </div>

                    <div className="q2-s2clear-titlebox">
                      <div className="q2-s2clear-kicker">NEXT DESTINATION</div>
                      <h1 className="q2-s2clear-title">
                        경상북도 <span>·</span> 울릉군
                      </h1>
                    </div>

                    <div className="q2-s2clear-sep" />

                    <div className="q2-s2clear-order">
                      <div className="q2-s2clear-order-icon" aria-hidden>
                        <svg viewBox="0 0 420.574 693.461" fill="none">
                          <path d={BIRD_PATH_D} fill="rgba(90,240,196,0.68)" />
                        </svg>
                      </div>
                      <div>
                        <div className="q2-s2clear-order-k">ORDER</div>
                        <div className="q2-s2clear-order-v">
                          <span>본 화면은 다음 장소의 힌트입니다.</span>
                          <br />
                          해당 힌트 그림을 보고 장소로 이동합니다.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="q2-s2clear-next">
                    <button className="nbtn p" onClick={adv}>
                      <span>NEXT</span>
                      <img
                        src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rs-wrap">
                  <div className="rs-lbl">{scene.lbl}</div>
                  <div className="rs-ans">{scene.ans}</div>
                  <div className="rs-desc">{scene.desc}</div>
                  <div style={{ marginTop: 14, textAlign: "center" }}>
                    <button className="nbtn p" onClick={adv}>
                      <span>NEXT</span>
                      <img
                        src="https://api.iconify.design/ph/arrow-right-bold.svg?color=%234de8ea"
                        alt=""
                        width={18}
                        height={18}
                      />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {scene.t === "success" && (
            <div className="q2-success-shell">
              <canvas ref={successRainCanvasRef} className="q2-success-rc" aria-hidden />
              <canvas
                ref={successParticleCanvasRef}
                className="q2-success-particles"
                aria-hidden
              />
              <div ref={successFlashRef} className="q2-success-flash" aria-hidden />
              <div className="q2-success-radial" aria-hidden />

              <div className="q2-success-content">
                <div id="e0" className="q2-success-a0">
                  <div className="q2-success-avatar-box">
                    <svg className="q2-success-avatar-spin" viewBox="0 0 90 90">
                      <circle
                        cx="45"
                        cy="45"
                        r="42"
                        fill="none"
                        stroke="rgba(90,240,196,0.1)"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r="42"
                        fill="none"
                        stroke="#5af0c4"
                        strokeWidth="1.5"
                        strokeDasharray="24 240"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="45"
                        cy="45"
                        r="33"
                        fill="none"
                        stroke="rgba(90,240,196,0.07)"
                        strokeWidth="1"
                      />
                    </svg>
                    <div className="q2-success-avatar-inner">
                      <span className="q2-success-avatar-emoji">🧑🏻‍🦳</span>
                    </div>
                    <div className="q2-success-avatar-check" aria-hidden>
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#020c16"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <p className="q2-success-avatar-label">국정원 최지수 국장</p>
                </div>

                <div id="e1" className="q2-success-a1">
                  <div className="line left" />
                  <span>MISSION COMPLETE</span>
                  <div className="line right" />
                </div>

                <div id="e2" className="q2-success-a2">
                  <h1>MISSION SUCCESS</h1>
                </div>

                <div id="e3" className="q2-success-midline" />

                <div id="e4" className="q2-success-a3">
                  <div className="num-wrap">
                    <span className="quote">"</span>
                    <span className="num">7</span>
                    <span className="quote">"</span>
                  </div>
                </div>

                <div id="e5" className="q2-success-a4">
                  <div className="card">
                    <p className="p1">
                      수고하셨어요 요원!
                      <br />
                      덕분에 일본이 만든 안개 발생 기계를
                      <br />
                      멈출 수 있었어요.
                    </p>
                    <div className="sep" />
                    <p className="p2">
                      대한민국 새벽을 여는 독도를
                      <br />
                      지키게 해준 당신들,
                      <br />
                      <span>이번 임무는 완벽했어요.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
