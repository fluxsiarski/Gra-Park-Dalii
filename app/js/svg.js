// svg.js — placeholder'owa grafika wektorowa w palecie arkusza Dalii.
// Później podmienisz <use href="#..."> na <img> z AI PNG (patrz PROMPTY-grafiki.md).

const INK = '#4A342A';

export function svgSymbols() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>

<!-- ===== SPODNIE ===== -->
<symbol id="i-flare" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#7E9BBF" d="M30 12 L70 12 L74 34 Q78 78 88 106 L58 110 Q52 84 50 66 Q48 84 42 110 L12 106 Q22 78 26 34 Z"/>
    <line x1="50" y1="14" x2="50" y2="60"/>
    <path fill="none" d="M40 12 q10 8 20 0"/>
  </g>
</symbol>
</defs>
</svg>`;
}

// kontynuacja symboli — dopisane
export function svgSymbols2() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>

<symbol id="i-pants" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#EAD9BF" d="M32 12 L68 12 L72 108 L54 108 L50 52 L46 108 L28 108 Z"/>
    <line x1="50" y1="14" x2="50" y2="48"/>
    <path fill="none" d="M40 12 q10 8 20 0"/>
  </g>
</symbol>

<symbol id="i-plaid-pants" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#B96A4B" d="M30 12 L70 12 L73 108 L55 108 L50 48 L45 108 L27 108 Z"/>
    <g stroke="#8A4A33" stroke-width="2.4">
      <line x1="34" y1="16" x2="36" y2="104"/><line x1="44" y1="14" x2="45" y2="70"/>
      <line x1="56" y1="14" x2="55" y2="70"/><line x1="66" y1="16" x2="64" y2="104"/>
      <line x1="30" y1="34" x2="70" y2="34"/><line x1="29" y1="58" x2="71" y2="58"/>
      <line x1="28" y1="84" x2="72" y2="84"/>
    </g>
    <path fill="none" d="M40 12 q10 8 20 0"/>
  </g>
</symbol>

<symbol id="i-corduroy" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#9C6B3F" d="M28 12 L72 12 L76 108 L56 108 L50 50 L44 108 L24 108 Z"/>
    <g stroke="#7E5230" stroke-width="2">
      <line x1="38" y1="18" x2="39" y2="100"/><line x1="62" y1="18" x2="61" y2="100"/>
    </g>
    <path fill="none" d="M40 12 q10 8 20 0"/>
  </g>
</symbol>

<symbol id="i-skirt" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#D98E6B" d="M34 26 L66 26 L86 96 Q50 110 14 96 Z"/>
    <path fill="#C97B57" d="M34 26 L66 26 L69 40 L31 40 Z"/>
    <circle cx="43" cy="60" r="3" fill="${INK}" stroke="none"/>
    <circle cx="57" cy="74" r="3" fill="${INK}" stroke="none"/>
    <circle cx="47" cy="88" r="3" fill="${INK}" stroke="none"/>
  </g>
</symbol>

<symbol id="i-overall" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#6F8F6A" d="M34 30 L66 30 L72 106 L54 106 L50 62 L46 106 L28 106 Z"/>
    <rect x="34" y="22" width="32" height="14" rx="5" fill="#6F8F6A"/>
    <line x1="38" y1="22" x2="42" y2="8"/><line x1="62" y1="22" x2="58" y2="8"/>
    <rect x="40" y="44" width="20" height="14" rx="4" fill="#5E7A59"/>
    <circle cx="44" cy="49" r="2.4" fill="#F2E4CE" stroke="none"/>
    <circle cx="56" cy="49" r="2.4" fill="#F2E4CE" stroke="none"/>
  </g>
</symbol>
`;
}

export function svgSymbols3() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>

<!-- ===== GORA ===== -->
<symbol id="i-blouse" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#FBF4E9" d="M35 22 Q50 32 65 22 L80 34 L72 52 L68 44 L68 100 L32 100 L32 44 L28 52 L20 34 Z"/>
    <path fill="#E8C4B0" d="M42 30 q8 10 16 0 l-4 14 -4 4 -4-4 Z"/>
    <circle cx="50" cy="52" r="7" fill="none"/>
    <path fill="none" d="M50 59 q-3 8 2 14 M50 73 q6 4 12 2 M50 73 q-6 4 -12 2"/>
  </g>
</symbol>

<symbol id="i-turtleneck" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <rect x="38" y="10" width="24" height="14" rx="5" fill="#D9A441"/>
    <path fill="#D9A441" d="M34 26 Q50 34 66 26 L82 40 L72 56 L70 46 L70 102 L30 102 L30 46 L28 56 L18 40 Z"/>
    <path fill="#C8922F" d="M30 88 h40 v14 h-40 z"/>
  </g>
</symbol>

<symbol id="i-stripe-top" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#F6EFDF" d="M36 24 Q50 30 64 24 L78 36 L70 52 L67 44 L67 100 L33 100 L33 44 L30 52 L22 36 Z"/>
    <g clip-path="url(#stripeClip)">
      <clipPath id="stripeClip"><path d="M36 24 Q50 30 64 24 L78 36 L70 52 L67 44 L67 100 L33 100 L33 44 L30 52 L22 36 Z"/></clipPath>
      <g stroke="#4E6E8E" stroke-width="5">
        <line x1="24" y1="48" x2="76" y2="48"/><line x1="24" y1="62" x2="76" y2="62"/>
        <line x1="24" y1="76" x2="76" y2="76"/><line x1="24" y1="90" x2="76" y2="90"/>
      </g>
    </g>
    <path fill="#4E6E8E" d="M36 24 Q50 30 64 24 L62 32 Q50 38 38 32 Z"/>
  </g>
</symbol>

<symbol id="i-cardigan" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#E3A7A0" d="M34 24 L20 38 L30 54 L34 46 L34 102 L66 102 L66 46 L70 54 L80 38 L66 24 Q50 32 34 24 Z"/>
    <path fill="#D18E86" d="M46 28 h8 v74 h-8 z"/>
    <circle cx="50" cy="44" r="2.6" fill="${INK}" stroke="none"/>
    <circle cx="50" cy="60" r="2.6" fill="${INK}" stroke="none"/>
    <circle cx="50" cy="76" r="2.6" fill="${INK}" stroke="none"/>
    <circle cx="50" cy="92" r="2.6" fill="${INK}" stroke="none"/>
  </g>
</symbol>

<symbol id="i-dress" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#B96A4B" d="M38 18 L62 18 L66 44 L84 104 Q50 116 16 104 L34 44 Z"/>
    <path fill="#A85B3E" d="M38 18 h24 v10 h-24 z"/>
    <path fill="none" d="M30 70 Q50 78 70 70 M26 86 Q50 94 74 86"/>
  </g>
</symbol>

<symbol id="i-jacket" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#7E9BBF" d="M34 22 L20 36 L28 54 L34 46 L34 104 L45 104 L50 60 L55 104 L66 104 L66 46 L72 54 L80 36 L66 22 Q50 30 34 22 Z"/>
    <line x1="50" y1="34" x2="50" y2="58"/>
    <circle cx="43" cy="66" r="2.4" fill="#F2E4CE" stroke="none"/>
    <circle cx="57" cy="66" r="2.4" fill="#F2E4CE" stroke="none"/>
    <rect x="38" y="76" width="9" height="10" rx="2" fill="none"/>
    <rect x="53" y="76" width="9" height="10" rx="2" fill="none"/>
  </g>
</symbol>
`;
}

export function svgSymbols4() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>

<!-- ===== CZAPKI ===== -->
<symbol id="i-beret" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#B0524A" d="M18 66 Q14 34 50 30 Q86 34 82 66 Q50 76 18 66 Z"/>
    <circle cx="52" cy="28" r="5" fill="#8F423B"/>
    <path fill="none" d="M20 68 Q50 78 80 68"/>
  </g>
</symbol>

<symbol id="i-bucket" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#C9A177" d="M30 44 L70 44 L74 72 Q50 80 26 72 Z"/>
    <ellipse cx="50" cy="74" rx="38" ry="12" fill="#B98D63"/>
    <path fill="#EAD9BF" d="M32 56 h36 v6 h-36 z"/>
  </g>
</symbol>

<symbol id="i-bakerboy" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#6F6757" d="M24 58 Q22 36 50 34 Q78 36 76 58 L84 62 Q50 54 16 62 Z"/>
    <path fill="#5A5346" d="M16 62 Q50 52 84 62 Q88 66 84 70 Q50 60 16 70 Q12 66 16 62 Z"/>
    <circle cx="50" cy="46" r="4" fill="#8A7F6B"/>
  </g>
</symbol>
`;
}

export function svgSymbols5() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-sunhat" viewBox="0 0 100 120">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#EAD9BF" d="M32 40 Q30 20 50 20 Q70 20 68 40 Z"/>
    <ellipse cx="50" cy="46" rx="42" ry="13" fill="#F6EFDF"/>
    <path fill="#D96C5F" d="M31 38 Q50 46 69 38 L69 45 Q50 53 31 45 Z"/>
  </g>
</symbol>

<!-- ===== OKULARY ===== -->
<symbol id="i-cateye" viewBox="0 0 120 70">
  <g stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="#F2E4CE">
    <path d="M10 30 Q22 16 48 24 Q52 40 40 44 Q18 48 10 30 Z"/>
    <path d="M110 30 Q98 16 72 24 Q68 40 80 44 Q102 48 110 30 Z"/>
    <path d="M48 27 Q60 23 72 27" fill="none"/>
    <circle cx="29" cy="31" r="3" fill="${INK}" stroke="none"/>
    <circle cx="91" cy="31" r="3" fill="${INK}" stroke="none"/>
  </g>
</symbol>

<symbol id="i-round-glasses" viewBox="0 0 120 70">
  <g stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round">
    <circle cx="35" cy="34" r="19" fill="#F2E4CE"/>
    <circle cx="85" cy="34" r="19" fill="#F2E4CE"/>
    <path d="M54 32 q6 -5 12 0"/>
    <path d="M16 30 l-10 -6 M104 30 l10 -6"/>
  </g>
</symbol>
`;
}

export function svgSymbols6() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-sunglasses" viewBox="0 0 120 70">
  <g stroke="${INK}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#4A3F38" d="M10 24 Q34 18 54 26 Q56 44 40 48 Q18 50 10 24 Z"/>
    <path fill="#4A3F38" d="M110 24 Q86 18 66 26 Q64 44 80 48 Q102 50 110 24 Z"/>
    <path d="M54 27 q6 -4 12 0" fill="none"/>
    <circle cx="32" cy="33" r="7" fill="#6B5D52" stroke="none"/>
    <circle cx="88" cy="33" r="7" fill="#6B5D52" stroke="none"/>
  </g>
</symbol>

<symbol id="i-heart-glasses" viewBox="0 0 120 70">
  <g stroke="${INK}" stroke-width="3.2" fill="#E88A96" stroke-linecap="round">
    <path d="M35 44 C18 34 16 20 28 18 C36 17 40 24 35 30 C30 24 34 19 39 21 C48 25 44 38 35 44 Z"/>
    <path d="M85 44 C102 34 104 20 92 18 C84 17 80 24 85 30 C90 24 86 19 81 21 C72 25 76 38 85 44 Z"/>
    <path d="M52 30 q8 -5 16 0" fill="none" stroke-linejoin="round"/>
  </g>
</symbol>

<!-- ===== DODATKI ===== -->
<symbol id="i-neckerchief" viewBox="0 0 100 80">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#E88A3C" d="M14 22 Q50 40 86 22 L82 34 Q50 52 18 34 Z"/>
    <path fill="#D97B2E" d="M58 36 L74 66 L46 46 Z"/>
  </g>
</symbol>
`;
}

export function svgSymbols7() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-bag" viewBox="0 0 100 100">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path d="M34 34 Q34 14 50 14 Q66 14 66 34" fill="none"/>
    <rect x="22" y="32" width="56" height="46" rx="10" fill="#B0524A"/>
    <path d="M22 48 h56" fill="none"/>
    <circle cx="50" cy="54" r="5" fill="#E8C4B0"/>
  </g>
</symbol>

<symbol id="i-socks" viewBox="0 0 100 100">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#F6EFDF" d="M36 12 h20 v40 q0 16 -18 22 l-10 -14 q8 -6 8 -14 Z"/>
    <path fill="#D9A441" d="M36 12 h20 v10 h-20 z"/>
    <path fill="#D96C5F" d="M28 60 q10 6 18 -4 l6 8 q-12 12 -26 6 Z"/>
  </g>
</symbol>

<symbol id="i-pearls" viewBox="0 0 100 80">
  <g stroke="${INK}" stroke-width="2.6" fill="#F6EFDF">
    <circle cx="30" cy="30" r="7"/><circle cx="44" cy="38" r="7"/><circle cx="58" cy="42" r="7"/>
    <circle cx="72" cy="40" r="7"/><circle cx="82" cy="30" r="7"/><circle cx="24" cy="42" r="6"/>
    <circle cx="37" cy="52" r="6"/><circle cx="53" cy="57" r="6"/><circle cx="68" cy="53" r="6"/>
  </g>
</symbol>
`;
}

// ===== Akcesoria nakładane na Dalię (nakładki w % pozycji) =====
export function svgSymbols8() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="acc-bandana" viewBox="0 0 100 70">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#D96C5F" d="M10 14 Q50 44 90 14 L84 30 Q50 58 16 30 Z"/>
    <path fill="#C25A4F" d="M64 40 L80 66 L46 50 Z"/>
  </g>
</symbol>

<symbol id="acc-cap" viewBox="0 0 100 70">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#6F8F6A" d="M22 44 Q24 16 52 16 Q78 18 76 44 Z"/>
    <path fill="#5E7A59" d="M74 42 Q94 42 92 54 Q72 56 68 48 Z"/>
    <circle cx="51" cy="15" r="4" fill="#5E7A59"/>
  </g>
</symbol>

<symbol id="acc-glasses" viewBox="0 0 120 60">
  <g stroke="${INK}" stroke-width="3.2" fill="none" stroke-linecap="round">
    <circle cx="35" cy="30" r="17" fill="#E8C4B0" opacity="0.9"/>
    <circle cx="85" cy="30" r="17" fill="#E8C4B0" opacity="0.9"/>
    <path d="M52 28 q8 -5 16 0"/>
    <path d="M18 26 l-12 -5 M102 26 l12 -5"/>
  </g>
</symbol>

<symbol id="acc-scarf" viewBox="0 0 100 80">
  <g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
    <path fill="#7E9BBF" d="M12 20 Q50 42 88 20 L82 36 Q50 58 18 36 Z"/>
    <rect x="60" y="34" width="14" height="38" rx="6" fill="#6B87A8"/>
  </g>
</symbol>

<!-- ===== UI ===== -->
<symbol id="i-treat" viewBox="0 0 100 60">
  <g stroke="${INK}" stroke-width="3.4" stroke-linejoin="round">
    <rect x="32" y="20" width="36" height="20" rx="10" fill="#D9A441"/>
    <circle cx="24" cy="30" r="11" fill="#D9A441"/><circle cx="76" cy="30" r="11" fill="#D9A441"/>
  </g>
</symbol>
`;
}

export function svgSymbols9() {
  return `
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
<defs>
<symbol id="i-heart" viewBox="0 0 100 90">
  <path fill="#D96C5F" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"
    d="M50 82 C18 60 8 40 16 26 C24 12 44 14 50 30 C56 14 76 12 84 26 C92 40 82 60 50 82 Z"/>
</symbol>

<symbol id="i-lock" viewBox="0 0 100 110">
  <g stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <path d="M32 48 v-10 a18 18 0 0 1 36 0 v10" fill="none"/>
    <rect x="24" y="46" width="52" height="44" rx="9" fill="#C9A177"/>
    <circle cx="50" cy="64" r="5" fill="${INK}" stroke="none"/>
    <path d="M50 68 v8" />
  </g>
</symbol>

<symbol id="i-nav-walk" viewBox="0 0 100 100">
  <g fill="#FBF4E9">
    <ellipse cx="50" cy="62" rx="22" ry="17"/>
    <ellipse cx="28" cy="38" rx="8.5" ry="11" transform="rotate(-18 28 38)"/>
    <ellipse cx="45" cy="28" rx="8.5" ry="11"/>
    <ellipse cx="63" cy="32" rx="8.5" ry="11" transform="rotate(14 63 32)"/>
    <ellipse cx="77" cy="46" rx="8" ry="10" transform="rotate(34 77 46)"/>
  </g>
</symbol>

<symbol id="i-nav-hanger" viewBox="0 0 100 90">
  <path d="M50 26 a8 8 0 1 1 8 -8 M50 26 L14 58 Q8 66 20 70 L80 70 Q92 66 86 58 Z"
    fill="none" stroke="#FBF4E9" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</symbol>

<symbol id="i-nav-memory" viewBox="0 0 100 100">
  <g stroke="#FBF4E9" stroke-width="6" stroke-linejoin="round">
    <rect x="18" y="22" width="42" height="56" rx="8" fill="#D96C5F"/>
    <rect x="40" y="26" width="42" height="56" rx="8" fill="#D9A441"/>
    <circle cx="61" cy="54" r="10" fill="none"/>
  </g>
</symbol>
`;
}

// Wstrzykuje wszystkie symbole do <body> raz na starcie.
export function mountSvg() {
  const wrap = document.createElement('div');
  wrap.innerHTML = [
    svgSymbols(), svgSymbols2(), svgSymbols3(), svgSymbols4(),
    svgSymbols5(), svgSymbols6(), svgSymbols7(), svgSymbols8(),
    svgSymbols9(),
  ].join('');
  // usuwamy puste opakowania <svg> (zostają tylko <symbol> w defs)
  document.body.appendChild(wrap);
}

// Skrót: element <svg><use></use></svg>
export function svgUse(id, cls = '') {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  if (cls) svg.setAttribute('class', cls);
  const use = document.createElementNS(ns, 'use');
  use.setAttribute('href', '#' + id);
  svg.appendChild(use);
  return svg;
}
