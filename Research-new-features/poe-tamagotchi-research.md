## Czym jest gatunek "Poe / Tamagotchi" i który to model gry
Nie znalazłem samodzielnej, dużej gry mobilnej o nazwie dokładnie "Poe" w stylu Tamagotchi — istnieje aplikacja czatu AI "Poe" (Quora) oraz zabawka "Poe AI Story Bear", ale to nie jest gra typu wirtualne zwierzątko. Bardzo prawdopodobne, że masz na myśli **Pou** — najpopularniejszą tego typu grę (50+ mln aktywnych graczy, ponad 100 mln pobrań), której nazwa jest bardzo podobna fonetycznie i mechanicznie idealnie odpowiada Twojemu opisowi: karmienie, mycie, ubieranie, hub minigier. W dalszej części opisuję mechaniki Pou oraz najważniejszych konkurentów tego gatunku (My Tamagotchi Forever, My Boo, Pokipet), żebyś miał pełny obraz rynku przed zaprojektowaniem własnej aplikacji z psem koleżanki jako bohaterem.[^1][^2][^3][^4][^5][^6]
## Mechaniki gry Pou (wzorcowy "Poe")
Pou to symulator opieki nad kosmicznym stworzeniem, oparty na czterech głównych paskach statusu: głód, zdrowie, szczęście i energia, które trzeba stale uzupełniać. Poniższa tabela podsumowuje kluczowe systemy gry.[^6]

| System | Mechanika |
|---|---|
| Karmienie | Przeciąganie jedzenia z kuchni do pyska; zdrowe jedzenie syci wolniej ale poprawia zdrowie, fast-food szybko syci lecz grozi "otyłością" [^6] |
| Mycie/higiena | Mydło + woda w łazience; nieczyszczenie obniża zdrowie i widocznie ubrudza zwierzaka [^6] |
| Szczęście | Minigry, zabawki, interakcja głosowa (zwierzak powtarza słowa zniekształconym głosem) [^6] |
| Sen/energia | Wyłączenie światła w sypialni; przedwczesne wybudzenie pogarsza nastrój [^6] |
| Progresja | Etapy: dziecko → nastolatek → dorosły, odblokowywane konsekwentną opieką (2-4 tyg.) [^6] |
| Personalizacja | Kolor skóry, oczy, ubrania, tapety pokoju, akcesoria — odblokowywane za monety lub poziomy [^6] |
| Ekonomia | Monety zdobywane w minigrach i osiągnięciach, wydawane na przedmioty i eliksiry (zdrowie, głód, odchudzanie) [^6] |
### Zestaw minigier (hub gier)
Hub minigier w Pou służy podwójnej funkcji: podnosi szczęście zwierzaka i generuje walutę w grze.[^7][^6]

- Sky Jump — skakanie na trampolinach w górę, zręcznościowa, oparta na timingu[^6]
- Food Drop — łapanie spadającego jedzenia, unikanie przeszkód[^6]
- Hill Drive — jazda pojazdem po wzgórzach, fizyka i balans[^6]
- Pou Popper — dopasowywanie/pękanie kolorowych baniek (bubble shooter)[^6]
- Sky Flight — nowsza minigra typu latanie/unikanie[^7]
### Konkurenci w gatunku
Analogiczne mechaniki (karmienie, mycie, ubieranie, minigry, wzrost) prezentują też: **My Tamagotchi Forever** (Bandai, oficjalna marka, minigry sportowe), **My Boo** i klony (dekoracja domu, gotowanie), oraz **Pokipet** — wariant społecznościowy, gdzie kilka osób wspólnie opiekuje się jednym zwierzakiem, co może być inspirujące, jeśli chcesz, by Ty i koleżanka razem "opiekowali się" cyfrowym psem.[^8][^9][^10][^11][^12]
## Jak zaadaptować mechanikę do własnego psa jako "Poe"
Twój projekt to w praktyce remiks gatunku Tamagotchi/Pou z jedną kluczową różnicą: bohaterem nie jest generyczne zwierzątko, a konkretny, rozpoznawalny pies koleżanki — więc największym wyzwaniem technicznym jest właśnie **konsystencja wizualna** tej postaci we wszystkich stanach (jedzenie, spanie, granie, smutek, radość, ubranka).[^13][^14]
### Krok 1 — zbuduj "kartę referencyjną" psa
Zamiast generować każdą animację od zera, zacznij od jednego, wysokiej jakości zdjęcia psa i wygeneruj z niego "turnaround sheet" (widok z wielu kątów: przód, profil, tył) — to jest podstawa do zachowania identyczności w kolejnych generacjach. Narzędzia takie jak Ideogram Character czy EZCharacter umożliwiają to z jednego zdjęcia referencyjnego bez trenowania własnego modelu (LoRA).[^13][^15][^14]
### Krok 2 — generowanie stylizowanej, konsekwentnej grafiki (masz Gemini Pro)
Twoim najlepszym, praktycznie darmowym narzędziem jest **Gemini 3 Pro Image / Nano Banana Pro** — dedykowany do "identity lock", czyli utrzymywania tożsamości postaci (twarz/sierść/proporcje) przy zmianie pozy, emocji czy tła, obsługuje do 14 zdjęć referencyjnych. Ponieważ masz Gemini Pro, w aplikacji Gemini (nie w czystym API) możesz korzystać z Nano Banana Pro praktycznie bez kosztów w ramach limitów subskrypcji, podczas gdy sam interfejs API tego modelu nie ma darmowego tieru i kosztuje 0,134–0,24 USD/obraz. Tańszy model **Gemini 2.5 Flash Image (Nano Banana)** ma realny darmowy limit API — do ok. 500 obrazów dziennie, przy słabszej kontroli tożsamości niż wersja Pro.[^16][^17][^18][^19][^20]

Praktyczny workflow: (1) wgraj zdjęcie psa do Gemini/AI Studio, (2) poproś o wygenerowanie zestawu "emocji" (szczęśliwy, głodny, śpiący, brudny, chory) z instrukcją systemową typu "zachowaj identyczne umaszczenie, proporcje i rasę psa we wszystkich obrazach", (3) zapisuj każdy wygenerowany obraz i dołączaj go jako kolejne odniesienie do następnych promptów, by błąd się nie kumulował.[^17][^16]
### Krok 3 — zamiana statycznych grafik na animacje/sprite'y
Do przekształcenia wygenerowanych obrazów w animowane sprite'y (chodzenie, machanie ogonem, jedzenie) polecane są wyspecjalizowane generatory AI sprite sheetów, które przyjmują jeden obraz referencyjny i tworzą zestaw ramek zachowując konsystencję: PixelLab (płatny/darmowy tier, wtyczka do Aseprite, rotacje 4/8-kierunkowe), AutoSprite (darmowe 3 kredyty dziennie), czy Spritely (5 sprite'ów/dzień za darmo). Alternatywnie, jeśli chcesz płynniejszej, wektorowej animacji sterowanej stanami (idle/jedzenie/sen) zamiast klasycznych sprite sheetów, **Rive** to darmowe narzędzie do animacji interaktywnych z obsługą "state machines", w pełni zintegrowane z Flutter i React Native, z darmowym planem obejmującym 3 pliki projektowe.[^21][^15][^22][^23][^24][^25][^26]

| Narzędzie | Zastosowanie | Koszt |
|---|---|---|
| Gemini 3 Pro Image (Nano Banana Pro), przez apkę Gemini | Generowanie konsekwentnych grafik psa w różnych emocjach/pozach | W ramach Twojego planu Gemini Pro [^17][^20] |
| Gemini 2.5 Flash Image (Nano Banana) via API | Masowe generowanie wariantów, backupowe API | Darmowe do ~500 obrazów/dzień [^18] |
| PixelLab / AutoSprite / Spritely | Zamiana grafiki na sprite sheet animacji (chód, jedzenie) | Darmowe tiery (kredyty dzienne) [^15][^21][^23] |
| Rive | Animacje wektorowe sterowane stanem (idle/hunger/sleep) zintegrowane z kodem | Darmowy plan, 3 pliki [^24] |
| Ideogram Character / EZCharacter | Turnaround referencyjny psa z 1 zdjęcia | Darmowe kredyty miesięczne [^14][^13] |
## Architektura i implementacja aplikacji
Biorąc pod uwagę Twój stack (Python, znajomość terminala, Cursor Pro, Claude Code/OpenCode, MacBook), sensowne opcje frameworka to:

- **Flutter** — jeden kod na iOS/Android, natywna integracja z Rive dla animacji stanowych zwierzaka, dobra dokumentacja, łatwo zintegrować REST call do Gemini API dla generowania nowych "skinów".[^24]
- **React Native / Expo** — jeśli wolisz JS/TS (masz to w profilu), również ma wsparcie Rive i szybki cykl w Cursor/Claude Code.
- **Godot (GDScript/C#)** — jeśli chcesz podejścia bardziej "gamedev" z natywnym silnikiem 2D i własnym AnimatedSprite2D importującym wygenerowane PNG sprite sheety.[^27]

Rekomendowana logika stanu zwierzaka to prosty automat skończony (finite-state machine) z atrybutami: głód, energia, higiena, nastrój — dokładnie jak w Pou — zapisywanymi lokalnie (SQLite/Hive) lub w Firebase, jeśli chcesz synchronizacji między Twoim telefonem i telefonem koleżanki (na wzór współdzielonego zwierzaka z Pokipet).[^9][^6]
## Rekomendowany plan działania
1. Zrób sesję zdjęciową psa koleżanki (przód, profil, kilka emocji) jako bazę referencyjną.
2. W Gemini (masz Pro) wygeneruj spójny "arkusz stylu" — jedna stylistyka (np. płaski cartoon, pixel art lub 3D-toon) zdefiniowana jednym promptem bazowym, potem powielana dla każdej emocji/czynności.[^17]
3. Skonwertuj kluczowe grafiki na animacje przez Rive (płynne, sterowane kodem) albo sprite sheet generator (klasyczne cykle klatek).[^15][^24]
4. Zaprojektuj mechaniki 1:1 wzorowane na Pou (4 paski: głód/higiena/szczęście/energia + 3-4 minigry) w Flutter/React Native, korzystając z Cursor/Claude Code do szybkiego prototypowania UI.[^6]
5. Dodaj warstwę współdzielenia z koleżanką (opcjonalnie), inspirowaną modelem Pokipet, żeby oboje mogli "opiekować się" cyfrowym psem.[^9]

---

## References

1. [Pou (video game) - Wikipedia](https://en.wikipedia.org/wiki/Pou_(video_game))

2. [POE AI Miś tworzący bajki - Zabawki interaktywne - Klocki COBI](https://cobitoys.com/produkt/poe-ai-mis-tworzacy-bajki,16666) - POE AI Miś tworzący bajki / Interaktywne misie. Zabawki interaktywne w oficjalnym sklepie internetow...

3. [Poe – Fast AI Chat 16+ - App Store](https://apps.apple.com/hk/app/poe-fast-ai-chat/id1640745955?l=en-GB) - Poe brings together the best AI, all in one place. It is designed for seamless conversational experi...

4. [Poe - Fast AI Chat – Aplikacje w Google Play](https://play.google.com/store/apps/details?id=com.poe.android&hl=pl) - Uzyskaj dostęp do zaawansowanej sztucznej inteligencji, takiej jak GPT-4.1, Claude 3.7, DeepSeek-R1 ...

5. [Pou (game)/en](https://poupedia.com/Pou_(game)/en) - .

6. [Pou | Complete Virtual Pet Guide - PlayPou.com](https://www.playpou.com/) - Master Pou with our complete encyclopedia. Learn care strategies, gameplay tips, and download guides...

7. [Pou Wiki](https://pou.fandom.com/wiki/Pou_Wiki) - The Pou Wiki is an encyclopedia on the mobile phone game Pou. Learn how to earn all of those achieve...

8. [Tiny Friends: Virtual Pet Game - Apps on Google Play](https://play.google.com/store/apps/details?id=org.godotengine.tamagotchi) - Raise and care your virtual pet. Decorate house, grow plants and cook dishes!

9. [Pokipet - Raise virtual pets](https://apps.apple.com/pl/app/pokipet-raise-virtual-pets/id6443760470?l=pl) - Adopt a virtual cat or dog with your friends! Pokipet is a social pet game where you can create a gr...

10. [My Tamagotchi Forever - Apps on Google Play](https://play.google.com/store/apps/details?id=eu.bandainamcoent.mytamagotchiforever&hl=en_US) - The classic virtual toy! It is time to try the original pet simulator

11. [List of My Boo-like games](https://myboovirtualpet.fandom.com/wiki/List_of_My_Boo-like_games) - The success of the My Boo franchise has lead into many games with the same style of gameplay. Here i...

12. [Pokipet - Raise virtual pets - App Store - Apple](https://apps.apple.com/us/app/pokipet-raise-virtual-pets/id6443760470) - Download Pokipet - Raise virtual pets by MoonBear LTD on the App Store. See screenshots, ratings and...

13. [EZ Character — Character Consistency Across Angles, Styles & Scenes](https://ezcharacter.com/) - One AI character, infinite uses: turnarounds, 3D camera angles, expressions, outfit swaps, restyles,...

14. [Character Consistency from One Photo: Free AI Headshot Generator](https://ideogram.ai/features/character/) - Free AI character and headshot generator with character consistency from one reference photo. Keep t...

15. [PixelLab](https://www.pixellab.ai/) - Create game-ready pixel art assets 10x faster! Professional sprite animation tool and game asset gen...

16. [Generación de imágenes con Nano Banana - Interactions API](https://ai.google.dev/gemini-api/docs/image-generation) - Get started generating images with the Gemini API using Nano Banana and Nano Banana Pro

17. [Enable strict facial consistency mode. Prioritize the facial features from the provided reference im](https://support.google.com/gemini/thread/404609614/enable-strict-facial-consistency-mode-prioritize-the-facial-features-from-the-provided-reference-im?hl=en)

18. [Gemini Image Generation API Free Tier: Complete Guide to ...](https://www.aifreeapi.com/en/posts/gemini-image-generation-free-api) - Master Gemini's free image generation API with Nano Banana, Nano Banana Pro, and Imagen 4. Get up to...

19. [Nano Banana Pro Pricing: Free Limits & API Costs (2026)](https://www.glbgpt.com/hub/how-much-is-nano-banana-pro/) - Nano Banana Pro pricing in 2026: compare free Gemini limits, Google AI plans, API image costs, water...

20. [Gemini 3 Pro Image Free Tier: Complete 2026 Guide (What's ...](https://blog.laozhang.ai/en/posts/gemini-3-pro-image-free-tier) - Gemini 3 Pro Image (Nano Banana Pro) has no free API tier as of February 2026. But you can still gen...

21. [AutoSprite - AI Sprite Sheet Generator | Create Game ...](https://www.autosprite.io/) - Upload a single sprite, pick a moveset, and export engine-ready spritesheets in minutes.

22. [Free Sprite Sheet Generator | AutoSprite](https://www.autosprite.io/free) - Generate animated sprite sheets free. No credit card required. AI-powered sprite generation for Unit...

23. [Spritely](https://spritely.studio/) - Generate game-ready sprite sheets from text prompts using AI

24. [Rive Pricing](https://rive.app/pricing) - Rive pricing starts free to build in the editor. Upgrade to ship your projects to the web, iOS, Andr...

25. [Rive Pricing Plans & Tiers Compared (2026) | CompareTiers](https://comparetiers.com/tools/rive) - Interactive animation tool with runtime support for apps and web. Compare Rive pricing: 4 plans, fro...

26. [Rive - The Best Tool for Shipping Interactive Animations](https://www.uiguides.com/tools/rive-review) - Honest Rive review: production-quality interactive animations used by Google and Duolingo. Steeper l...

27. [AI Sprite Sheet Generator — Generate Spritesheets with AI | Online ...](https://www.spritesheets.ai/) - AI sprite sheet generator — upload any image and generate game-ready spritesheets with AI in one cli...

