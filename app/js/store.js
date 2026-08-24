// store.js — stan gry trzymywany w localStorage (prosta "pamięć przeglądarki")
import { LOOK_BONUS } from './data.js';

const KEY = 'dalia-save-v1';

const DEFAULTS = {
  treats: 0,
  totalEarned: 0,
  looks: [],
  best: { spacer: 0, flappy: 0, platform: 0, memoryMoves: null },
  introSeen: false,
  hubBg: 'park',
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULTS),
      ...parsed,
      best: { ...DEFAULTS.best, ...(parsed.best || {}) },
    };
  } catch {
    return structuredClone(DEFAULTS);
 }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const store = {
  get s() { return state; },

  addTreats(n) {
    state.treats += n;
    state.totalEarned += n;
    save();
    document.dispatchEvent(new CustomEvent('treats'));
  },

  // Wydaje smaczki (np. na jedzenie w Domku Dalii). Nie zmienia totalEarned.
  // Zwraca true, jeśli stać gracza; false, gdy za mało.
  spendTreats(n) {
    if (n <= 0) return true;
    if (state.treats < n) return false;
    state.treats -= n;
    save();
    document.dispatchEvent(new CustomEvent('treats'));
    return true;
  },

  saveLook(name, items) {
    const look = {
      id: 'L' + Date.now().toString(36),
      name: name || ('Look ' + (state.looks.length + 1)),
      items, ts: Date.now(),
    };
    state.looks.push(look);
    state.treats += LOOK_BONUS;
    state.totalEarned += LOOK_BONUS;
    save();
    document.dispatchEvent(new CustomEvent('treats'));
    return { look };
  },

  deleteLook(id) {
    state.looks = state.looks.filter(l => l.id !== id);
    save();
  },

  setBestSpacer(score) {
    if (score > (state.best.spacer || 0)) { state.best.spacer = score; save(); }
  },
  setBestFlappy(score) {
    if (score > (state.best.flappy || 0)) { state.best.flappy = score; save(); }
  },
  setBestPlatform(score) {
    if (score > (state.best.platform || 0)) { state.best.platform = score; save(); }
  },
  setMemoryMoves(moves) {
    if (state.best.memoryMoves == null || moves < state.best.memoryMoves) {
      state.best.memoryMoves = moves; save();
    }
  },
  seenIntro() { state.introSeen = true; save(); },
  setHubBg(id) {
    if (state.hubBg === id) return;
    state.hubBg = id;
    save();
  },
};
