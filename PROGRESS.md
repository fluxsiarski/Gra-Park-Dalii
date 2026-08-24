# PARK DALII — notatki / handoff dla agenta
Ostatnia aktualizacja: 2026-08-24. Ten plik pozwala kontynuować projekt w nowej sesji bez zgadywania.
Przed pracą: przeczytaj CAŁOŚĆ. Po każdej sesji: zaktualizuj sekcje „W TOKU" i „CHECKLISTA".

## NOWY BACKLOG — HUB I SALON GIER — 2026-08-23 — DO ZROBIENIA
WAŻNE: realizować **ściśle po jednym etapie**. Po każdym etapie zatrzymać się, pokazać użytkownikowi
efekt i zaczekać na akceptację przed rozpoczęciem następnego. Nie wdrażać wszystkich gier/poprawek naraz.

### ETAP 1 ✅ HUB: USUNIĘCIE UBIERANIA DALII — GOTOWE DO AKCEPTACJI 2026-08-23
- Całkowicie usunąć z ekranu hubu możliwość nakładania na psa bandany, czapki, okularów, szalika
  ani żadnych innych elementów garderoby.
- Zostawić samą Dalię i jej obecne zmiany/animacje — one pasują i mają nadal działać.
- Nie usuwać teraz Przymierzalni ani jej kodu. Funkcja zostaje w projekcie w zawieszeniu, ponieważ
  może później dostać inne zastosowanie.
- Efekt do akceptacji: na hubie Dalia nigdy nie ma nakładek ubrań/akcesoriów, a jej animacje działają.
- Wdrożono: usunięta warstwa nakładek z hubu, sterowanie akcesoriami Dalii z Przymierzalni,
  odblokowywanie ich za looki oraz powiązany kod/CSS. Sama Przymierzalnia i ubrania lookboarda zostały.
- Zweryfikowano w przeglądarce: hub działa, Dalia jest bez nakładek, animacje pozycji nadal działają,
  Przymierzalnia otwiera się bez kontrolek akcesoriów psa; brak elementów `#dalia-acc-layer`/`.acc-chip`.
- Cache PWA podniesiony do `dalia-v7`.

### ETAP 2 ✅ HUB: JEDEN PRZYCISK „SALON GIER" — GOTOWE DO AKCEPTACJI 2026-08-23
- Zamiast eksponować każdą grę osobno na hubie dodać jeden czytelny przycisk „SALON GIER".
- Przycisk otwiera osobny ekran/menu ze wszystkimi grami: Spacer, Memory, Flappy Dalia oraz kolejne.
- Przymierzalnię pozostawić na razie w zawieszeniu; przed implementacją ustalić, czy ma być widoczna
  poza Salonem Gier, czy tymczasowo ukryta.
- Efekt do akceptacji: hub jest prostszy, a wszystkie właściwe gry są dostępne z jednego miejsca.
- Wdrożono: hub ma jeden duży przycisk „Salon Gier"; osobny ekran zawiera aktywne karty Spacer,
  Memory i Flappy Dalia oraz zapowiedź „Dalia Skacze" oznaczoną jako „WKRÓTCE".
- Przyciski powrotu ze Spacera i Memory prowadzą do Salonu Gier. Przymierzalnia nie została usunięta
  z projektu, ale jej wejście jest tymczasowo ukryte zgodnie ze statusem „w zawieszeniu".
- Zweryfikowano statycznie: wszystkie trasy `data-go` prowadzą do istniejących ekranów, z hubu nie
  pozostały bezpośrednie wejścia do pojedynczych gier ani Przymierzalni. Serwer lokalny odpowiada 200.
- Cache PWA podniesiony do `dalia-v8`.

### ETAP 3 ✅ NOWA GRA: DALIA SKACZE — GOTOWE DO AKCEPTACJI 2026-08-24
- Gra inspirowana deskorolką z Pou: widok 2D z boku, świat przesuwa się płynnie w prawo.
- Dalia biegnie/jedzie po trawiastych platformach wyrastających z ziemi.
- Gracz skacze w odpowiednim momencie nad przepaściami; wpadnięcie kończy próbę.
- Na trasie umieścić kości do zbierania i wynik/licznik.
- Najpierw wykonać jedną grywalną, mobilną wersję i pokazać ją do akceptacji.
- Wdrożono kompletną grę `app/js/game-platform.js`: endless runner z płynnym przesuwaniem świata,
  generowanymi trawiastymi platformami i przepaściami, fizyką skoku (input buffer + coyote time),
  progresywną prędkością, kośćmi, wynikiem, game over, restartem i powrotem do Salonu Gier.
- Sterowanie: dotyk całego pola gry, duży przycisk SKOK oraz klawiatura (spacja, strzałka w górę, W).
  Rekord zapisuje się trwale w `localStorage` przez `store.setBestPlatform`; migracja save'a uzupełnia
  brakujące `best.platform`. Placeholder w Salonie zastąpiono aktywną kartą „GRAJ".
- Assety przygotowane bez ruszania źródeł: `dalia-run-right.gif` zachowano jako 20-klatkową animację
  (100 ms/klatkę), oczyszczono tło każdej klatki i zapisano jako przezroczysty animowany
  `app/assets/img/dalia/platform-run.webp`; `Bieg (widok z boku).jpeg` i `Skok:Akcja.jpeg`
  oczyszczono do `platform-run.png` i `platform-jump.png`.
- RUNDA POLISH po teście użytkownika: animację biegu przeniesiono do osobnej warstwy DOM nad canvasem,
  dzięki czemu faktycznie zmienia klatki; osobna, wstępnie załadowana poza skoku przełącza się bez
  migania. Usunięto losowe kółka i artefakty tekstur, przebudowano stabilny world-space parallax
  (chmury, wzgórza, płot, drzewa, krzewy), warstwy przepaści, krawędzie i teksturę ziemi.
- Dopracowano skalę i kontakt łap z trawą, dynamiczny cień, hitbox kości oraz balans skoku/szerokości
  przepaści pod telefon. Dekoracje i tekstury używają indeksów świata, więc recykling nie powoduje
  przeskoków ani nagłego znikania.
- E2E mobile 390x844, DPR 2: 14 s ciągłej rozgrywki, 6 skoków i 5 lądowań przez kilka przepaści,
  6 zebranych kości, wynik 262, kontrolowana śmierć przy wyniku 293, zapis rekordu 293, restart od 0
  i powrót do Salonu. Brak błędów konsoli. Dwie klatki animacji po 320 ms różnią się na 34 601 px,
  co potwierdza realną animację zamiast nieruchomego obrazka. Cache PWA podniesiony do `dalia-v11`.
- POPRAWKA NÓG po teście użytkownika: przyczyną nie był draw order platformy (postać jest nad canvasem),
  lecz zbyt agresywna maska assetu, która myliła ciemne dolne partie nóg z cieniem. Ponownie
  przygotowano wszystkie 20 klatek z pełnym wspólnym bounding boxem i zachowaniem osobnych składowych
  nóg; usuwany jest wyłącznie jasny, neutralny cień źródłowy, a subtelny cień kontaktowy gry pozostał.
  Skok i polish planszy bez zmian. E2E 390x844: cztery kolejne, różne klatki biegu pokazują pełny ruch
  nóg nad trawą, prawidłowy kontakt z podłożem, brak migania i błędów konsoli. Cache: `dalia-v13`.

### ETAP 4 ✅ NOWA GRA: FLAPPY DALIA — GOTOWE DO AKCEPTACJI 2026-08-24
- Mechanika jak Flappy Bird, ale sterowaną postacią jest Dalia.
- Dalia przelatuje między różnorodnymi strukturami/przeszkodami.
- Sterowanie ma działać wygodnie dotykiem na telefonie; dodać wynik i ekran końca gry.
- Najpierw wykonać jedną grywalną wersję i pokazać ją do akceptacji.
- Wdrożono kompletną grę `app/js/game-flappy.js`: fizyka lotu (grawitacja + impuls), płynna pętla
  `requestAnimationFrame`, losowane szczeliny, trzy wyglądy struktur, progresywna prędkość/trudność,
  wybaczający hitbox Dalii, kolizje z przeszkodami/sufitem/ziemią oraz naliczanie punktów.
- Sterowanie: dotyk/klik w canvas oraz klawiatura (spacja i strzałka w górę). Pełny przepływ:
  ekran startowy → gra → wynik i rekord → restart lub powrót do Salonu Gier.
- Rekord Flappy zapisuje się w `localStorage` przez `store.setBestFlappy`; migracja starego save'a
  bezpiecznie uzupełnia brakujące pole `best.flappy`.
- Asset `Dalia-character-sheet/Dalia-Move-set/dalia-jetpack.jpeg` oczyszczony z białego tła,
  przycięty, zoptymalizowany i zapisany jako `app/assets/img/dalia/jetpack.png` (720x484).
- Salon Gier: Flappy Dalia jest aktywną kartą „GRAJ" z miniaturą jetpack; tylko platformówka nadal
  ma status „WKRÓTCE". Nie wdrożono platformówki ani zmian Memory.
- PWA: `game-flappy.js` i `jetpack.png` dodane do precache; cache podniesiony do `dalia-v9`.
- E2E mobile 390x844: zweryfikowano Salon → Flappy → start, sterowanie spacją (ujemne `vy`),
  lot przez przeszkody i wynik 2, game over, zapis rekordu 2, restart od wyniku 0, sterowanie dotykiem
  (ujemne `vy`) i powrót do Salonu. Brak błędów JS; jedyne 404 to oczekiwane placeholdery ubrań.
- POLISH JETPACKA: canvasowy emiter zakotwiczony przy obracającej się dyszy dodaje krótki
  żółto-pomarańczowy burst po impulsie oraz subtelne iskry i dym w locie. Pula 72 cząstek,
  aktualizacja delta-time i warstwa pod Dalią/przeszkodami nie zmieniają fizyki ani hitboxów.
- E2E mobile 390x844, DPR 2: Space i dotyk uruchamiają burst, 4,67 s ciągłego lotu / 8 impulsów,
  wynik 2, naturalna kolizja, wygaszenie 6→0 cząstek po game over i powrót emisji po restarcie.
  Maks. 32/72 aktywnych; 350 próbek klatek, p95 8,9 ms; brak błędów konsoli.

### ETAP 5 ✅ POPRAWA GRY MEMORY — GOTOWE DO AKCEPTACJI 2026-08-24
- Wymienić obecne niedopasowane zdjęcia: nie mogą wychodzić poza karty ani być źle kadrowane.
- Dobrać spójne ujęcia Dalii i poprawne kadrowanie we wszystkich kartach.
- Dodać wyraźniejszą, bardziej satysfakcjonującą animację po poprawnym dopasowaniu pary.
- Wdrożono kompletną przebudowę Memory: **10 par / 20 kart** w każdej turze.
- Skład obowiązkowy: wszystkie 5 produktów z `Rzeczy-tematyczne/Jedzenie/` + obie fotografie
  z `Rzeczy-tematyczne/1670 /` + losowe 3 z 4 PNG Dalii z `Dalia-Move-set`.
- Assety zoptymalizowane w `app/assets/img/memory/` (food, photos-1670, dalia); oryginały nietknięte.
- Kadrowanie tierowe: produkty `contain`, fotografie `cover`, Dalia `contain`; siatka 4×5 z przewijaniem.
- UX: odwracanie, glow/pop przy match, shake przy błędzie, `#memory-best`, nagroda 50 (+15 bonus ≤24 ruchów).
- E2E mobile 390×844: skład talii, brak 404, ukończenie, restart, powrót do Salonu — OK.

### ASSETY DO NOWYCH GIER
- Źródło nowych zdjęć, animacji i grafik do gier znajduje się w
  `Dalia-character-sheet/Dalia-Move-set/`.
- Folder zawiera materiały przydatne do platformówki (`dalia-run-right.gif`, `Skok:Akcja.jpeg`,
  `Bieg (widok z boku).jpeg`), Flappy Dalia (`dalia-jetpack.jpeg`) oraz Memory (cztery pozy PNG:
  smutna, szczęśliwa, ukłon i śpiąca). Przy wdrażaniu każdej gry najpierw korzystać z tych assetów.

## W TOKU — INTRO: billboardy ze zdjęciami — 2026-08-24 — GOTOWE DO AKCEPTACJI
- Przy jezdni (VW T1 i pociąg tak samo) stoją pixel-artowe billboardy z pięcioma zdjęciami użytkownika.
- Rama/słupy/żarówki są pixel-art; samo zdjęcie jest `cover` w ramie, z wygładzaniem, bez pikselozy.
- 7 slotów od początku trasy: 38, 95, 250, 325, 510, 585, 775 m; boki L/P mieszane; pierwsze 5 slotów = wszystkie 5 zdjęć (tasowanie `hash`).
- Drzewa, sosny i krzaki nie stawiają się w korytarzu 52 m przed / 22 m za billboardem po tej samej stronie; tablice rysują się nad resztkami roślin.
- Assety: `app/assets/img/billboards/{goggles,couple,theater,kayak,heart}.jpg`. Cache `dalia-v20`.
- E2E 390×844: bus i pociąg, wszystkie 5 zdjęć na trasie od startu, 0 błędów JS, 0 404 na billboardach.

## POPRZEDNIA SESJA — INTRO retro: poprawki (3 taski, runda 2) — 2026-08-23 — WSZYSTKIE 3 TASKI ZROBIONE ✅
Kontekst: po rundzie 1 (drzewa/pola, skrócenie trasy, skład 4-członowy) użytkownik zlecił 3 kolejne
poprawki. Wszystkie w jednym podejściu, zweryfikowane e2e (zrzuty t6-*.png w /tmp/opencode).

### TASK 1 ✅ START ZAWSZE OD POCZĄTKU TRASY
- `app/js/game-intro.js`: `startDrive()` woła teraz `reset()` PRZED `mode='drive'` — ekran tytułowy
  nadal „żyje" (pojazd jedzie w tle, camZ rośnie ~9 m/s), ale kliknięcie START cofa trasę do zera,
  więc nic nie jest pominięte (e2e: camZ 99 m przed → 4 m po kliknięciu, HUD „TRZEBNICA 186 m").
- Dodany mini-hook debugowy `window.__intro = { z(), m(), warp(v) }` (initIntro) — do e2e puppeteer
  (odczyt camZ/trybu + przeskoki trasy); nie przeszkadza w grze.

### TASK 2 ✅ DŁUŻSZE WAGONY
- Nowe sprite'y `trainRear()` i `trainCar()` — 36x24 (były 24x24, kwadratowe = „króciutkie").
- Nowe stałe `CAR_W=0.84, CAR_H=0.56` (jednostki świata); drawTrainCars rysuje w=CAR_W*s,
  h=CAR_H*s; drawBus: szer. tylnego wagona CAR_W. Wysokość bez zmian (0.56) → sprzęganie składu
  (k = CAM_H/(CAM_H-CAR_H)) dalej idealne: tylny wagon + 3 wagony w łańcuchu, bez luk.

### TASK 3 ✅ WIĘCEJ STRUKTUR 3D, KONIEC BIOMÓW
- USUNIĘTE złote pasy pól: stałe FIELDS/FIELD_LEN wywalone, drawRoad z powrotem zwykła zieleń
  (naprzemienne '#8FBF6B'/'#84B25F' co STRIPE).
- Nowe sprite'y: `sprPine()` 14x22 (ciemna sosna), `sprWheat()` 12x14 (kęps pszenicy),
  `sprBush()` 14x10 (krzak z czerwonymi jagodami), `sprRock()` 12x8 (głaz).
- Nowa stała `SCATTER` = lista konfiguracji slotów (kind/gap/seed/keep/off/sc): drzewo co 27 m
  (keep .74), sosna 31 m (.55), PSZENICA 12 m (.80, clump:true → kępy po 1-3 kępsów z jitterem
  z/off/skali), krzak 37 m (.62), głaz 53 m (.50). Wszystko przez hash() (stabilne między klatkami),
  wspólna lista `items` + sort z desc (poprawne nakładanie), cutoff zRel>=1.2, zabytki dalej z ZBOOST.
- Flaga `spritesReady` (true w buildSprites) strzeże generatora slotów (pierwsze ~1.6 s przed fontami).

- `app/sw.js`: cache 'dalia-v5'→'dalia-v6'.
- E2E (t6-shot.js w /tmp/opencode; wzorce: t5c-full.js): reset startu OK, Trzebnica zwalnia do
  55 km/h, skład sprzęgnięty i WYRAŹNIE dłuższy (title-train, consist, wroclaw), pszenica/sosny/
  krzaki/głazy widoczne na trasie, KONIEC TRASY + auto-go hub OK, 0 błędów JS (bus i train).

## POPRZEDNIA SESJA — INTRO retro: poprawki (3 taski, runda 1) — 2026-08-23 — ZAKOŃCZONE ✅

### TASK 1 ✅ DRZEWA + ZŁOTE POLA ZBOŻA
- `app/js/game-intro.js`: nowy sprite `sprTree()` (16x20, liściaste; jedyny projekt, powtarzany) +
  `hash(n)` (deterministyczny pseudo-los, stabilny między klatkami).
- Pola: paleta `FIELDS` (4 pary kolorów: zieleń / pszenica jasna / zboże ciemne / zieleń żółtawa),
  `FIELD_LEN=140` — trawa w drawRoad() wybiera parę wg `floor(z/FIELD_LEN) % FIELDS.length`
  (działa dla busa i torów). Dalsze wzgórza na horyzoncie zostają zielone (celowo).
- Drzewa w drawRoadside(): sloty co `TREE_GAP=27` m niezależnie dla L/P; obecność hash<=0.74,
  offset od krawędzi 0.55..2.45 j., skala 0.75..1.30 (bw=1.35, bh=1.7 j. * sc). Wrzucone do WSPÓLNEJ
  listy `items` ze znakami/zabytkami i sortowane z desc (poprawne nakładanie); drzewa BEZ ZBOOST,
  cutoff zRel>=1.2. Straż `!TREE` w generatorze slotów (pętla startuje przed buildSprites — bez tego
  drawImage(undefined) w first ~1.6 s; NAPRAWIONE po pierwszym teście).
  UWAGA (runda 2): FIELDS/FIELD_LEN usunięte, drzewa weszły do konfiguracji SCATTER — patrz wyżej.

### TASK 2 ✅ SKRÓCENIE TRASY
- PLACES z: 220/660/1100 → **190/450/710** (odstępy 440→260 m; cała trasa ~1270→~880 m).
- SLOW_BEFORE 150→100 (między zabytkami zostaje ~120 m pełnej prędkości; SLOW_AFTER=40 bez zmian).
- Zmierzony czas jazdy do bannera KONIEC: **39.2 s** (było wyraźnie dłużej). Finish/auto-go hub OK.

### TASK 3 ✅ POCIĄG: SKŁAD 4-CZŁONOWY
- Nowy sprite `trainCar()` 24x24 (wagon środkowy: biały, pas okien, drzwi, żółta fala KD; bez
  czarnej maski i czerwonych świateł — te ma tylko wagon tylny TRAIN_REAR).
- `drawTrainCars(t)` wołane w render() PRZED drawBus(): 3 wagony (CAR_N=3) na głębokościach
  geometrycznych 1.7*k^n, k=CAM_H/(CAM_H-0.56)≈1.42 — dobrane tak, by sprite'y wizualnie SPRZĘGŁY
  się w łańcuch (billboardy w tej pseudo-3D mają luki przy liniowych odstępach!). Bob per wagon.
  Widoczne też na ekranie tytułowym. Guard `!TRAIN_CAR` jak dla drzew.
  UWAGA (runda 2): sprite'y przerysowane na 36x24, stałe CAR_W=0.84/CAR_H=0.56 — patrz wyżej.

- `app/sw.js`: cache 'dalia-v4'→'dalia-v5'.
- E2E (puppeteer, zrzuty t5-*.png / t5b-* / t5c-* w /tmp/opencode): skład sprzęgnięty na torach,
  pola złote przy ratuszu i PKiN, drzewa po obu stronach, HUD TRZEBNICA 144 m już po ~1.3 s,
  zwalnianie 54 km/h przy zabytku działa, bus: asfalt+skręt boczny OK (uwaga: bus testowany w
  ŚWIEŻYM incognito kontekście — evaluateOnNewDocument ustawiające 'train' nadpisuje localStorage
  po reloadzie w tej samej stronie!), finish 39.2 s, auto-go hub, 0 błędów JS.

## POPRZEDNIA SESJA — INTRO retro poprawki 1-4 — 2026-08-23 — ZAKOŃCZONE ✅
Kontekst: retro intro (jazda VW T1) już działało (opis niżej). Użytkownik zlecił 4 poprawki,
pracujemy TASK PO TASKU — po każdym sprawdza efekt na telefonie i dopiero wtedy zgadza się na następny.
NIE ROBIĆ WSZYSTKIGO NARAZ.

### TASK 1 ✅ SZEROKA DROGA
- `app/js/game-intro.js`: ROAD_W 0.46→0.80 (~1.7x); znaki/zabytki odsunięte relatywnie do krawędzi
  (w drawRoadside: `it.kind==='s' ? ROAD_W+1.1 : ROAD_W+0.6+bw/2`); clamp skrętu ±0.44→±0.55,
  mnożnik toucha 1.5→1.9 (2 miejsca: update() i bindInput point()).

### TASK 2 ✅ AUTOMATYCZNE ZWALNIANIE PRZY ZABYTKACH
- `app/js/game-intro.js`: SPEED 42→36 (cruise ~130 km/h); nowe stałe SLOW=15 (54 km/h),
  SLOW_BEFORE=150, SLOW_AFTER=40. W update(): `const zone = PLACES.find((p) => camZ > p.z-SLOW_BEFORE && camZ < p.z+SLOW_AFTER); if (zone) target=SLOW;`
  (w trybie drive). Dostrojenie = 3 liczby: SPEED/SLOW/SLOW_BEFORE.

### TASK 3 ✅ WYBÓR POJAZDU (VW T1 / KD IMPULS)
- `app/index.html`: `.veh-pick` z dwoma `.veh-card` (data-veh="bus"/"train") NAD przyciskiem START;
  podglądy = ZDJĘCIA (nie pixel-art): `assets/img/vehicles/vw-t1.jpeg` (niebiesko-kremowy T1,
  skopiowany z Rzeczy-tematyczne/Volkswagen-bus-zdjecia/Volkswagen-bus.jpeg) i
  `assets/img/vehicles/kd-impuls.jpeg` (z Pojazdy/pociąg-koleje-dolnośląskie.jpeg).
- `app/js/game-intro.js`: stan `vehicle` ('bus'|'train'), zapis w localStorage klucz `dalia-veh`;
  nowy sprite `trainRear()` 24x24 (biały Impuls: czarna maska z szybą, żółta fala, czerwone logo KD,
  czerwone światła tylne); drawBus() obsługuje train (tylko widok tyłu, rot *0.05, szer 0.56*s).
  Wybór kafelka: click → vehicle + localStorage + klasa .selected (bindowanie w initIntro).
- `app/css/style.css`: kafelki duże mobile-first (flex, obrazki aspect 4/3, złota ramka .selected).
- `app/sw.js`: cache 'dalia-v2'→'dalia-v3', dodane oba zdjęcia pojazdów do ASSETS.
- Zweryfikowane e2e: wybór działa, pociąg jeździ (na razie po asfalcie i MOŻE SIĘ SKRĘCAĆ — celowe),
  wybór przetrwał reload, 0 błędów JS.

### TASK 4 ✅ POCIĄG: TORY + BRAK SKRĘCANIA
- `app/js/game-intro.js`: nowe stałe BALLAST_HW=0.55, TIE_HW=0.40, TIE_GAP=8, TIE_LEN=3.4,
  RAIL_GAUGE=0.42 (world units). drawRoad(): gałąź `vehicle==='train'` — trawa jak była, potem
  tłuczeń (szary, odcień zależny od stripe), podkłady (ciemne poprzeczki gdy `z % TIE_GAP < TIE_LEN`),
  2 szyny (ciemna baza + jasny rdzeń = „błysk") w rozstawie RAIL_GAUGE wyśrodkowane; rumble strips
  i linie jezdni POMINIĘTE (continue). Słupki zostają. Bus = stara ścieżka bez zmian.
- update(): w trybie drive dla train wymuszone `targetX = 0; steerIn = 0` (każdą klatkę — nadpisuje
  input ze strzałek/dotyku). bindInput bez zmian. Zwalnianie przy zabytkach działa tak samo (wspólne).
- `app/sw.js`: cache 'dalia-v3'→'dalia-v4' (zmiana game-intro.js).
- E2E (puppeteer, zrzuty t4-a..f w /tmp/opencode): title z wybranym KD (tory już w tle),
  jazda po torach (tłuczeń/podkłady/szyny OK, brak linii drogi), ArrowRight trzymane 1.2 s →
  pociąg idealnie na osi, touch x=340 → bez reakcji, Trzebnica: 54 km/h (=SLOW) przy 54 m przed,
  regresja busa: asfalt+skręcanie z widokiem bocznym OK. 0 błędów JS.
UWAGA narzędziowa: po zmianie plików `node --check` na kopii .mjs (ES modules); serwer: python3
-m http.server 8642 w app/ (zwykle już działa, sprawdzić curl); zrzuty puppeteer-core + systemowy
Chrome, viewport 390x844 dsf=2 (wzorce: /var/folders/.../T/opencode/t3e-shot.js — patrz PUŁAPKI niżej).

## POPRZEDNIA SESJA — INTRO (retro wyścig) — 2026-08-23 — ZAKOŃCZONE ✅
Zamiana starego ekranu powitalnego na retro-wyścig (styl automatów/OutRun): VW T1 (niebiesko-kremowy,
wg zdjęć w Rzeczy-tematyczne/Volkswagen-bus-zdjecia) jedzie prostą pseudo-3D drogą i mija po kolei:
Trzebnica (ratusz — pixel-art wg zdjęcia Rzeczy-tematyczne/Trzebnica/Ratusz_w_Trzebnicy.jpg) ->
Warszawa (PKiN) -> Wrocław (most Grunwaldzki, niebieski). Przy każdym miejscu zielony znak (biały napis,
font Press Start 2P) + pixel-artowy zabytek po tej samej stronie drogi. Odstępy: znak 55 m przed
zabytkiem, zabytki co 440 m przy SPEED=42 m/s (=> ~4.8 s widoczności + ~5.7 s przerwy po zniknięciu
za kamerą). Skręt: przy trzymaniu steru (steerIn ±1 z klawiatury/toucha) widok z BOKU (flip L/P),
po puszczeniu powrót do widoku tyłem z rotacją. Dedykacja na tytule: „dla Oliwii". Intro włącza się
ZA KAŻDYM uruchomieniem (boot() zawsze go('screen-intro')); POMIŃ widoczny w trakcie jazdy;
po Wrocławiu banner KONIEC TRASY i auto-go hub po 2.6 s.

ZROBIONE I ZWERYFIKOWANE E2E (zrzuty: title/drive/turn-L+R/trzebnica/warszawa/wroclaw/finish/hub):
- app/js/game-intro.js — cały silnik; pixel-art w kodzie (busRear 24x20, busSide 36x16 + flip,
  sprRatusz 34x30, sprPkin 26x34, sprMost 36x22, makeSign 84x32, makeSun). Kluczowe stałe (STAN PO
  TASKACH 1-2, patrz wyżej): CAM_H=1.9, ROAD_W=0.80, SPEED=36, SLOW=15, DRAW_Z=200, ZBOOST=0.65
  (sprite'y zabytków „zbliżone" — bez tego są micro-scopie przy horyzoncie), PLACES z=220/660/1100.
- app/index.html — nowy #screen-intro (canvas + .crt + btn-skip + intro-title + intro-finish),
  font Press Start 2P dodany do linku Google Fonts.
- app/css/style.css — blok INTRO podmieniony na retro (.crt scanlines+winieta, .btn-skip,
  .intro-title, .it-*, .btn-start, .blink, .intro-finish); stary .intro-card usunięty.
- app/js/app.js — import+init initIntro({onScreen, go}); boot(): usunięty listener #btn-enter
  i gating introSeen — zawsze go('screen-intro').
- app/sw.js — CACHE 'dalia-v2', './js/game-intro.js' w ASSETS.
- Regresja e2e: intro->skip->hub->memory->hub->spacer START — OK, 0 błędów JS.

UWAGI NA PRZYSZŁOŚĆ:
- Sterowanie dotykowe: targetX z pozycji palca (clamp ±0.44); steerIn ustawiany w point() gdy
  |targetX-busX|>0.06; decay po 700 ms bez inputu.
- Sprite'y to pierwsza wersja „na wyczucie" — użytkownik jeszcze nie oceniał; możliwe poprawki
  kształtu ratusza/PKiN/mosta na jego uwagi (funkcje sprRatusz/sprPkin/sprMost — proste fillRect).

## CEL
Niespodzianka dla Oli (dziewczyny użytkownika): mobilna gra-PWA „Park Dalii".
- Olivia = stylistka UBRAN (nie fryzjerka). Jej pies: Dalia (character sheety w `Dalia-character-sheet/`).
- Przepływ: Intro (dedykacja) → Hub = park SVG z Dalią → 3 gry: Spacer (snake), Przymierzalnia (lookboard stylistki), Memory (pyszczki Dalii).
- Waluta: smaczki. Zapis looka +15; memory ukończone +50 (bonus do +65). `totalEarned` odblokowuje ubrania (unlockAt w data.js).
- Akcesoria Dalii od liczby zapisanych looków (DALIA_ACC): bandana@1, cap@2, glasses@3, scarf@4. Wyposażone widać na Dalii na hubie.

## DECYZJE UŻYTKOWNIKA
- Grafiki ubrań generuje AI (styl zgodny ze sheetem); agent dostarcza listę promptów → PROMPTY-grafiki.md (DO NAPISANIA). Do czasu podmiany: inline SVG placeholdery (js/svg.js).
- Brak deadline'u; lekka personalizacja; dystrybucja jako PWA („Dodaj do ekranu domowego").

## STACK / URUCHOMIENIE
- Vanilla HTML/CSS/JS (ES modules). Canvas tylko Spacer. localStorage klucz `dalia-save-v1`.
- Serwer: `python3 -m http.server 8642` w katalogu `app/` (sprawdź `curl localhost:8642`; jak nie działa, odpal w tle).
- sw.js cache='dalia-v1', rejestracja tylko przy https (na http celowo pomijana).

## SPRITE PIPELINE
`tools/extract_assets.py` (venv: /var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode/olivia-venv):
flood-fill tła od brzegów, mediana koloru tła, TOL=52 (v3 jpeg TOL=64, MIN_KEEP_FRAC=0.07), auto-trim, feather alpha.
→ 28 PNG w app/assets/img/dalia/. Pominięto rząd rotacji v3 (ramki kierunkowe łapią białe tło).
Ikony PWA 192/512 generowane z expr-happy. UWAGA: expr-cry wymagał re-cropu 244x292 (zanieczyszczenie) — nie cofać speców.

## ZROBIONE (zweryfikowane zrzutami z puppeteer)
- Wycięte sprite'y Dalii (28), ikony PWA, contact sheet do wglądu.
- Cały kod: index.html (intro/hub/spacer/przy/memory), css/style.css, js/{app,data,store,svg,game-spacer,przymierzalnia,memory}.js, manifest.json, sw.js.
- Naprawione wcześniej: słońce vs licznik smaczków; expr-cry re-crop; overlay img height min(26vh,200px)/max-width 72vw; „Ojej!" używa expr-surprise; kolory ikony galerii (#C9A177/#D96C5F); polskie odmiany („smaczków", progres chipów „0/N looków"); usunięty podwójny listener [data-go] w app.js.
- Memory działa (+40 smaczków). Nawigacja hub↔gry OK.

## NAPRAWIONE / DOMKNIĘTE (2026-08-23)
BUG przymierzalni (chipy nakrywały „Zapisz look") — naprawiony CSS-em i ZWERYFIKOWANY e2e
(shoot2.js): TREATS ON HUB = 55 (40 memory + 15 za look), bandana odblokowana i wyposażona.
Pozycje nakładek akcesoriów Dalii na hubie przeliczone z pomiarów getBoundingClientRect()
(warstwa #dalia-acc-layer = cały .dalia-stage 390x607, NIE sam pies) i zweryfikowane wizualnie
wszystkie 4 (probe-acc.js). Końcowe % w style.css: bandana top39%/w50%, cap 32%/46%,
glasses 49%/39%, scarf 60%/47%.

## PUŁAPKI NARZĘDZIOWE (ważne!)
- Write/bash mają limit ~2.5-3KB na wywołanie → długie pliki pisać partiami heredoc `cat >>`.
- `node --check` wymaga ES modules → skopiować plik .js do /tmp jako .mjs przed sprawdzeniem składni.
- Headless Chrome ignoruje --window-size<500 → używać puppeteer-core + systemowy Chrome
  (/Applications/Google Chrome.app/Contents/MacOS/Google Chrome), viewport 390x844 deviceScaleFactor 2.
- page.click('[data-go=...]') łapie PIERWSZY element w DOM (może być na ukrytym ekranie!) → selektory zakresowe: '#screen-X [data-go="..."]'. Modale przykrywają topbar → klikać przyciski modala („Do parku" = '#mem-over [data-go="screen-hub"]').
- 404 w konsoli dla assets/img/clothes/*.png są OCZEKIWANE (fallback do SVG placeholdera).

## STATUS KOŃCOWY (2026-08-23)
1. [x] Re-test e2e flow — OK (+15 za look, bandana unlock@1, chip działa, Dalia na hubie z bandaną).
2. [x] Zrzuty zweryfikowane: memory-done (+40), gameover, saved — wszystkie poprawne.
3. [x] Pozycjonowanie akcesoriów Dalii na hubie — przeliczone i zweryfikowane wizualnie (4/4).
4. [x] README.md — uruchomienie, deploy PWA, podmiana grafik AI.
5. [x] PROMPTY-grafiki.md — prompty dla wszystkich 24 itemów + instrukcja podmiany.
6. [x] Testy skopiowane do repo: tools/e2e/ (shoot2.js, probe-acc.js, probe-rect.js).
7. [x] app/debug.html — usunięty za zgodą użytkownika.

PROJEKT GOTOWY DO ODEBRANIA. Wszystkie punkty checklisty zamknięte.

## ISTOTNE PLIKI
- Dalia-character-sheet/ — oryginalne arkusze (NIE RUSZAĆ): dalia-v1.png 1214x1295, dalia-v2.png 1209x1300, dalia-v3.jpeg 1888x2242
- tools/extract_assets.py — SPECS frakcyjne; rerun nadpisuje PNG-i
- app/index.html — ekrany + gallery-panel (.gallery-card wrapper)
- app/css/style.css — sloty boarda %: hat 13 / glasses 30 / top 50 / bottom 76 / acc 62 (spójne z SLOT_POS w przymierzalnia.js); media ≥560px owija w .phone-frame
- app/js/data.js — ITEMS=24 (id/cat/name/unlockAt/svg), CATS, DALIA_ACC, FACES, LOOK_BONUS=15
- app/js/store.js — localStorage `dalia-save-v1`; addTreats/saveLook/deleteLook/equipAcc/setBest*
- app/js/app.js — router go()/onScreen(), buildPark() SVG parku, startDaliaIdle(), renderDaliaAcc(), refreshTreats()
- app/js/svg.js — svgSymbols1..9 + mountSvg() + svgUse(id)
- app/js/game-spacer.js — snake: swipe+klawiatura; bench/tree śmiertelne, puddle spowalnia; głowa=top-down.png
- app/js/przymierzalnia.js — taby kategorii, toggleEquip, SLOT_POS, galeria looków, chipy DALIA_ACC
- app/js/memory.js — 6 par FACES, timer, +40

- Testy e2e: tools/e2e/ w repo (shoot2.js = pełny flow, probe-acc.js/probe-rect.js = akcesoria)
