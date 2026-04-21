import { BASE } from "../../../utils/base";

let introAudio: HTMLAudioElement | null = null;
const activeOwners = new Set<string>();
let stopTimer: number | null = null;
const INTRO_AUDIO_SRC = `${BASE}mp3/Quiz2/intro.mp3?v=20260420`;
let unlockListenerBound = false;

function ensureAudio() {
  if (introAudio) return introAudio;
  introAudio = new Audio(INTRO_AUDIO_SRC);
  introAudio.loop = true;
  return introAudio;
}

function syncPlayback() {
  const audio = ensureAudio();
  if (activeOwners.size > 0) {
    if (stopTimer != null) {
      window.clearTimeout(stopTimer);
      stopTimer = null;
    }
    void audio.play().catch(() => {
      // 브라우저 자동재생 정책으로 재생이 막힐 수 있음
    });
    return;
  }
  if (stopTimer != null) return;
  stopTimer = window.setTimeout(() => {
    if (activeOwners.size > 0) {
      stopTimer = null;
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    stopTimer = null;
  }, 250);
}

function bindAutoplayUnlockListener() {
  if (unlockListenerBound) return;
  unlockListenerBound = true;

  const unlock = () => {
    syncPlayback();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
    unlockListenerBound = false;
  };

  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchstart", unlock, { passive: true });
}

export function enableIntroAudio(owner: string) {
  activeOwners.add(owner);
  syncPlayback();
  bindAutoplayUnlockListener();
}

export function disableIntroAudio(owner: string) {
  activeOwners.delete(owner);
  syncPlayback();
}

export function retryIntroAudioPlayback() {
  syncPlayback();
}
