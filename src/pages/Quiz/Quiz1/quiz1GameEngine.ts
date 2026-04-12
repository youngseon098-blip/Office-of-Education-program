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

  let bgT = 0;
  function drawBg() {
    if (disposed) return;
    bgT += 0.016;
    dom.ctx.clearRect(0, 0, W, H);
    const hor = H * 0.55;

    /* sky */
    if (bgMode === "ocean") {
      const sg = dom.ctx.createLinearGradient(0, 0, 0, hor);
      sg.addColorStop(0, "#01050f");
      sg.addColorStop(0.6, "#050d18");
      sg.addColorStop(1, "#080e16");
      dom.ctx.fillStyle = sg;
      dom.ctx.fillRect(0, 0, W, hor);
      const arc = dom.ctx.createRadialGradient(W * 0.5, hor, 0, W * 0.5, hor, W * 0.4);
      arc.addColorStop(0, "rgba(80,140,220,0.10)");
      arc.addColorStop(1, "rgba(0,0,0,0)");
      dom.ctx.fillStyle = arc;
      dom.ctx.fillRect(0, 0, W, hor);
    } else if (bgMode === "lab") {
      const sg = dom.ctx.createLinearGradient(0, 0, 0, H);
      sg.addColorStop(0, "#020510");
      sg.addColorStop(1, "#040818");
      dom.ctx.fillStyle = sg;
      dom.ctx.fillRect(0, 0, W, H);
      // desk lamp glow
      const lg = dom.ctx.createRadialGradient(W * 0.42, H * 0.38, 0, W * 0.42, H * 0.38, 300);
      lg.addColorStop(0, "rgba(100,160,255,0.08)");
      lg.addColorStop(1, "rgba(0,0,0,0)");
      dom.ctx.fillStyle = lg;
      dom.ctx.fillRect(0, 0, W, H);
    } else {
      const sg = dom.ctx.createLinearGradient(0, 0, 0, H);
      sg.addColorStop(0, "#040204");
      sg.addColorStop(1, "#0a0608");
      dom.ctx.fillStyle = sg;
      dom.ctx.fillRect(0, 0, W, H);
      const ag = dom.ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, 350);
      ag.addColorStop(0, "rgba(120,80,20,0.10)");
      ag.addColorStop(1, "rgba(0,0,0,0)");
      dom.ctx.fillStyle = ag;
      dom.ctx.fillRect(0, 0, W, H);
    }

    /* stars (ocean/museum only) */
    if (bgMode !== "lab") {
      for (const s of bgStars) {
        const al = s.a * (0.4 + 0.6 * Math.sin(bgT * s.s * 60 + s.p));
        dom.ctx.beginPath();
        dom.ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        if (s.bright) {
          dom.ctx.fillStyle = `rgba(220,225,255,${al})`;
          dom.ctx.shadowColor = "rgba(200,215,255,.5)";
          dom.ctx.shadowBlur = 4;
        } else {
          dom.ctx.fillStyle = `rgba(160,175,220,${al * 0.6})`;
          dom.ctx.shadowBlur = 0;
        }
        dom.ctx.fill();
      }
      dom.ctx.shadowBlur = 0;
    }

    /* moon */
    if (bgMode === "ocean") {
      const mx = W * 0.12,
        my = H * 0.12;
      const mg = dom.ctx.createRadialGradient(mx, my, 0, mx, my, 55);
      mg.addColorStop(0, "rgba(200,210,255,0.20)");
      mg.addColorStop(1, "rgba(0,0,0,0)");
      dom.ctx.fillStyle = mg;
      dom.ctx.beginPath();
      dom.ctx.arc(mx, my, 55, 0, Math.PI * 2);
      dom.ctx.fill();
      dom.ctx.fillStyle = "rgba(190,205,255,0.75)";
      dom.ctx.beginPath();
      dom.ctx.arc(mx, my, 18, 0, Math.PI * 2);
      dom.ctx.fill();
      dom.ctx.fillStyle = "#05090e";
      dom.ctx.beginPath();
      dom.ctx.arc(mx + 8, my - 4, 14, 0, Math.PI * 2);
      dom.ctx.fill();
    }

    /* ocean */
    if (bgMode === "ocean") {
      const og = dom.ctx.createLinearGradient(0, hor, 0, H);
      og.addColorStop(0, "#060e1c");
      og.addColorStop(1, "#020510");
      dom.ctx.fillStyle = og;
      dom.ctx.fillRect(0, hor, W, H);
      // moon reflection
      const rc = dom.ctx.createLinearGradient(0, hor, 0, H);
      rc.addColorStop(0, "rgba(130,155,235,0.18)");
      rc.addColorStop(1, "rgba(0,0,0,0)");
      dom.ctx.fillStyle = rc;
      dom.ctx.fillRect(W * 0.06, hor, W * 0.12, H);
      for (let wi = 0; wi < waveDefs.length; wi++) {
        const wv = waveDefs[wi];
        const y = hor + wi * ((H - hor) / 10) + 6;
        dom.ctx.beginPath();
        dom.ctx.moveTo(0, y);
        for (let px = 0; px <= W; px += 4)
          dom.ctx.lineTo(px, y + Math.sin(px * wv.fr + bgT * wv.sp + wv.off) * wv.amp);
        const dr = (y - hor) / (H - hor);
        const wa = Math.max(0, 0.13 - dr * 0.1);
        dom.ctx.strokeStyle = `rgba(100,135,215,${wa})`;
        dom.ctx.lineWidth = 0.8;
        dom.ctx.stroke();
      }
      // horizon line
      dom.ctx.strokeStyle = "rgba(120,155,235,0.12)";
      dom.ctx.lineWidth = 1;
      dom.ctx.beginPath();
      dom.ctx.moveTo(0, hor);
      dom.ctx.lineTo(W, hor);
      dom.ctx.stroke();
      // fog
      for (const f of bgFog) {
        f.x += f.dx;
        f.p += 0.002;
        if (f.x > W + f.w / 2) f.x = -f.w / 2;
        if (f.x < -f.w / 2) f.x = W + f.w / 2;
        const fa = f.a * (0.5 + 0.5 * Math.sin(f.p));
        const fg = dom.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.w / 2);
        fg.addColorStop(0, `rgba(70,95,155,${fa})`);
        fg.addColorStop(1, "rgba(0,0,0,0)");
        dom.ctx.fillStyle = fg;
        dom.ctx.beginPath();
        dom.ctx.ellipse(f.x, f.y, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
        dom.ctx.fill();
      }
    }

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
    /* 14p - 전화 3단계 */
    { bg: "ocean", type: "phone", caller: "과거에서 온 전화", callerName: "어부 (전라도)" },
    /* 15p */
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
    /* 16p - 나침반 (3단계) */
    {
      bg: "ocean",
      type: "dialogue",
      char: "fisherman",
      charLabel: "개척령 시대 · 어부",
      lines: [
        "어이구, 시방 내가 멋허느라 요로코롬 넋두리를 길게 늘어놨다냐. 미안허구만잉.",
        "자, 거그 그짝들 손에 들고 있는 나침반 좀 한 번 보드라고.",
        "자네가 시방 서 있는 그 자리에서 말이여, 🧭 북위 43도에 동경 21도 딱 찍고 가 보드라고.",
        "거그 가면 황금으로 번쩍번쩍한 나를 찾을 수 있을 것인게!",
      ],
    },
    /* 17p - 4단계 (식당) */
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
    /* 18p - 퀴즈2 (식당) */
    {
      bg: "ocean",
      type: "quiz",
      stage: "4단계 퀴즈",
      question: "아래 설명에 해당하는 음식을 찾아 정답을 입력하세요.",
      hint:
        "1. 조개껍데기가 삿갓 모양을 닮아 삿갓조개라고도 불린다.\n2. 전복과 비슷한 풍미를 지녀 작은 전복이라고 불린다.\n3. 거센 파도가 치는 해안가 절벽이나 바위에 서식한다.\n\n📍 식당의 위치는 황금 동상의 2시 방향이다.",
      placeholder: "식당명 · 메뉴명 입력",
      answer: "등대 삿갓조개",
      answerAlt: [],
    },
    /* 19p - 정답2 */
    {
      bg: "ocean",
      type: "correct",
      badge: "🍜",
      title: "정답입니다!",
      text: "삿갓조개(홍합류)는 파도가 거센\n독도 인근 바위에서 자라는\n울릉도의 대표 해산물입니다.",
      move: null,
    },
    /* 20p - 전화 + 클리어 */
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
      dom.badge.style.display = "block";
      dom.badge.textContent = text;
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
      <div class="char-label">${s.charLabel || ""}</div>
      ${charVisual}
    </div>
    <div class="dialogue-box">
      <div class="dialogue-name">${s.charLabel || ""}</div>
      <div class="dialogue-text q1g-dtext"></div>
    </div>
  `;
    dom.stage.appendChild(d);
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
    <div class="phone-device">
      <div class="phone-ripple" aria-hidden="true"></div>
      <div class="phone-screen">
        <div class="phone-screen-title">휴대전화</div>
        <div class="phone-screen-body">
          <p class="phone-line-sub">${caller}</p>
          <p class="phone-line-name">${callerName}</p>
        </div>
        <div class="phone-slide-outer">
          <button type="button" class="phone-slide-track q1g-answer-btn" aria-label="밀어서 통화하기">
            <span class="phone-slide-knob" aria-hidden="true">
              <svg class="phone-slide-knob-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V21c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#22c55e"/>
              </svg>
            </span>
            <span class="phone-slide-label">밀어서 통화하기</span>
          </button>
        </div>
      </div>
    </div>
  `;
    dom.stage.appendChild(d);
    const track = d.querySelector(".q1g-answer-btn") as HTMLButtonElement | null;
    const knob = d.querySelector(".phone-slide-knob") as HTMLElement | null;
    if (!track) return;

    let answered = false;
    function completeAnswer() {
      if (answered || disposed) return;
      answered = true;
      nextScene();
    }

    /* 통화: 손잡이를 오른쪽 끝까지 밀었을 때만 진행 (트랙·손잡이 탭만으로는 넘어가지 않음) */

    /* 손잡이: 오른쪽으로 밀어 통화 */
    if (knob) {
      const knobEl = knob;
      const trackEl = track;
      const labelEl = trackEl.querySelector(".phone-slide-label") as HTMLElement | null;
      let dragStartX = 0;
      let knobStartLeft = 0;
      let dragging = false;
      const maxSlide = () => Math.max(0, trackEl.clientWidth - knobEl.offsetWidth - 12);

      function readKnobX(): number {
        const m = knobEl.style.transform.match(/translateX\(([-0-9.]+)px\)/);
        return m ? parseFloat(m[1]) : 0;
      }

      /** 슬라이드 거리에 비례해 레이블 서서히 숨김 (전체 구간의 앞부분에서 거의 사라짐) */
      function syncSlideLabelOpacity(x: number) {
        if (!labelEl) return;
        const max = maxSlide();
        if (max <= 0) {
          labelEl.style.opacity = "1";
          return;
        }
        const p = x / max;
        const fadeEnd = 0.4;
        labelEl.style.opacity = String(Math.max(0, Math.min(1, 1 - p / fadeEnd)));
      }

      function setKnobX(x: number) {
        const max = maxSlide();
        const clamped = Math.max(0, Math.min(max, x));
        knobEl.style.transform = `translateX(${clamped}px)`;
        syncSlideLabelOpacity(clamped);
        return clamped;
      }

      knobEl.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        e.preventDefault();
        dragging = true;
        dragStartX = e.clientX;
        knobStartLeft = readKnobX();
        syncSlideLabelOpacity(knobStartLeft);
        knobEl.setPointerCapture(e.pointerId);
      });
      knobEl.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - dragStartX;
        setKnobX(knobStartLeft + dx);
      });
      knobEl.addEventListener("pointerup", (e) => {
        if (!dragging) return;
        dragging = false;
        try {
          knobEl.releasePointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        const max = maxSlide();
        const x = readKnobX();
        if (max > 0 && x >= max * 0.52) {
          completeAnswer();
        } else {
          knobEl.style.transform = "translateX(0)";
          syncSlideLabelOpacity(0);
        }
      });
      knobEl.addEventListener("pointercancel", () => {
        dragging = false;
        knobEl.style.transform = "translateX(0)";
        syncSlideLabelOpacity(0);
      });
    }
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
