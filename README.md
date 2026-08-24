# Gra Park Dalii 🐾

Mobilna gra-PWA (niespodzianka dla Oliwii): retro intro-wyścig + wirtualny park z pieskiem Dalią.
Intro to mini-wyścig w stylu automatów lat 80.: VW T1 (niebiesko-kremowy) jedzie prostą drogą
i mija po kolei **Trzebnicę** (ratusz), **Warszawę** (PKiN) i **Wrocław** (most Grunwaldzki) —
każde miejsce z zielonym znakiem drogowym i pixel-artowym zabytkiem. Sterowanie: przeciąganie
palcem / strzałki; przy skręcie bus pokazuje bok. POMIŃ przeskakuje do parku.

## Mini-gry
- **Spacer** – „snake": prowadź Dalię po trawie, zbieraj kości (uważaj na przeszkody).
- **Przymierzalnia** – lookboard stylistki: składaj looki z 24 ubrań; każdy zapisany look = +15 smaczków i postęp odblokowań akcesoriów Dalii.
- **Memory** – 10 par: produkty spożywcze, fotografie i pozy Dalii (+50 smaczków, bonus do +65).

## Uruchomienie (macOS)

```bash
cd app
python3 -m http.server 8642
# otwórz http://localhost:8642
```

Wymagany serwer (nie otwieraj index.html z dysku) – Service Worker i moduły tego potrzebują.

## Instalacja na telefonie (PWA)
- **iPhone/Safari**: Udostępnij → „Do ekranu domowego".
- **Android/Chrome**: menu ⋮ → „Dodaj do ekranu głównego".

## GitHub Pages
Repozytorium ma gotowy workflow `.github/workflows/pages.yml`. Każdy push do
brancha `main` publikuje katalog `app/` bez dodatkowego procesu builda.

Docelowy adres dla repozytorium `Gra-Park-Dalii`:
`https://<nazwa-użytkownika>.github.io/Gra-Park-Dalii/`.

Po każdej zmianie plików podbij numer cache w `app/sw.js` (np. `v23` → `v24`),
żeby telefony pobrały nową wersję.

## Grafiki ubrań (AI)
Sloty ubrań mają teraz grafiki inline SVG. Aby podmienić wybraną grafikę na
plik, dodaj w jej wpisie w `app/js/data.js` pole
`img: 'assets/img/clothes/<id>.png'`. Lista id i prompty: **PROMPTY-grafiki.md**.

## Struktura
```
app/
  index.html          – ekrany: intro (retro wyścig), hub, spacer, przymierzalnia, memory, galeria
  css/style.css       – cały wygląd (mobile-first, media ≥560px owija w ramkę telefonu)
  js/data.js          – przedmioty, progi odblokowań, nagrody
  js/store.js         – zapis (localStorage 'dalia-save-v1'), smaczki, looki
  js/svg.js           – placeholdery SVG ubrań + akcesoria Dalii
  js/app.js           – hub, nawigacja, akcesoria Dalii
  js/game-intro.js    – retro intro: pseudo-3D jazda VW T1 (sprite'y pixel-art w kodzie)
  js/game-spacer.js   – mini-gra Spacer
  js/memory.js        – mini-gra Memory
  js/przymierzalnia.js– lookboard
  manifest.json, sw.js – PWA
  assets/img/dalia/   – 28 sprite'ów Dalii (wygenerowane z arkuszy)
tools/
  extract_assets.py   – pipeline wycinania sprite'ów z arkuszy (Pillow)
  e2e/                – testy puppeteer-core (shoot2.js, probe-acc.js)
Dalia-character-sheet/– oryginalne arkusze postaci (źródło sprite'ów)
PROGRESS.md           – dziennik postępu projektu
```

## Zapis gry
Postęp siedzi w `localStorage` (`dalia-save-v1`). Reset testowy:
w konsoli przeglądarki `localStorage.clear()` + odświeżenie.
