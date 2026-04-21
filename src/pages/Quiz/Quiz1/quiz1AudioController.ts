const QUIZ1_BGM_SRC = "/mp3/Quiz1/music6.mp3?v=20260421b";
const QUIZ1_BGM_ALT_SRC = "/mp3/Quiz1/music7.mp3?v=20260421b";
const QUIZ1_RINGTONE_SRC = "/mp3/Quiz1/ringtone.mp3?v=20260421b";
const QUIZ1_CRACK_SFX_SRC = "/mp3/Quiz1/crack.mp3?v=20260421";
const QUIZ1_PAPER_SFX_SRC = "/mp3/Quiz1/paper.mp3?v=20260421b";
const QUIZ1_SAGAK_SFX_SRC = "/mp3/Quiz1/sagak.mp3?v=20260421";
const QUIZ1_KUNG_SFX_SRC = "/mp3/Quiz1/kung.mp3?v=20260421";
const QUIZ1_BGM_VOLUME = 1;
const QUIZ1_RINGTONE_VOLUME = 1;
const QUIZ1_SAGAK_VOLUME = 1;
const QUIZ1_SAGAK_GAIN = 1.8;

let bgmAudio: HTMLAudioElement | null = null;
let bgmAltAudio: HTMLAudioElement | null = null;
let ringtoneAudio: HTMLAudioElement | null = null;
let crackSfxAudio: HTMLAudioElement | null = null;
let paperSfxAudio: HTMLAudioElement | null = null;
let sagakSfxAudio: HTMLAudioElement | null = null;
let kungSfxAudio: HTMLAudioElement | null = null;
let paperEndedHandler: (() => void) | null = null;
let quiz1AudioContext: AudioContext | null = null;
let sagakGainNode: GainNode | null = null;
let sagakSourceNode: MediaElementAudioSourceNode | null = null;

function ensureBgmAudio() {
  if (!bgmAudio) {
    bgmAudio = new Audio(QUIZ1_BGM_SRC);
    bgmAudio.loop = true;
    bgmAudio.volume = QUIZ1_BGM_VOLUME;
  }
  return bgmAudio;
}

function ensureBgmAltAudio() {
  if (!bgmAltAudio) {
    bgmAltAudio = new Audio(QUIZ1_BGM_ALT_SRC);
    bgmAltAudio.loop = true;
    bgmAltAudio.volume = QUIZ1_BGM_VOLUME;
  }
  return bgmAltAudio;
}

function ensureRingtoneAudio() {
  if (!ringtoneAudio) {
    ringtoneAudio = new Audio(QUIZ1_RINGTONE_SRC);
    ringtoneAudio.loop = true;
    ringtoneAudio.volume = QUIZ1_RINGTONE_VOLUME;
  }
  return ringtoneAudio;
}

function ensureCrackSfxAudio() {
  if (!crackSfxAudio) {
    crackSfxAudio = new Audio(QUIZ1_CRACK_SFX_SRC);
    crackSfxAudio.loop = false;
  }
  return crackSfxAudio;
}

function ensurePaperSfxAudio() {
  if (!paperSfxAudio) {
    paperSfxAudio = new Audio(QUIZ1_PAPER_SFX_SRC);
    paperSfxAudio.loop = false;
  }
  return paperSfxAudio;
}

function ensureSagakSfxAudio() {
  if (!sagakSfxAudio) {
    sagakSfxAudio = new Audio(QUIZ1_SAGAK_SFX_SRC);
    sagakSfxAudio.loop = false;
    sagakSfxAudio.volume = QUIZ1_SAGAK_VOLUME;
  }
  return sagakSfxAudio;
}

function ensureKungSfxAudio() {
  if (!kungSfxAudio) {
    kungSfxAudio = new Audio(QUIZ1_KUNG_SFX_SRC);
    kungSfxAudio.loop = false;
  }
  return kungSfxAudio;
}

function ensureSagakAmplifier(audio: HTMLAudioElement) {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined")
    return;
  if (!quiz1AudioContext) {
    quiz1AudioContext = new window.AudioContext();
  }
  if (!sagakSourceNode) {
    sagakSourceNode = quiz1AudioContext.createMediaElementSource(audio);
  }
  if (!sagakGainNode) {
    sagakGainNode = quiz1AudioContext.createGain();
    sagakGainNode.gain.value = QUIZ1_SAGAK_GAIN;
    sagakSourceNode.connect(sagakGainNode);
    sagakGainNode.connect(quiz1AudioContext.destination);
  }
}

export function playQuiz1Bgm() {
  const bgm = ensureBgmAudio();
  const bgmAlt = ensureBgmAltAudio();
  const ringtone = ensureRingtoneAudio();
  ringtone.pause();
  ringtone.currentTime = 0;
  bgmAlt.pause();
  bgmAlt.currentTime = 0;
  void bgm.play().catch(() => {
    // Autoplay can be blocked by browser policies.
  });
}

export function restartQuiz1Bgm() {
  const bgm = ensureBgmAudio();
  const bgmAlt = ensureBgmAltAudio();
  const ringtone = ensureRingtoneAudio();
  ringtone.pause();
  ringtone.currentTime = 0;
  bgmAlt.pause();
  bgmAlt.currentTime = 0;
  bgm.currentTime = 0;
  void bgm.play().catch(() => {
    // Autoplay can be blocked by browser policies.
  });
}

export function playQuiz1BgmAlt() {
  const bgm = ensureBgmAudio();
  const bgmAlt = ensureBgmAltAudio();
  const ringtone = ensureRingtoneAudio();
  ringtone.pause();
  ringtone.currentTime = 0;
  bgm.pause();
  bgm.currentTime = 0;
  void bgmAlt.play().catch(() => {
    // Autoplay can be blocked by browser policies.
  });
}

export function restartQuiz1BgmAlt() {
  const bgm = ensureBgmAudio();
  const bgmAlt = ensureBgmAltAudio();
  const ringtone = ensureRingtoneAudio();
  ringtone.pause();
  ringtone.currentTime = 0;
  bgm.pause();
  bgm.currentTime = 0;
  bgmAlt.currentTime = 0;
  void bgmAlt.play().catch(() => {
    // Autoplay can be blocked by browser policies.
  });
}

export function playQuiz1Ringtone() {
  const bgm = ensureBgmAudio();
  const bgmAlt = ensureBgmAltAudio();
  const ringtone = ensureRingtoneAudio();
  bgm.pause();
  bgmAlt.pause();
  void ringtone.play().catch(() => {
    // Autoplay can be blocked by browser policies.
  });
}

export function stopQuiz1Audio() {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
  }
  if (ringtoneAudio) {
    ringtoneAudio.pause();
    ringtoneAudio.currentTime = 0;
  }
  if (bgmAltAudio) {
    bgmAltAudio.pause();
    bgmAltAudio.currentTime = 0;
  }
  if (crackSfxAudio) {
    crackSfxAudio.pause();
    crackSfxAudio.currentTime = 0;
  }
  if (paperSfxAudio) {
    if (paperEndedHandler) {
      paperSfxAudio.removeEventListener("ended", paperEndedHandler);
      paperEndedHandler = null;
    }
    paperSfxAudio.pause();
    paperSfxAudio.currentTime = 0;
  }
  if (sagakSfxAudio) {
    sagakSfxAudio.pause();
    sagakSfxAudio.currentTime = 0;
  }
  if (kungSfxAudio) {
    kungSfxAudio.pause();
    kungSfxAudio.currentTime = 0;
  }
}

export function playQuiz1CrackSfx() {
  const crack = ensureCrackSfxAudio();
  crack.currentTime = 0;
  void crack.play().catch(() => {
    // Playback can be blocked until user interaction is recognized.
  });
}

export function playQuiz1PaperSfx() {
  const paper = ensurePaperSfxAudio();
  const sagak = ensureSagakSfxAudio();
  if (paperEndedHandler) {
    paper.removeEventListener("ended", paperEndedHandler);
    paperEndedHandler = null;
  }
  paperEndedHandler = () => {
    if (!paperEndedHandler) return;
    paper.removeEventListener("ended", paperEndedHandler);
    paperEndedHandler = null;
    ensureSagakAmplifier(sagak);
    if (quiz1AudioContext && quiz1AudioContext.state === "suspended") {
      void quiz1AudioContext.resume().catch(() => {
        // Resume can fail depending on browser policy.
      });
    }
    sagak.currentTime = 0;
    sagak.volume = QUIZ1_SAGAK_VOLUME;
    void sagak.play().catch(() => {
      // Playback can be blocked until user interaction is recognized.
    });
  };
  paper.addEventListener("ended", paperEndedHandler);
  sagak.pause();
  sagak.currentTime = 0;
  paper.currentTime = 0;
  void paper.play().catch(() => {
    // Playback can be blocked until user interaction is recognized.
  });
}

export function playQuiz1KungSfx() {
  const kung = ensureKungSfxAudio();
  kung.currentTime = 0;
  void kung.play().catch(() => {
    // Playback can be blocked until user interaction is recognized.
  });
}
