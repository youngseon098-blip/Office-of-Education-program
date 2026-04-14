/* eslint-disable @typescript-eslint/no-explicit-any -- SCENES-driven narrative engine */

type BgMode = "ocean" | "lab" | "museum";

interface SceneQuiz {
  bg?: BgMode;
  type: "quiz";
  stage?: string;
  question: string;
  hint?: string;
  placeholder?: string;
  answer?: string | null;
  answerAlt?: string[];
  freeform?: boolean;
}

type Scene =
  | Record<string, any>
  | SceneQuiz;

export function initQuiz1Game(root: HTMLElement): () => void {
  const c = root.querySelector<HTMLCanvasElement>("#q1g-c-bg");
  const st = root.querySelector<HTMLElement>("#q1g-scene");
  const nx = root.querySelector<HTMLButtonElement>("#q1g-next-btn");
  const pv = root.querySelector<HTMLButtonElement>("#q1g-prev-btn");
  const bd = root.querySelector<HTMLElement>("#q1g-stage-badge");
  const ov = root.querySelector<HTMLElement>("#q1g-overlay");

  if (!c || !st || !nx || !pv || !bd || !ov) {
    return () => { };
  }

  const x = c.getContext("2d");
  if (!x) {
    return () => { };
  }

  const dom = {
    canvas: c,
    ctx: x,
    stage: st,
    next: nx,
    prev: pv,
    badge: bd,
    overlay: ov,
  };

  let disposed = false;
  let rafId = 0;
  let particleIntervalId: ReturnType<typeof setInterval> | null = null;

  let W = 0,
    H = 0,
    bgStars: any[] = [],
    bgFog: any[] = [];
  let bgMode: BgMode = "ocean";

  const waveDefs = Array.from({ length: 10 }, () => ({
    off: Math.random() * Math.PI * 2,
    sp: 0.25 + Math.random() * 0.35,
    amp: 1.5 + Math.random() * 4,
    fr: 0.006 + Math.random() * 0.007,
  }));

  function resizeBg() {
    if (disposed) return;
    W = dom.canvas.width = window.innerWidth;
    H = dom.canvas.height = window.innerHeight;
    buildBgStars();
    buildBgFog();
  }

  function buildBgStars() {
    bgStars = [];
    const n = Math.floor((W * H) / 650);
    for (let i = 0; i < n; i++)
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.5,
        r: Math.random() * 1.1 + 0.15,
        a: Math.random() * 0.45,
        p: Math.random() * Math.PI * 2,
        s: Math.random() * 0.003 + 0.001,
      });
    for (let i = 0; i < 20; i++)
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.45,
        r: Math.random() * 1.5 + 1,
        a: 0.5 + Math.random() * 0.4,
        p: Math.random() * Math.PI * 2,
        s: 0.002,
        bright: true,
      });
  }

  function buildBgFog() {
    bgFog = [];
    for (let i = 0; i < 12; i++)
      bgFog.push({
        x: Math.random() * W,
        y: H * 0.5 + Math.random() * H * 0.15,
        w: 180 + Math.random() * 280,
        h: 35 + Math.random() * 55,
        a: Math.random() * 0.055 + 0.015,
        dx: (Math.random() - 0.5) * 0.12,
        p: Math.random() * Math.PI * 2,
      });
  }

  /* 혈흔 스플래터 — 최초 1회 pre-render 후 재사용 */
  let bloodCanvas: HTMLCanvasElement | null = null;

  function buildBloodCanvas() {
    const bc = document.createElement("canvas");
    bc.width = W; bc.height = H;
    const ctxRaw = bc.getContext("2d");
    if (!ctxRaw) return bc;
    const bctx: CanvasRenderingContext2D = ctxRaw;
    const R = "#c00808", RD = "#880404", RL = "#e00a0a";
    function blob(cx: number, cy: number, rx: number, ry: number, rot: number, al: number, col: string) {
      bctx.save(); bctx.translate(cx, cy); bctx.rotate(rot);
      bctx.globalAlpha = al; bctx.fillStyle = col;
      bctx.beginPath(); bctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); bctx.fill(); bctx.restore();
    }
    function splat(sx: number, sy: number, maxR: number, al: number) {
      blob(sx, sy, maxR * 0.9, maxR * 0.44, -0.28, al * 0.95, R);
      blob(sx - maxR * 0.04, sy - maxR * 0.01, maxR * 0.62, maxR * 0.33, 0.12, al * 0.86, RD);
      blob(sx + maxR * 0.05, sy + maxR * 0.01, maxR * 0.45, maxR * 0.25, -0.08, al * 0.80, RL);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + sx * 0.01;
        const d = maxR * (0.42 + Math.sin(i * 2.2) * 0.28);
        const r = maxR * (0.04 + Math.abs(Math.sin(i * 1.9)) * 0.10);
        blob(sx + Math.cos(a) * d, sy + Math.sin(a) * d, r, r * 0.62, a, al * 0.45, R);
      }
      for (let i = 0; i < 3; i++) {
        const dx = sx + Math.sin(i * 2 + sx) * maxR * 0.32;
        const dlen = maxR * (0.38 + Math.sin(i * 1.8) * 0.18);
        const w = maxR * 0.08;
        bctx.save(); bctx.globalAlpha = al * 0.72; bctx.fillStyle = RD;
        bctx.beginPath();
        bctx.moveTo(dx - w / 2, sy + maxR * 0.26);
        bctx.quadraticCurveTo(dx + w * 0.3, sy + maxR * 0.26 + dlen * 0.5, dx - w * 0.2, sy + maxR * 0.26 + dlen);
        bctx.quadraticCurveTo(dx - w, sy + maxR * 0.26 + dlen * 0.8, dx - w / 2, sy + maxR * 0.26);
        bctx.fill();
        bctx.beginPath(); bctx.ellipse(dx - w * 0.1, sy + maxR * 0.26 + dlen + w * 1.1, w * 0.78, w * 1.15, 0, 0, Math.PI * 2); bctx.fill();
        bctx.restore();
      }
    }
    splat(W * 0.14, H * 0.07, Math.min(W, H) * 0.072, 0.82);
    splat(W * 0.06, H * 0.12, Math.min(W, H) * 0.042, 0.68);
    splat(W * 0.86, H * 0.08, Math.min(W, H) * 0.034, 0.60);
    splat(W * 0.92, H * 0.22, Math.min(W, H) * 0.024, 0.48);
    splat(W * 0.04, H * 0.48, Math.min(W, H) * 0.022, 0.35);
    splat(W * 0.95, H * 0.62, Math.min(W, H) * 0.018, 0.30);
    splat(W * 0.08, H * 0.82, Math.min(W, H) * 0.020, 0.32);
    splat(W * 0.88, H * 0.88, Math.min(W, H) * 0.018, 0.28);
    return bc;
  }

  let bgT = 0;
  function drawBg() {
    if (disposed) return;
    bgT += 0.016;
    const ctx2 = dom.ctx;
    ctx2.clearRect(0, 0, W, H);

    /* ── 나무 바닥 베이스 ── */
    const bg = ctx2.createLinearGradient(0, 0, 0, H);
    if (bgMode === "lab") {
      bg.addColorStop(0, "#201508"); bg.addColorStop(0.5, "#281a0a"); bg.addColorStop(1, "#1a1006");
    } else if (bgMode === "museum") {
      bg.addColorStop(0, "#1c1208"); bg.addColorStop(0.5, "#221608"); bg.addColorStop(1, "#181006");
    } else {
      bg.addColorStop(0, "#1e1510"); bg.addColorStop(0.4, "#241a0e"); bg.addColorStop(0.8, "#1c1208"); bg.addColorStop(1, "#140e06");
    }
    ctx2.fillStyle = bg; ctx2.fillRect(0, 0, W, H);

    /* 나무 결 */
    for (let i = 0; i < 22; i++) {
      const yBase = (H / 22) * i + Math.sin(i * 1.3) * 10;
      ctx2.beginPath(); ctx2.moveTo(0, yBase);
      for (let px = 0; px <= W; px += 28)
        ctx2.lineTo(px, yBase + Math.sin(px * 0.007 + i * 0.9 + bgT * 0.04) * 5);
      ctx2.strokeStyle = `rgba(${i % 2 ? 200 : 160},${i % 2 ? 140 : 110},${i % 2 ? 50 : 40},0.032)`;
      ctx2.lineWidth = 1.2 + Math.sin(i * 0.6) * 0.8;
      ctx2.stroke();
    }

    /* lab 조명 글로우 */
    if (bgMode === "lab") {
      const lg = ctx2.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, H * 0.5);
      lg.addColorStop(0, "rgba(220,160,60,0.07)"); lg.addColorStop(1, "rgba(0,0,0,0)");
      ctx2.fillStyle = lg; ctx2.fillRect(0, 0, W, H);
    }

    /* 주변부 비네팅 */
    const vig = ctx2.createRadialGradient(W / 2, H / 2, H * 0.12, W / 2, H / 2, H * 0.82);
    vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.68)");
    ctx2.fillStyle = vig; ctx2.fillRect(0, 0, W, H);

    /* 혈흔 오버레이 */
    if (!bloodCanvas || bloodCanvas.width !== W || bloodCanvas.height !== H) {
      bloodCanvas = buildBloodCanvas();
    }
    ctx2.drawImage(bloodCanvas, 0, 0);

    rafId = requestAnimationFrame(drawBg);
  }

  const FISHERMAN_CHAR_HTML = `<img src="/img/Quiz/Quiz1/Fisherman2.webp" alt="" class="char-silhouette q1g-char-fisher" decoding="async" />`;

  const DOCTOR_CHAR_HTML = `<img src="/img/Quiz/Quiz1/Lab3.webp" alt="" class="char-silhouette q1g-char-lab" decoding="async" />`;

  /* ════════════════════════════════════════════════
   SCENE DATA
════════════════════════════════════════════════ */
  const SCENES: Scene[] = [
    /* 1p */
    {
      bg: "museum",
      type: "narration",
      icon: "🏛️",
      text: "대한민국 이규원검찰일기 연구소에\n도착한 당신입니다.",
      sub: "MISSION · START",
    },
    /* 2p - 이대환 박사 */
    {
      bg: "lab",
      type: "dialogue",
      char: "doctor",
      charLabel: "검찰일기 이대환 박사",
      lines: [
        "안녕하세요. 이규원 검찰일기를 연구하는 이대환박사입니다. 만나서 반갑습니다.",
        "최근 울릉도에서 이상한 시그널이 계속해서 감지되고 있습니다.",
        '확실한 건 현시대의 전화는 아닌... 마치 <strong class="q1g-dialogue-em">과거에서 온 그런 전화</strong> 같았습니다.',
        "아! 여기 이 전화기를 들고가세요. 큰 도움이 될겁니다.",
      ],
    },
    /* 3p - 전화 */
    { bg: "ocean", type: "phone", caller: "과거에서 온 전화", callerName: "???" },
    /* 4p */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "아.아. 들리오? 반갑소잉. 거까지 내 목소리가 들리니 참으로 신기허구만.",
        "나야 평생 괴기나 잡고 살았지마는 이렇게 미래 양반들하고 노가리도 까보고 이거 원 오래 살고 볼일이구먼.",
      ],
    },
    /* 5p - 1단계 도입 */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "나라에서 울릉도로 사람들을 싹 모은다 캐서, 나도 큰맘 묵고 여그까지 기어들어 오기는 했는디.",
        "막상 발을 디뎌본께 이게 머시당가? 온 천지 쪽바리 놈들뿐이여. 아주 징허게 많구만.",
        "내 미래 양반들헌테 부탁 하나만 함세.",
        '쪽바리 놈들이 <strong class="q1g-dialogue-em">내가 있는 장소</strong>를 알면 곤란하니깐, 내 요놈들 몰래 힌트를 하나 남겨 줄랑께 잘 들어보쇼잉.',
      ],
    },
    /* 6p - 메모1 */
    {
      bg: "ocean",
      type: "memo",
      title: "개척령 시기 전라도 출신 어부의 위치 힌트 (1/2)",
      hints: [
        { num: "1", text: '대복상회 울릉군 울릉읍 도동 <span class="hint-key">A</span>길 6' },
        { num: "2", text: '연합국 최고사령관 각서 (SCAPIN 제67<span class="hint-key">B</span>호)' },
        { num: "3", text: '안용복의 2차 도해는 16<span class="hint-key">C</span>6년' },
        { num: "4", text: '울진죽변~독도의 거리 <span class="hint-key">D</span>16.8km' },
      ],
      footer: "· HINT 1 OF 2 ·",
    },
    /* 7p - 퀴즈1 */
    {
      bg: "ocean",
      type: "quiz",
      stage: "1단계 퀴즈",
      question:
        '앞선 A B C D를 파악한 후,\n<span class="hl">010-9337-ABCD</span>에게 전화하여\n아래 정답을 입력하세요.',
      hint: "📞 전화 미션\n독도의 섬은 총 몇 개일까요?\n정답: **개의 바위섬과 주 섬 *개 총 **개",
      placeholder: "4자리 숫자 입력",
      answer: "0127",
      answerAlt: [],
    },
    /* 8p - 정답1 */
    {
      bg: "ocean",
      type: "correct",
      badge: "✅",
      title: "정답입니다!",
      text: "1905년 1월 27일, 일본 내각은 독도를 '타케시마'로 명명하고\n주인이 없는 땅(무주지)이라 주장하며\n일본 영토로 편입하기로 결정했습니다.",
      move: null,
    },
    /* 9p - 전화 2단계 */
    { bg: "ocean", type: "phone", caller: "과거에서 온 전화", callerName: "어부 (전라도)" },
    /* 10p */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "문제가 솔찬히 거시기했는가 보네?",
        "미안허구만 미래 양반, 여그저그 보는 눈들이 영 많아부러서 어쩔 수가 없었당게. 이해 좀 해주시게.",
        "인자 인나서 내가 어디 있는지 딱 알 수 있게끔 마지막 힌트를 줘볼랑게 잘 받아 적어보드라고.",
      ],
    },
    /* 11p - 메모2 */
    {
      bg: "ocean",
      type: "memo",
      title: "개척령 시기 전라도 출신 어부의 위치 힌트 (2/2)",
      hints: [
        { num: "1", text: '<span class="hint-key">0127</span>' },
        {
          num: "2",
          text: '울릉군 울릉읍 도동<span class="hint-key">B</span>길 <span class="hint-key">CD</span>',
        },
        { num: "3", text: "(경북) 칠구일칠오이육" },
      ],
      footer: "· HINT 2 OF 2 ·",
    },
    /* 12p - 위치 정답 입력 (0127 퀴즈와 동일 UX) */
    {
      bg: "ocean",
      type: "quiz",
      stage: "2단계 퀴즈",
      question:
        "앞선 힌트를 활용하여,\n장소(건물명)를 입력하세요.",
      hint: "📍 메모에 적힌 내용을 조합해 장소명을 입력하세요.",
      placeholder: "장소명 입력",
      answer: "울릉역사문화체험센터",
      answerAlt: [],
    },
    /* 13p - 정답 위치 */
    {
      bg: "ocean",
      type: "correct",
      badge: "📍",
      title: "정답입니다!",
      text: null,
      move: "📌 울릉역사문화체험센터 앞으로 이동하세요.\n단, 건물 안으로 들어가지 않습니다.",
    },
    /* ── 추가: 현판 힌트 메모 ── */
    {
      bg: "ocean",
      type: "memo",
      title: "울릉역사문화체험센터 건물 현판 힌트",
      hints: [
        { num: "1", text: '등록문화재 제<span class="hint-key">___</span>호  → 정답 <span class="hint-key">235</span>호' },
        { num: "2", text: '<span class="hint-key">___</span>층 목재주택  → <span class="hint-key">2</span>층' },
        { num: "3", text: '2008년까지 <span class="hint-key">____</span>년간 개인주택으로 사용됐다  → <span class="hint-key">56</span>' },
        { num: "4", text: '수식 : (힌트1) − (힌트2) − (힌트3) = <span class="hint-key">?</span>' },
      ],
      footer: "· BONUS HINT · 현판을 잘 살펴보세요 ·",
    },
    /* ── 추가: 177 퀴즈 ── */
    {
      bg: "ocean",
      type: "quiz",
      stage: "추가 단계 퀴즈",
      question: "현판 힌트의 수식을 계산하여\n정답 숫자를 입력하세요.",
      hint: "힌트1 − 힌트2 − 힌트3 = ?",
      placeholder: "숫자 입력",
      answer: "177",
      answerAlt: [],
    },
    /* ── 추가: 177 정답 ── */
    {
      bg: "ocean",
      type: "correct",
      badge: "🔢",
      title: "정답입니다!",
      text: "235 − 2 − 56 = 177\n\n정답은 177입니다.",
      move: null,
    },
    /* 전화 3단계 */
    { bg: "ocean", type: "phone", caller: "과거에서 온 전화", callerName: "어부 (전라도)" },
    /* 어부 대화 */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "어이쿠, 참말로 대단허구만... 요것까정 맞춰부릴 줄은 꿈에도 몰랐어이.",
        "내가 미래 양반들헌테 너무 조심조심했는갑소. 거시기, 이해 좀 해주시게나.",
        "개척령이 내려졌다고는 허지만서도, 시방 요 근처에 일본 놈들이 워낙이 득실거릉게 나도 어쩔 수가 없었당게?",
      ],
    },
    /* 나침반 — 북서 310도로 변경 */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "어이구, 시방 내가 멋허느라 요로코롬 넋두리를 길게 늘어놨다냐. 미안허구만잉.",
        "자, 거그 그짝들 손에 들고 있는 나침반 좀 한 번 보드라고.",
        '자네가 시방 서 있는 그 자리에서 말이여, 🧭 <strong class="q1g-dialogue-em">북서 310도</strong> 딱 찍고 가 보드라고.',
        "거그 가면 황금으로 번쩍번쩍한 나를 찾을 수 있을 것인게!",
      ],
    },
    /* 4단계 (식당) */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "미래 양반들, 요로코롬 실제로 보게 되부렁게 징허게 반갑구만잉!",
        "개척령이 시작은 됐다지만, 아직은 살기가 거시기허게 팍팍허네잉.",
        "(꼬르르륵) 아이고매, 내 배때지가 참말로 부끄럽게 난리여.",
        "내가 지금 허기가 져부렀는디, 혹시 저짝 방향에 식당 좀 보이는가 모르겄네.",
        "아따, 고놈 참 실하네잉! 내 저것 좀 허천나게 묵어보고 싶당게!",
      ],
    },
    /* 식당 퀴즈 — 힌트4 추가, 정답 대박식당/따개비칼국수 */
    {
      bg: "ocean",
      type: "quiz",
      stage: "4단계 퀴즈",
      question: "아래 설명에 해당하는 식당과 메뉴를 찾아\n정답을 입력하세요.",
      hint:
        "1. 조개껍데기가 삿갓 모양을 닮아 삿갓조개라고도 불린다.\n2. 전복과 비슷한 풍미를 지녀 작은 전복이라고 불린다.\n3. 거센 파도가 치는 해안가 절벽이나 바위에 서식한다.\n4. 식당 이름은 ㄷㅂㅅㄷ\n\n📍 식당의 위치는 황금 동상의 2시 방향이다.",
      placeholder: "식당명 입력 (예: ○○식당)",
      answer: "대박식당",
      answerAlt: ["따개비칼국수", "대박", "대박 식당"],
    },
    /* 정답 (식당) */
    {
      bg: "ocean",
      type: "correct",
      badge: "🍜",
      title: "정답입니다!",
      text: "대박식당의 따개비칼국수!\n따개비(삿갓조개)는 독도·울릉도 연안\n거센 파도 바위에 서식하는 특산물입니다.",
      move: null,
    },
    /* 전화 + 클리어 */
    { bg: "ocean", type: "phone", caller: "미션 완료 신호", callerName: "이대환 박사" },
    /* 21p - 박사 에필로그 (일반 대사 UI) */
    {
      bg: "lab",
      type: "dialogue",
      char: "doctor",
      charLabel: "검찰일기 이대환 박사",
      stageBadge: "EPILOGUE · BRIEFING",
      lines: [
        "이대환 박사입니다.",
        "현장 학예사를 통해 시그널의 의미를 이해하고 도움을 주셨다는 소리를 들었습니다.",
        "이번에 큰 도움을 받았습니다. 이 은혜를 절대로 잊지 않겠습니다.",
        "감사합니다, 여러분.",
      ],
    },
    /* 22p - 미션 성공 연출 */
    {
      bg: "ocean",
      type: "success",
      charLabel: "검찰일기 이대환 박사",
    },
  ];

  /* ════════════════════════════════════════════════
   GAME ENGINE
════════════════════════════════════════════════ */
  let currentScene = 0;
  let dialogueLine = 0;
  /** 이전 씬으로 돌아올 때 등, 현재 대사 줄을 타이핑 없이 바로 표시 */
  let dialogueEnterInstant = false;
  let typeTimer: ReturnType<typeof setTimeout> | null = null;
  let typing = false;
  let sceneApplyTimer: ReturnType<typeof setTimeout> | null = null;
  let deferTimer: ReturnType<typeof setTimeout> | null = null;
  let quizFocusTimer: ReturnType<typeof setTimeout> | null = null;

  function clearSceneApplyTimer() {
    if (sceneApplyTimer !== null) {
      clearTimeout(sceneApplyTimer);
      sceneApplyTimer = null;
    }
  }
  function clearDeferTimer() {
    if (deferTimer !== null) {
      clearTimeout(deferTimer);
      deferTimer = null;
    }
  }
  function clearQuizFocusTimer() {
    if (quizFocusTimer !== null) {
      clearTimeout(quizFocusTimer);
      quizFocusTimer = null;
    }
  }
  /** 씬 전환·지연 UI 타이머 정리 (빠른 NEXT/PREV 시 이전 타이머가 나중에 실행되는 것 방지) */
  function clearPendingSceneTimers() {
    clearSceneApplyTimer();
    clearDeferTimer();
    clearQuizFocusTimer();
  }

  function setBg(mode: string) {
    bgMode = (mode || "ocean") as BgMode;
    dom.overlay.className = "q1g-overlay q1g-bg-" + bgMode;
  }

  function showStageBadge(text: string | null) {
    if (text) {
      dom.badge.textContent = text;
      dom.badge.style.display = "flex";
    } else dom.badge.style.display = "none";
  }

  function clearSuccessParticleInterval() {
    if (particleIntervalId !== null) {
      clearInterval(particleIntervalId);
      particleIntervalId = null;
    }
  }

  function clearDialogueTyping() {
    if (typeTimer) clearTimeout(typeTimer);
    typeTimer = null;
    typing = false;
  }

  /* ── 씬 전환 ── */
  function gotoScene(
    idx: number,
    instant = false,
    opts?: { dialogueLine?: number; dialogueInstant?: boolean },
  ) {
    clearPendingSceneTimers();
    clearSuccessParticleInterval();
    currentScene = idx;
    if (opts && typeof opts.dialogueLine === "number") {
      dialogueLine = opts.dialogueLine;
    } else {
      dialogueLine = 0;
    }
    dialogueEnterInstant = !!opts?.dialogueInstant;
    clearDialogueTyping();
    const apply = () => {
      if (disposed) return;
      renderScene(SCENES[idx]);
      dom.stage.classList.remove("fade-out");
      dom.stage.classList.add("fade-in");
    };
    if (instant) {
      dom.stage.classList.remove("fade-out");
      apply();
      return;
    }
    dom.stage.classList.add("fade-out");
    sceneApplyTimer = window.setTimeout(() => {
      sceneApplyTimer = null;
      apply();
    }, 500);
  }

  function nextScene() {
    if (currentScene < SCENES.length - 1) gotoScene(currentScene + 1);
  }

  function attachDialogueAdvanceAfterComplete(
    lines: string[],
    el: HTMLElement,
    completedLineIndex: number,
  ) {
    typing = false;
    dom.next.style.display = "block";
    if (completedLineIndex >= lines.length - 1) {
      dom.next.onclick = () => nextScene();
    } else {
      dom.next.onclick = () => {
        dialogueLine = completedLineIndex + 1;
        startTypewriter(lines, el);
      };
    }
    syncPrevVisibility();
  }

  /** 대사 줄에 <strong>...</strong>이 있으면 타이핑 시 본문만 글자 단위, 태그 블록은 통째로 삽입 */
  function lineTypingSegments(line: string): Array<
    { kind: "text"; text: string } | { kind: "html"; html: string }
  > {
    const segments: Array<
      { kind: "text"; text: string } | { kind: "html"; html: string }
    > = [];
    const re = /<strong\b[^>]*>[\s\S]*?<\/strong>/gi;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) segments.push({ kind: "text", text: line.slice(last, m.index) });
      segments.push({ kind: "html", html: m[0] });
      last = m.index + m[0].length;
    }
    if (last < line.length) segments.push({ kind: "text", text: line.slice(last) });
    if (segments.length === 0) segments.push({ kind: "text", text: line });
    return segments;
  }

  function drawFilmDamage(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    const scratchCount = Math.max(16, Math.floor(w / 70));
    for (let i = 0; i < scratchCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const len = h * (0.18 + Math.random() * 0.5);
      const angle = (Math.random() - 0.5) * 0.14;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo((Math.random() - 0.5) * 16, len);
      ctx.strokeStyle = `rgba(255,255,255,${0.08 + Math.random() * 0.18})`;
      ctx.lineWidth = 0.5 + Math.random() * 1.2;
      ctx.stroke();
      ctx.restore();
    }

    const dustCount = Math.max(70, Math.floor((w * h) / 9000));
    for (let i = 0; i < dustCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 0.3 + Math.random() * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,235,220,${0.05 + Math.random() * 0.2})`;
      ctx.fill();
    }
  }

  function attachFilmOverlay(container: HTMLElement) {
    const charArea = container.querySelector<HTMLElement>(".char-area");
    if (!charArea || charArea.querySelector(".film-grain-overlay")) return;

    const filmOverlay = document.createElement("div");
    filmOverlay.innerHTML = `
      <div class="film-grain-overlay"></div>
      <div class="film-light-leak"></div>
      <canvas class="film-scratch-canvas" id="q1g-scratch"></canvas>
    `;
    charArea.appendChild(filmOverlay);

    const scratch = charArea.querySelector<HTMLCanvasElement>("#q1g-scratch");
    if (!scratch) return;

    const redraw = () => {
      scratch.width = charArea.offsetWidth;
      scratch.height = charArea.offsetHeight;
      drawFilmDamage(scratch);
    };
    requestAnimationFrame(redraw);
  }

  function startTypewriter(lines: string[], el: HTMLElement) {
    clearDialogueTyping();
    typing = true;
    dom.next.style.display = "none";
    syncPrevVisibility();
    const line = lines[dialogueLine] || "";
    const segs = lineTypingSegments(line);
    let segIdx = 0;
    let charInSeg = 0;
    el.innerHTML = "";
    const cur = document.createElement("span");
    cur.className = "dialogue-cursor";
    el.appendChild(cur);

    function typeStep() {
      if (disposed) return;
      if (segIdx >= segs.length) {
        attachDialogueAdvanceAfterComplete(lines, el, dialogueLine);
        return;
      }
      const seg = segs[segIdx];
      if (seg.kind === "html") {
        const wrap = document.createElement("span");
        wrap.innerHTML = seg.html;
        el.insertBefore(wrap, cur);
        segIdx++;
        charInSeg = 0;
        typeTimer = setTimeout(typeStep, 40);
        return;
      }
      const t = seg.text;
      if (charInSeg < t.length) {
        el.insertBefore(document.createTextNode(t[charInSeg]), cur);
        charInSeg++;
        const ch = t[charInSeg - 1];
        typeTimer = setTimeout(
          typeStep,
          charInSeg % 5 === 0 && ch === "." ? 180 : 30,
        );
      } else {
        segIdx++;
        charInSeg = 0;
        typeStep();
      }
    }
    typeStep();
  }

  function showDialogueLineInstant(lines: string[], el: HTMLElement, lineIndex: number) {
    clearDialogueTyping();
    dialogueLine = lineIndex;
    const raw = lines[lineIndex] ?? "";
    el.innerHTML = raw.replace(/\n/g, "<br>");
    dom.next.style.display = "block";
    if (lineIndex >= lines.length - 1) {
      dom.next.onclick = () => nextScene();
    } else {
      dom.next.onclick = () => {
        dialogueLine = lineIndex + 1;
        startTypewriter(lines, el);
      };
    }
    syncPrevVisibility();
  }

  function prevScene() {
    const cur = SCENES[currentScene] as any;
    if (cur?.type === "dialogue" && Array.isArray(cur.lines) && dialogueLine > 0) {
      clearDialogueTyping();
      dialogueLine -= 1;
      const el = dom.stage.querySelector(".q1g-dtext") as HTMLElement | null;
      if (el) showDialogueLineInstant(cur.lines, el, dialogueLine);
      return;
    }
    if (currentScene <= 0) return;
    const prevIdx = currentScene - 1;
    const prevS = SCENES[prevIdx] as any;
    if (prevS?.type === "dialogue" && Array.isArray(prevS.lines) && prevS.lines.length > 0) {
      gotoScene(prevIdx, true, {
        dialogueLine: prevS.lines.length - 1,
        dialogueInstant: true,
      });
    } else {
      gotoScene(prevIdx, true);
    }
  }

  function syncPrevVisibility() {
    const cur = SCENES[currentScene] as any;
    const inDialogueMid =
      cur?.type === "dialogue" && Array.isArray(cur.lines) && dialogueLine > 0;
    dom.prev.style.display = currentScene > 0 || inDialogueMid ? "block" : "none";
  }

  /* ── 씬 렌더 ── */
  function renderScene(s: Scene) {
    clearDeferTimer();
    clearQuizFocusTimer();
    setBg((s as any).bg || "ocean");
    dom.next.style.display = "none";
    dom.next.onclick = () => nextScene();
    syncPrevVisibility();
    dom.stage.innerHTML = "";

    switch ((s as any).type) {
      case "narration":
        renderNarration(s as any);
        break;
      case "dialogue":
        renderDialogue(s as any);
        break;
      case "phone":
        renderPhone(s as any);
        break;
      case "memo":
        renderMemo(s as any);
        break;
      case "quiz":
        renderQuiz(s as SceneQuiz);
        break;
      case "correct":
        renderCorrect(s as any);
        break;
      case "success":
        renderSuccess(s as any);
        break;
    }
  }

  /* ── 내러션 ── */
  function renderNarration(s: any) {
    showStageBadge(null);
    const d = document.createElement("div");
    d.className = "narration-scene";
    d.innerHTML = `
    <div class="narration-icon">${s.icon || "📖"}</div>
    <div class="narration-text">${s.text.replace(/\n/g, "<br>")}</div>
    ${s.sub ? `<div class="narration-sub">${s.sub}</div>` : ""}
  `;
    dom.stage.appendChild(d);
    deferTimer = window.setTimeout(() => {
      deferTimer = null;
      if (disposed) return;
      dom.next.style.display = "block";
    }, 800);
  }

  /* ── 대화 ── */
  function renderDialogue(s: any) {
    const stageMap: Record<string, string> = {
      "개척령 시대 · 어부": "STAGE · DIALOGUE",
      "검찰일기 이대환 박사": "INTRO · BRIEFING",
    };
    showStageBadge(
      typeof s.stageBadge === "string" && s.stageBadge.length > 0
        ? s.stageBadge
        : stageMap[s.charLabel] || null,
    );
    const d = document.createElement("div");
    d.className = "dialogue-scene";
    const charVisual = s.char === "fisherman" ? FISHERMAN_CHAR_HTML : DOCTOR_CHAR_HTML;
    d.innerHTML = `
    <div class="char-area">
      ${charVisual}
    </div>
    <div class="dialogue-box">
      <div class="dialogue-name">${s.charLabel || ""}</div>
      <div class="dialogue-text q1g-dtext"></div>
    </div>
  `;
    dom.stage.appendChild(d);
    attachFilmOverlay(d);
    const lines = s.lines as string[];
    const el = d.querySelector(".q1g-dtext") as HTMLElement | null;
    if (!el) return;
    if (dialogueEnterInstant) {
      dialogueEnterInstant = false;
      showDialogueLineInstant(lines, el, dialogueLine);
    } else if (dialogueLine > 0) {
      showDialogueLineInstant(lines, el, dialogueLine);
    } else {
      startTypewriter(lines, el);
    }
  }

  /* ── 전화 ── */
  function renderPhone(s: any) {
    showStageBadge("INCOMING CALL");
    const d = document.createElement("div");
    d.className = "phone-scene";
    const caller = String(s.caller ?? "수신 전화").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const callerName = String(s.callerName ?? "???").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    d.innerHTML = `
    <div class="phone-top">
      <p class="phone-caller-type">${caller}</p>
      <p class="phone-caller-name">${callerName}</p>
    </div>
    <div class="phone-bottom">
      <div class="phone-btn-wrap">
        <button type="button" class="phone-btn phone-btn-reject q1g-reject-btn" aria-label="거절">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08C.11 12.9 0 12.65 0 12.38c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.79-.73-1.68-1.36-2.66-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/></svg>
        </button>
        <span class="phone-btn-label">거절</span>
      </div>
      <div class="phone-btn-wrap">
        <button type="button" class="phone-btn phone-btn-answer q1g-answer-btn" aria-label="응답">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
        </button>
        <span class="phone-btn-label">응답</span>
      </div>
    </div>
  `;
    dom.stage.appendChild(d);

    let settled = false;
    function settle(fn: () => void) {
      if (settled || disposed) return;
      settled = true;
      fn();
    }

    const rejectBtn = d.querySelector(".q1g-reject-btn") as HTMLButtonElement | null;
    const answerBtn = d.querySelector(".q1g-answer-btn") as HTMLButtonElement | null;
    rejectBtn?.addEventListener("click", () => settle(() => prevScene()));
    answerBtn?.addEventListener("click", () => settle(() => nextScene()));
  }

  /* ── 메모 ── */
  function renderMemo(s: any) {
    showStageBadge("CLUE · MEMO");
    const d = document.createElement("div");
    d.className = "memo-scene";
    const hintsHtml = s.hints
      .map(
        (h: { num: string; text: string }) => `
    <div class="memo-hint">
      <span class="hint-num">${h.num}.</span>
      <span class="hint-text">${h.text}</span>
    </div>`,
      )
      .join("");
    d.innerHTML = `
    <div class="memo-paper">
      <div class="memo-torn"></div>
      <div class="memo-title">${s.title || "힌트 메모"}</div>
      <div class="memo-content">${hintsHtml}</div>
      ${s.footer ? `<div class="memo-footer">${s.footer}</div>` : ""}
    </div>
  `;
    dom.stage.appendChild(d);
    deferTimer = window.setTimeout(() => {
      deferTimer = null;
      if (disposed) return;
      dom.next.style.display = "block";
      dom.next.onclick = () => nextScene();
    }, 600);
  }

  /* ── 퀴즈 ── */
  function renderQuiz(s: SceneQuiz) {
    showStageBadge(s.stage || "QUIZ");
    const d = document.createElement("div");
    d.className = "quiz-scene";
    d.innerHTML = `
    <div class="quiz-box">
      <div class="quiz-stage">${s.stage || "QUIZ"}</div>
      <div class="quiz-q">${s.question.replace(/\n/g, "<br>")}</div>
      ${s.hint ? `<div class="quiz-hint">${s.hint.replace(/\n/g, "<br>")}</div>` : ""}
      <input class="quiz-input" placeholder="${s.placeholder || "정답 입력"}" autocomplete="off"/>
      <button type="button" class="quiz-submit">확인 →</button>
      <div class="quiz-wrong">❌ 다시 확인해보세요.</div>
    </div>
  `;
    dom.stage.appendChild(d);

    const inp = d.querySelector(".quiz-input") as HTMLInputElement | null;
    const sub = d.querySelector(".quiz-submit") as HTMLButtonElement | null;
    const wrn = d.querySelector(".quiz-wrong") as HTMLElement | null;

    if (!inp || !sub || !wrn) return;

    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sub.click();
    });

    sub.onclick = () => {
      const val = inp.value.trim();
      if (!val) return;
      if (s.freeform) {
        // 자유 입력 — 비어있지 않으면 통과
        spawnParticles();
        nextScene();
        return;
      }
      const altMatch = s.answerAlt?.includes(val) ?? false;
      const exactMatch = typeof s.answer === "string" && val === s.answer;
      const normMatch =
        typeof s.answer === "string" &&
        val.replace(/\s/g, "").toLowerCase() === s.answer.replace(/\s/g, "").toLowerCase();
      const correct = exactMatch || altMatch || normMatch;
      if (correct) {
        spawnParticles();
        deferTimer = window.setTimeout(() => {
          deferTimer = null;
          if (!disposed) nextScene();
        }, 600);
      } else {
        wrn.style.display = "block";
        wrn.style.animation = "none";
        requestAnimationFrame(() => {
          wrn.style.animation = "shake 0.3s ease";
        });
        inp.style.borderColor = "rgba(255,80,60,0.6)";
        setTimeout(() => {
          inp.style.borderColor = "";
        }, 1000);
      }
    };
    quizFocusTimer = window.setTimeout(() => {
      quizFocusTimer = null;
      if (!disposed) inp.focus();
    }, 300);
  }

  /* ── 정답 ── */
  function renderCorrect(s: any) {
    showStageBadge("CORRECT!");
    spawnParticles();
    const d = document.createElement("div");
    d.className = "correct-scene";
    d.innerHTML = `
    <div class="correct-badge">${s.badge || "✅"}</div>
    <div class="correct-box">
      <div class="correct-title">${s.title || "정답입니다!"}</div>
      ${s.text ? `<div class="correct-text">${s.text.replace(/\n/g, "<br>")}</div>` : ""}
      ${s.move ? `<div class="correct-move">${s.move.replace(/\n/g, "<br>")}</div>` : ""}
      <div class="correct-btns">
        <button type="button" class="correct-yes">다음 문제 →</button>
      </div>
    </div>
  `;
    dom.stage.appendChild(d);
    const cyes = d.querySelector(".correct-yes") as HTMLButtonElement | null;
    if (cyes)
      cyes.onclick = () => {
        nextScene();
      };
  }

  /* ── 미션 성공 (대사는 앞 씬 dialogue에서 처리, 여기서는 타이틀·트로피만) ── */
  function renderSuccess(s: any) {
    showStageBadge("MISSION SUCCESS");
    spawnParticles(80);

    clearSuccessParticleInterval();

    const d = document.createElement("div");
    d.className = "success-scene";
    d.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;color:rgba(160,200,255,0.5);text-transform:uppercase;margin-bottom:8px;">${s.charLabel || "검찰일기 이대환 박사"}</div>
    <div class="success-glow">MISSION SUCCESS</div>
    <div class="success-trophy" role="img" aria-label="미션 완료 트로피, 숫자 6">
      <span class="success-trophy-emoji" aria-hidden="true">🏆</span>
      <span class="success-trophy-six" aria-hidden="true">6</span>
    </div>
    <div style="margin-top:12px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:3px;color:rgba(100,150,200,0.4);">QUIZ 1 · COMPLETE</div>
  `;
    dom.stage.appendChild(d);

    particleIntervalId = setInterval(() => spawnParticles(20), 2000);
    setTimeout(() => {
      clearSuccessParticleInterval();
    }, 12000);
  }

  /* ── 파티클 ── */
  function spawnParticles(n = 40) {
    const colors = ["#f0c040", "#80d0ff", "#a0f0b0", "#ffb0b0", "#d0a0ff"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "q1g-particle";
      const c = colors[Math.floor(Math.random() * colors.length)];
      const tx = (Math.random() - 0.5) * window.innerWidth * 0.6;
      const ty = -(Math.random() * window.innerHeight * 0.5 + 100);
      p.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;background:${c};--tx:${tx}px;--ty:${ty}px;animation-delay:${Math.random() * 0.5}s;animation-duration:${0.6 + Math.random() * 0.8}s;`;
      root.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  }

  /* ── 초기화 ── */
  dom.next.onclick = () => nextScene();
  dom.prev.onclick = () => prevScene();

  resizeBg();
  drawBg();
  const onResize = () => resizeBg();
  window.addEventListener("resize", onResize);

  if (!disposed) gotoScene(0, true);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    if (typeTimer) clearTimeout(typeTimer);
    clearPendingSceneTimers();
    clearSuccessParticleInterval();
    dom.next.onclick = null;
    dom.prev.onclick = null;
  };
}
