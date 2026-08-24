// dalia-care-store.js — osobny stan Domku Dalii (Pou) w localStorage.
// Klucz odseparowany od głównego zapisu gry, żeby prototyp nie ruszał
// smaczków/rekordów istniejącego huba. Smaczki są współdzielone przez
// główny store (spendTreats), a tutaj trzymamy tylko potrzeby i decay.

const KEY = 'dalia-care-v1';

// Zakres potrzeb: 0..100.
const DEFAULTS = {
  satiety: 70,      // sytość (spada z głodem)
  cleanliness: 80,  // czystość
  happiness: 65,    // szczęście
  energy: 75,       // energia
  asleep: false,    // czy Dalia śpi (sypialnia, zgaszone światło)
  room: 'living',   // ostatnio otwarty pokój
  lastUpdated: Date.now(),
};

// Ile punktów potrzeba spada na godzinę (gdy Dalia nie śpi).
const DECAY_PER_HOUR = {
  satiety: 9,
  cleanliness: 5,
  happiness: 6,
  energy: 7,
};

// Podczas snu energia rośnie, reszta spada wolniej.
const SLEEP_PER_HOUR = {
  satiety: 4,
  cleanliness: 2,
  happiness: 2,
  energy: -22, // ujemny decay = regeneracja
};

// Maksymalny czas, jaki liczymy przy powrocie (żeby po tygodniu
// Dalia nie była totalnie zaniedbana — łagodny cap).
const MAX_CATCHUP_HOURS = 16;

const clamp = (v) => Math.max(0, Math.min(100, v));

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

// Nalicza spadek/regenerację potrzeb od ostatniej aktualizacji.
// Wywoływane przy wejściu na ekran oraz cyklicznie, gdy ekran otwarty.
function applyDecay() {
  const now = Date.now();
  let hours = (now - state.lastUpdated) / 3_600_000;
  if (hours <= 0) { state.lastUpdated = now; return; }
  if (hours > MAX_CATCHUP_HOURS) hours = MAX_CATCHUP_HOURS;

  const rates = state.asleep ? SLEEP_PER_HOUR : DECAY_PER_HOUR;
  state.satiety = clamp(state.satiety - rates.satiety * hours);
  state.cleanliness = clamp(state.cleanliness - rates.cleanliness * hours);
  state.happiness = clamp(state.happiness - rates.happiness * hours);
  state.energy = clamp(state.energy - rates.energy * hours);

  // Auto-wybudzenie, gdy energia pełna.
  if (state.asleep && state.energy >= 100) state.asleep = false;

  state.lastUpdated = now;
  persist();
}

export const careStore = {
  get s() { return state; },

  refresh() {
    applyDecay();
    return state;
  },

  // Zmienia pojedynczą potrzebę o delta (może być ujemna).
  bump(need, delta) {
    if (!(need in DECAY_PER_HOUR)) return;
    state[need] = clamp(state[need] + delta);
    state.lastUpdated = Date.now();
    persist();
  },

  setRoom(room) {
    if (state.room === room) return;
    state.room = room;
    persist();
  },

  setAsleep(v) {
    state.asleep = !!v;
    state.lastUpdated = Date.now();
    persist();
  },

  // Średni dobrostan 0..100 (na razie informacyjnie).
  mood() {
    return Math.round((state.satiety + state.cleanliness + state.happiness + state.energy) / 4);
  },
};
