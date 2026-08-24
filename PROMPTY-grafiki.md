# Prompty grafiki ubrań (AI) — Park Dalii

Gra ma 24 ubrania-placeholderów. Wygeneruj je w AI (Midjourney / DALL-E / itp.),
zapisz jako PNG i wrzuć do `app/assets/img/clothes/<id>.png`.
Kod sam podmieni placeholder SVG na plik, gdy go znajdzie.

## Jak podmienić
1. Wygeneruj obraz wg promptu poniżej.
2. Zapisz jako `<id>.png` (np. `t-cardigan.png`), ~512×512, **przezroczyste tło**.
3. Wrzuć do `app/assets/img/clothes/`.
4. W `app/sw.js` podbij `CACHE = 'dalia-v1'` → `'dalia-v2'` (telefony pobiorą nową wersję).
5. Sprawdź w grze: Przymierzalnia → kategoria → ubranie.

## Wspólny styl (wklejaj na początku każdego promptu)
> Flat vector illustration of a single clothing item, centered, front view,
> soft rounded shapes, muted retro pastel palette (cream #F7EFE1, dusty pink,
> sage green, mustard, denim blue), dark brown outline (#4A3728), subtle texture,
> cozy vintage children's book style, transparent background, no person, no mannequin.

Na końcu każdego promptu dopisz: `transparent background, PNG cutout, no shadows on ground`.

## Format pionowy
Slot „top" i „bottom" rysują się jeden nad drugim — najlepiej proporcje ok. 3:4 (pion).
Czapki/okulary/dodatki mogą być kwadratowe.

## Spodnie (kategoria „Spodnie")
| id | nazwa | prompt (dodaj do wspólnego stylu) |
|---|---|---|
| b-flare-blue | Dzwony jeans | blue denim bell-bottom flared jeans, 70s style, high waist |
| b-cream-pants | Kremowe rurki | cream beige slim-fit cigarette pants, cropped ankles |
| b-plaid | Krata retro | brown-beige plaid tartan straight trousers, retro pattern |
| b-corduroy | Welur brąz | chocolate brown corduroy wide-leg pants, ribbed fabric texture |
| b-skirt | Spódnica A | dusty rose A-line midi skirt, simple elegant |
| b-overall | Ogrodniczki | sage green denim overalls with front pocket and straps |

## Góra
| id | nazwa | prompt |
|---|---|---|
| t-blouse-w | Bluzka kokardka | white cream blouse with a small bow at the collar, puff sleeves |
| t-turtle | Golf musztarda | mustard yellow turtleneck sweater, soft knit |
| t-stripe | Marynarka paski | navy-and-cream striped breton top with collar |
| t-cardigan | Cardigan róż | dusty pink knitted cardigan with buttons, oversized |
| t-dress-vtg | Sukienka vintage | vintage floral tea dress, small flowers, short sleeves, 60s cut |
| t-jacket | Jeansowa kurtka | light-wash denim jacket, classic trucker cut |

## Czapki
| id | nazwa | prompt |
|---|---|---|
| h-beret | Beret | burgundy wool beret hat, slightly tilted look |
| h-bucket | Bucket hat | cream bucket hat with stitch lines |
| b-bakerboy | Kaszkiet | brown baker boy cap (newsboy cap) with small brim — UWAGA: plik nazywa się `b-bakerboy.png` |
| h-sun | Kapelusz | straw sun hat with wide brim and thin pink ribbon |

## Okulary
| id | nazwa | prompt |
|---|---|---|
| g-cateye | Cat-eye | tortoiseshell cat-eye glasses, retro 50s |
| g-round | Okrągłe | round gold wire-frame glasses, John Lennon style |
| g-sun | Przeciwsłoneczne | black sunglasses, slightly oversized lenses |
| g-heart | Serduszka | heart-shaped pink novelty glasses, y2k fun |

## Dodatki
| id | nazwa | prompt |
|---|---|---|
| a-scarf-o | Chusta nektaryna | small orange neckerchief scarf, loosely tied knot |
| a-bag | Torebka retro | small retro handbag with short handle, tan leather, gold clasp |
| a-socks | Skarpetki lacze | white ruffle ankle socks with lace trim — plik: `a-socks.png` |
| a-pearl | Perły | pearl necklace strand, single row of round pearls |

## Uwagi
- Nazwy plików muszą się **dokładnie** zgadzać z kolumną `id` (małe litery, myślniki).
- Jeśli AI zwróci tło zamiast przezroczystości: usuń tło narzędziem typu remove.bg
  albo poproś o „sticker style, isolated on plain white background" i wytnij.
- Akcesoria Dalii (bandana, czapeczka, okulary, szalik na hubie) są już narysowane
  w SVG w grze — nie wymagają grafik.
