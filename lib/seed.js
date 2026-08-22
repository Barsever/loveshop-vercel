'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { load, save, uid, hashPassword } = require('./db');

const UPLOADS = path.join(__dirname, '..', 'public', 'uploads');

/*
 * LOVE. UNIFIED STUDIO ART DIRECTION (2026)
 * - Standardized warm ivory/cream neutral background with soft diffused spotlight
 * - Top-left 135° key light + subtle contact shadow on floor plane
 * - Normalized perceived product scale & optical centering
 * - Bespoke luxury product silhouettes (tactile matte silicone, brushed champagne gold, heavy frosted glass)
 */
function studioWrapper(innerSvg, num, title) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <!-- Studio backdrop gradients -->
    <linearGradient id="studio-bg" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FBF8F4"/>
      <stop offset="60%" stop-color="#F3ECE3"/>
      <stop offset="100%" stop-color="#EAE1D5"/>
    </linearGradient>
    <radialGradient id="studio-key" cx="36%" cy="28%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="#FFFFFF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#EAE1D5" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="contact-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2D241E" stop-opacity="0.22"/>
      <stop offset="45%" stop-color="#3D322B" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#3D322B" stop-opacity="0"/>
    </radialGradient>

    <!-- Studio Material Shaders -->
    <linearGradient id="rose-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F7D8CA"/>
      <stop offset="35%" stop-color="#D9A08B"/>
      <stop offset="70%" stop-color="#F9E2D8"/>
      <stop offset="100%" stop-color="#B87661"/>
    </linearGradient>
    <linearGradient id="champagne-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F9F2DC"/>
      <stop offset="40%" stop-color="#D6B87B"/>
      <stop offset="75%" stop-color="#F6EDD2"/>
      <stop offset="100%" stop-color="#A58448"/>
    </linearGradient>
    <linearGradient id="matte-blush" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FEEAE6"/>
      <stop offset="35%" stop-color="#F6B8AF"/>
      <stop offset="80%" stop-color="#E28B80"/>
      <stop offset="100%" stop-color="#BF665B"/>
    </linearGradient>
    <linearGradient id="matte-coral" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FEDDD6"/>
      <stop offset="40%" stop-color="#F59B8E"/>
      <stop offset="85%" stop-color="#D86B5D"/>
      <stop offset="100%" stop-color="#AD4B3E"/>
    </linearGradient>
    <linearGradient id="matte-obsidian" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#544B47"/>
      <stop offset="35%" stop-color="#342E2B"/>
      <stop offset="80%" stop-color="#211D1B"/>
      <stop offset="100%" stop-color="#141110"/>
    </linearGradient>
    <linearGradient id="matte-cream" x1="0.2" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="45%" stop-color="#F7EFE5"/>
      <stop offset="85%" stop-color="#E2D4C3"/>
      <stop offset="100%" stop-color="#C5B49E"/>
    </linearGradient>
    <linearGradient id="amber-oil" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFE8B3"/>
      <stop offset="50%" stop-color="#EAA639"/>
      <stop offset="100%" stop-color="#B86F15"/>
    </linearGradient>
    <linearGradient id="frosted-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
      <stop offset="25%" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="75%" stop-color="#FFFFFF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.75"/>
    </linearGradient>

    <!-- Gaussian contact blur -->
    <filter id="soft-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <!-- Background base -->
  <rect width="900" height="900" fill="url(#studio-bg)"/>
  <rect width="900" height="900" fill="url(#studio-key)"/>

  <!-- Subtle Studio grid/frame cues -->
  <rect x="36" y="36" width="828" height="828" fill="none" stroke="rgba(60,45,35,0.04)" stroke-width="1" rx="8"/>

  <!-- Floor Contact Shadow -->
  <ellipse cx="450" cy="740" rx="230" ry="34" fill="url(#contact-shadow)" filter="url(#soft-blur)"/>

  <!-- Product Vector Silhouette & Lighting -->
  ${innerSvg}

  <!-- Studio discreet editorial markings -->
  <text x="56" y="842" font-family="'Outfit', 'Helvetica Neue', sans-serif" font-size="11" font-weight="600" letter-spacing="3.2" fill="rgba(65,50,42,0.38)">LOVE. STUDIO</text>
  <text x="844" y="842" font-family="'Outfit', 'Helvetica Neue', sans-serif" font-size="11" font-weight="600" letter-spacing="2.8" text-anchor="end" fill="rgba(65,50,42,0.38)">№ ${String(num).padStart(2, '0')}</text>
</svg>`;
}

/* Product Art Direction Silhouettes */
const PRODUCT_VECTORS = {
  'aurora-wand': () => `
    <!-- Aura Wand: Ergonomic Wand Massager -->
    <g transform="translate(0, -10)">
      <!-- Spherical silicone head -->
      <circle cx="450" cy="270" r="105" fill="url(#matte-blush)"/>
      <circle cx="430" cy="245" r="75" fill="#FFFFFF" opacity="0.22" filter="url(#soft-blur)"/>
      <!-- Rose gold accent collar -->
      <path d="M382 368 C382 355 518 355 518 368 L522 396 C522 410 378 410 378 396 Z" fill="url(#rose-gold)"/>
      <ellipse cx="450" cy="370" rx="68" ry="12" fill="#FFFFFF" opacity="0.45"/>
      <!-- Ergonomic tapered handle -->
      <path d="M380 398 C375 490 390 580 405 690 C408 718 492 718 495 690 C510 580 525 490 520 398 Z" fill="url(#matte-blush)"/>
      <!-- Matte specular highlight stripe -->
      <path d="M420 410 C416 480 422 560 430 670" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.32"/>
      <!-- Tactile interface pill -->
      <rect x="432" y="470" width="36" height="88" rx="18" fill="url(#rose-gold)"/>
      <circle cx="450" cy="492" r="7" fill="#211D1B" opacity="0.6"/>
      <path d="M443 530 L457 530 M450 523 L450 537" stroke="#211D1B" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>
      <!-- Soft floor shadow close -->
      <ellipse cx="450" cy="710" rx="60" ry="14" fill="#1C140E" opacity="0.25" filter="url(#soft-blur)"/>
    </g>`,

  'nova-point': () => `
    <!-- Nova Point: Precision Sculpted Curve -->
    <g transform="translate(0, 0)">
      <!-- Ergonomic organic loop & point -->
      <path d="M430 190 C485 185 530 230 525 285 C518 360 480 440 475 520 C470 590 482 650 480 690 C478 712 422 712 420 690 C418 630 405 540 405 450 C405 320 380 200 430 190 Z" fill="url(#matte-cream)"/>
      <!-- Precision curved tip highlight -->
      <path d="M445 205 C480 205 510 240 505 285 C498 350 465 430 460 510" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.5"/>
      <!-- Rose gold accent base -->
      <rect x="424" y="662" width="52" height="34" rx="10" fill="url(#rose-gold)"/>
      <ellipse cx="450" cy="695" rx="26" ry="6" fill="#A86854"/>
      <!-- Embossed button -->
      <circle cx="450" cy="570" r="14" fill="none" stroke="rgba(60,45,35,0.2)" stroke-width="3"/>
      <circle cx="450" cy="570" r="5" fill="rgba(60,45,35,0.25)"/>
    </g>`,

  'lumen-duo': () => `
    <!-- Lumen Duo: Premium Slate & Rose Gold Dual Wave -->
    <g transform="translate(0, 0)">
      <!-- Main body silhouette -->
      <path d="M440 180 C485 180 520 220 515 275 C505 380 470 460 485 570 C495 640 480 700 450 705 C420 700 405 640 415 570 C430 460 395 380 385 275 C380 220 415 180 440 180 Z" fill="url(#matte-obsidian)"/>
      <!-- Specular high-end edge lighting -->
      <path d="M410 220 C395 300 422 400 435 500 C445 580 430 650 445 690" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" opacity="0.35"/>
      <!-- Dual contour arm branching -->
      <path d="M485 410 C535 430 550 490 535 540 C520 580 485 570 485 570" fill="url(#matte-obsidian)"/>
      <!-- Rose gold luxury ring insert -->
      <ellipse cx="450" cy="590" rx="38" ry="14" fill="none" stroke="url(#rose-gold)" stroke-width="6"/>
      <ellipse cx="450" cy="590" rx="34" ry="11" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.6"/>
      <circle cx="450" cy="635" r="8" fill="url(#rose-gold)"/>
    </g>`,

  'puls-rabbit': () => `
    <!-- Puls Rabbit: Sculpted Dual Stimulation -->
    <g transform="translate(0, -5)">
      <!-- Main shaft -->
      <path d="M425 180 C465 175 490 215 485 260 C475 350 465 470 475 580 C480 660 475 705 440 705 C410 705 405 660 410 580 C420 470 410 350 400 260 C395 215 405 180 425 180 Z" fill="url(#matte-blush)"/>
      <!-- Rabbit ears contour -->
      <path d="M465 410 C530 380 560 430 540 480 C525 515 475 500 470 490" fill="url(#matte-blush)"/>
      <path d="M485 390 C515 365 545 385 530 425" fill="url(#matte-coral)" opacity="0.6"/>
      <!-- Highlights -->
      <path d="M425 200 C410 280 425 400 430 540" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.4"/>
      <!-- Base ergonomic loop -->
      <ellipse cx="440" cy="660" rx="42" ry="24" fill="none" stroke="url(#rose-gold)" stroke-width="7"/>
    </g>`,

  'we-vibe-stil': () => `
    <!-- Duo Ring: Velvet Terracotta & Gold Core -->
    <g transform="translate(0, 20)">
      <!-- Outer C-ring silhouette -->
      <ellipse cx="450" cy="460" rx="145" ry="165" fill="none" stroke="url(#matte-coral)" stroke-width="76"/>
      <ellipse cx="450" cy="460" rx="145" ry="165" fill="none" stroke="#FFFFFF" stroke-width="8" opacity="0.32"/>
      <!-- Inner luxury brushed gold core -->
      <ellipse cx="450" cy="460" rx="100" ry="118" fill="none" stroke="url(#champagne-gold)" stroke-width="12"/>
      <!-- Tactile stimulator node -->
      <ellipse cx="450" cy="300" rx="55" ry="38" fill="url(#matte-coral)"/>
      <ellipse cx="440" cy="292" rx="35" ry="18" fill="#FFFFFF" opacity="0.35"/>
      <!-- Magnetic charging pins -->
      <circle cx="438" cy="610" r="5" fill="url(#champagne-gold)"/>
      <circle cx="462" cy="610" r="5" fill="url(#champagne-gold)"/>
    </g>`,

  'remote-love': () => `
    <!-- Remote Love: Pebble Egg & Teardrop Controller -->
    <g transform="translate(0, 0)">
      <!-- Pebble egg -->
      <ellipse cx="380" cy="480" rx="85" ry="135" fill="url(#matte-blush)" transform="rotate(-15 380 480)"/>
      <ellipse cx="365" cy="440" rx="55" ry="90" fill="#FFFFFF" opacity="0.3" transform="rotate(-15 380 480)"/>
      <path d="M340 580 Q 300 680 270 700" stroke="url(#rose-gold)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- Teardrop wireless remote -->
      <path d="M530 330 C570 330 600 370 590 420 L550 550 C540 575 510 575 500 550 L470 420 C460 370 490 330 530 330 Z" fill="url(#matte-cream)"/>
      <ellipse cx="530" cy="410" rx="28" ry="28" fill="url(#rose-gold)"/>
      <circle cx="530" cy="410" r="8" fill="#FFFFFF" opacity="0.8"/>
      <!-- Subtle wave indicator -->
      <path d="M518 470 Q 530 460 542 470" stroke="rgba(60,45,35,0.3)" stroke-width="3" fill="none"/>
    </g>`,

  'silk-bondage-set': () => `
    <!-- Silk Set: Draped Silk Ribbons & Gold Clasp -->
    <g transform="translate(0, 10)">
      <!-- Folded luxurious silk ribbons -->
      <path d="M280 560 C320 380 460 330 540 380 C610 420 630 540 580 620 C520 700 380 680 320 640 Z" fill="url(#matte-blush)"/>
      <path d="M300 540 C340 410 450 360 520 400 C580 435 590 520 550 590 C500 660 380 640 330 600 Z" fill="url(#matte-coral)" opacity="0.75"/>
      <path d="M330 450 C380 370 490 380 540 430" stroke="#FFFFFF" stroke-width="16" fill="none" opacity="0.38" stroke-linecap="round"/>
      <!-- Polished gold O-ring connector -->
      <circle cx="450" cy="470" r="62" fill="none" stroke="url(#champagne-gold)" stroke-width="16"/>
      <circle cx="450" cy="470" r="62" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.6"/>
      <!-- Draped hanging sash tails -->
      <path d="M410 520 C390 600 340 680 320 720 L380 725 C410 680 440 600 450 530 Z" fill="url(#matte-blush)"/>
      <path d="M470 520 C490 610 530 680 560 720 L510 725 C470 670 450 590 440 530 Z" fill="url(#matte-coral)"/>
    </g>`,

  'heat-couple': () => `
    <!-- Heat Couple: Thermal Contour Device -->
    <g transform="translate(0, 10)">
      <!-- Organic S-curve body -->
      <path d="M420 230 C470 200 520 230 525 280 C530 360 440 420 440 490 C440 560 530 610 520 670 C510 710 460 720 420 690 C380 650 380 580 400 510 C420 440 370 370 380 290 C385 250 400 235 420 230 Z" fill="url(#matte-obsidian)"/>
      <!-- Warm copper-gold thermal line -->
      <path d="M450 250 C480 320 410 410 415 500 C420 580 480 630 470 680" stroke="url(#rose-gold)" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M450 250 C480 320 410 410 415 500 C420 580 480 630 470 680" stroke="#FFE0B2" stroke-width="3" fill="none" opacity="0.75" stroke-linecap="round"/>
      <!-- Power button -->
      <circle cx="450" cy="490" r="14" fill="url(#rose-gold)"/>
      <circle cx="450" cy="490" r="6" fill="#1C1816"/>
    </g>`,

  'silk-touch-oil': () => `
    <!-- Silk Touch Oil: Frosted Heavy Glass Dropper -->
    <g transform="translate(0, 15)">
      <!-- Bottle Glass Body -->
      <rect x="355" y="360" width="190" height="310" rx="36" fill="url(#frosted-glass)"/>
      <!-- Amber oil meniscus inside -->
      <rect x="370" y="420" width="160" height="235" rx="24" fill="url(#amber-oil)" opacity="0.88"/>
      <!-- Minimalist LOVE. Studio label -->
      <rect x="385" y="460" width="130" height="145" rx="8" fill="#FDFBF7"/>
      <text x="450" y="510" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#292524" text-anchor="middle">LOVE.</text>
      <text x="450" y="535" font-family="'Outfit', sans-serif" font-size="9" font-weight="500" letter-spacing="2" fill="#78716C" text-anchor="middle">SILK TOUCH OIL</text>
      <line x1="420" y1="552" x2="480" y2="552" stroke="#D9A08B" stroke-width="1.5"/>
      <text x="450" y="575" font-family="'Outfit', sans-serif" font-size="8" font-weight="500" letter-spacing="1.5" fill="#A8A29E" text-anchor="middle">100 ML • BOTANICAL</text>
      <!-- Glass reflection sheen -->
      <path d="M375 380 L375 650" stroke="#FFFFFF" stroke-width="10" opacity="0.5" stroke-linecap="round"/>
      <!-- Gold dropper collar -->
      <rect x="405" y="295" width="90" height="65" rx="10" fill="url(#champagne-gold)"/>
      <!-- Rubber bulb -->
      <path d="M420 295 C420 220 480 220 480 295 Z" fill="#292524"/>
    </g>`,

  'rose-mist': () => `
    <!-- Rose Mist: Tall Frosted Cylindrical Spray -->
    <g transform="translate(0, 0)">
      <!-- Tall cylinder bottle -->
      <rect x="375" y="270" width="150" height="420" rx="28" fill="url(#frosted-glass)"/>
      <rect x="388" y="320" width="124" height="355" rx="18" fill="url(#matte-blush)" opacity="0.65"/>
      <!-- Label -->
      <rect x="400" y="420" width="100" height="150" rx="6" fill="#FAF7F2"/>
      <text x="450" y="470" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" letter-spacing="3" fill="#292524" text-anchor="middle">ROSE</text>
      <text x="450" y="492" font-family="'Outfit', sans-serif" font-size="9" font-weight="500" letter-spacing="2.5" fill="#E28B80" text-anchor="middle">MIST</text>
      <line x1="430" y1="510" x2="470" y2="510" stroke="#E28B80" stroke-width="1"/>
      <text x="450" y="535" font-family="'Outfit', sans-serif" font-size="8" letter-spacing="1" fill="#78716C" text-anchor="middle">50 ML</text>
      <!-- Gold spray pump -->
      <rect x="415" y="200" width="70" height="70" rx="8" fill="url(#rose-gold)"/>
      <rect x="430" y="170" width="40" height="30" rx="4" fill="url(#rose-gold)"/>
      <!-- Fine mist nozzle aperture -->
      <circle cx="450" cy="185" r="3" fill="#211D1B"/>
    </g>`,

  'velvet-balm': () => `
    <!-- Velvet Balm: Heavy Glass Cosmetic Jar -->
    <g transform="translate(0, 40)">
      <!-- Heavy jar base -->
      <rect x="330" y="420" width="240" height="220" rx="32" fill="url(#frosted-glass)"/>
      <rect x="350" y="450" width="200" height="175" rx="20" fill="url(#matte-cream)" opacity="0.9"/>
      <!-- Label on jar -->
      <text x="450" y="535" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#292524" text-anchor="middle">LOVE.</text>
      <text x="450" y="560" font-family="'Outfit', sans-serif" font-size="9" font-weight="500" letter-spacing="2" fill="#78716C" text-anchor="middle">VELVET BALM</text>
      <!-- Champagne brushed metal lid -->
      <rect x="315" y="360" width="270" height="70" rx="16" fill="url(#champagne-gold)"/>
      <line x1="330" y1="375" x2="570" y2="375" stroke="#FFFFFF" stroke-width="3" opacity="0.6"/>
    </g>`,

  'glow-serum': () => `
    <!-- Glow Serum: Pearlescent Cosmetic Pump -->
    <g transform="translate(0, 10)">
      <!-- Bottle body -->
      <rect x="365" y="310" width="170" height="375" rx="30" fill="url(#frosted-glass)"/>
      <rect x="380" y="345" width="140" height="325" rx="20" fill="url(#matte-cream)" opacity="0.75"/>
      <!-- Gold pump collar & spout -->
      <rect x="405" y="240" width="90" height="70" rx="10" fill="url(#champagne-gold)"/>
      <path d="M420 240 L420 190 Q 420 180 435 180 L480 180 Q 495 180 495 195 L495 240 Z" fill="url(#champagne-gold)"/>
      <!-- Minimalist vertical typography -->
      <text x="450" y="470" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="#292524" text-anchor="middle">GLOW</text>
      <text x="450" y="495" font-family="'Outfit', sans-serif" font-size="9" letter-spacing="3" fill="#B58A5E" text-anchor="middle">SERUM</text>
      <line x1="430" y1="520" x2="470" y2="520" stroke="#B58A5E" stroke-width="1.5"/>
    </g>`,

  'noir-mask': () => `
    <!-- Noir Maske: Venetian Filigree Lace Eye Mask -->
    <g transform="translate(0, 40)">
      <!-- Filigree lace mask wings -->
      <path d="M450 460 C400 370 270 340 240 430 C220 490 280 560 360 550 C410 545 440 500 450 460 C460 500 490 545 540 550 C620 560 680 490 660 430 C630 340 500 370 450 460 Z" fill="url(#matte-obsidian)"/>
      <!-- Eye cutout apertures -->
      <ellipse cx="345" cy="455" rx="55" ry="32" fill="#F7F1E8" transform="rotate(-8 345 455)"/>
      <ellipse cx="555" cy="455" rx="55" ry="32" fill="#F7F1E8" transform="rotate(8 555 455)"/>
      <!-- Intricate gold edge filigree trim -->
      <path d="M260 410 Q 350 360 450 430 Q 550 360 640 410" stroke="url(#champagne-gold)" stroke-width="4" fill="none" opacity="0.7"/>
      <!-- Silk ribbon side ties -->
      <path d="M240 440 C190 470 160 540 140 620" stroke="#211D1B" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M660 440 C710 470 740 540 760 620" stroke="#211D1B" stroke-width="10" fill="none" stroke-linecap="round"/>
    </g>`,

  'lace-robe': () => `
    <!-- Lace Robe: Folded Silk & Scallop Lace Kimono -->
    <g transform="translate(0, 30)">
      <!-- Folded garment body -->
      <path d="M310 380 L590 380 L560 660 L340 660 Z" fill="url(#matte-cream)"/>
      <!-- Silk crossover lapel -->
      <path d="M340 380 L480 560 L450 660 L340 660 Z" fill="url(#matte-blush)" opacity="0.6"/>
      <!-- Scallop lace trims -->
      <path d="M310 380 C330 420 330 460 310 500 C330 540 330 580 310 620" stroke="url(#rose-gold)" stroke-width="4" fill="none"/>
      <path d="M590 380 C570 420 570 460 590 500 C570 540 570 580 590 620" stroke="url(#rose-gold)" stroke-width="4" fill="none"/>
      <!-- Satin sash belt with bow -->
      <rect x="320" y="520" width="260" height="36" rx="8" fill="url(#rose-gold)"/>
      <ellipse cx="450" cy="538" rx="28" ry="16" fill="url(#rose-gold)"/>
    </g>`,

  'feather-tickle': () => `
    <!-- Feather Tickle: Ebony Wand & Blush Ostrich Plumes -->
    <g transform="translate(0, 0)">
      <!-- Wand handle -->
      <line x1="330" y1="690" x2="480" y2="440" stroke="url(#matte-obsidian)" stroke-width="16" stroke-linecap="round"/>
      <!-- Polished gold ferrule -->
      <rect x="465" y="415" width="28" height="34" rx="4" fill="url(#champagne-gold)" transform="rotate(-32 479 432)"/>
      <!-- Soft blush ostrich plume cluster -->
      <path d="M490 420 C540 340 620 280 660 220 C580 260 520 330 480 390 Z" fill="url(#matte-blush)"/>
      <path d="M490 420 C560 360 650 340 700 310 C620 330 550 370 480 410 Z" fill="url(#matte-coral)" opacity="0.7"/>
      <path d="M470 430 C490 330 540 240 580 180 C530 250 490 340 460 410 Z" fill="url(#matte-cream)"/>
    </g>`,

  'satin-cuffs': () => `
    <!-- Satin Cuffs: Pair of Quilted Blush Cuffs & Gold Links -->
    <g transform="translate(0, 20)">
      <!-- Left Cuff -->
      <rect x="250" y="440" width="170" height="110" rx="20" fill="url(#matte-blush)" transform="rotate(-12 335 495)"/>
      <line x1="265" y1="480" x2="405" y2="480" stroke="url(#rose-gold)" stroke-width="3" transform="rotate(-12 335 495)"/>
      <circle cx="390" cy="460" r="14" fill="none" stroke="url(#champagne-gold)" stroke-width="6"/>
      <!-- Right Cuff -->
      <rect x="480" y="440" width="170" height="110" rx="20" fill="url(#matte-blush)" transform="rotate(12 565 495)"/>
      <line x1="495" y1="480" x2="635" y2="480" stroke="url(#rose-gold)" stroke-width="3" transform="rotate(12 565 495)"/>
      <circle cx="510" cy="460" r="14" fill="none" stroke="url(#champagne-gold)" stroke-width="6"/>
      <!-- Connecting gold curb chain -->
      <path d="M390 460 C430 530 470 530 510 460" stroke="url(#champagne-gold)" stroke-width="8" stroke-dasharray="14 6" fill="none" stroke-linecap="round"/>
    </g>`,

  'truth-dare-cards': () => `
    <!-- Truth or Dare: Luxury Ivory & Gold Slide Box Deck -->
    <g transform="translate(0, 20)">
      <!-- Bottom base card stack -->
      <rect x="330" y="360" width="240" height="320" rx="16" fill="#F5EFE6" transform="rotate(-6 450 520)"/>
      <!-- Top featured luxury box lid -->
      <rect x="330" y="340" width="240" height="320" rx="16" fill="#FCFAF7" stroke="url(#champagne-gold)" stroke-width="2"/>
      <rect x="350" y="360" width="200" height="280" rx="10" fill="none" stroke="url(#champagne-gold)" stroke-width="1.5"/>
      <!-- Gold foil geometric emblem & typography -->
      <polygon points="450,420 480,450 450,480 420,450" fill="none" stroke="url(#champagne-gold)" stroke-width="2"/>
      <text x="450" y="525" font-family="'Playfair Display', Georgia, serif" font-size="20" font-weight="700" letter-spacing="3" fill="#292524" text-anchor="middle">TRUTH</text>
      <text x="450" y="550" font-family="'Outfit', sans-serif" font-size="11" font-weight="600" letter-spacing="4" fill="#B58A5E" text-anchor="middle">OR DARE</text>
      <line x1="410" y1="570" x2="490" y2="570" stroke="url(#champagne-gold)" stroke-width="1"/>
      <text x="450" y="600" font-family="'Outfit', sans-serif" font-size="8" letter-spacing="2" fill="#78716C" text-anchor="middle">100 INTIMATE CARDS</text>
    </g>`,

  'dice-set': () => `
    <!-- Love Dice: Pair of Resin Dice & Velvet Pouch -->
    <g transform="translate(0, 30)">
      <!-- Left Die -->
      <rect x="310" y="440" width="130" height="130" rx="24" fill="#FCFAF7" stroke="rgba(60,45,35,0.08)" stroke-width="2" transform="rotate(-15 375 505)"/>
      <circle cx="375" cy="505" r="12" fill="url(#rose-gold)" transform="rotate(-15 375 505)"/>
      <circle cx="340" cy="470" r="10" fill="url(#rose-gold)" transform="rotate(-15 375 505)"/>
      <circle cx="410" cy="540" r="10" fill="url(#rose-gold)" transform="rotate(-15 375 505)"/>
      <!-- Right Die -->
      <rect x="460" y="440" width="130" height="130" rx="24" fill="#FCFAF7" stroke="rgba(60,45,35,0.08)" stroke-width="2" transform="rotate(12 525 505)"/>
      <circle cx="525" cy="505" r="12" fill="url(#champagne-gold)" transform="rotate(12 525 505)"/>
      <circle cx="490" cy="470" r="10" fill="url(#champagne-gold)" transform="rotate(12 525 505)"/>
      <circle cx="560" cy="540" r="10" fill="url(#champagne-gold)" transform="rotate(12 525 505)"/>
      <circle cx="490" cy="540" r="10" fill="url(#champagne-gold)" transform="rotate(12 525 505)"/>
      <circle cx="560" cy="470" r="10" fill="url(#champagne-gold)" transform="rotate(12 525 505)"/>
    </g>`,

  'mood-candles': () => `
    <!-- Mood Candles: Ceramic Vessel & Wooden Wick -->
    <g transform="translate(0, 20)">
      <!-- Matte ceramic vessel -->
      <path d="M340 400 L560 400 L530 670 L370 670 Z" fill="url(#matte-cream)"/>
      <ellipse cx="450" cy="400" rx="110" ry="24" fill="#F0E6D8"/>
      <!-- Melted warm wax pool -->
      <ellipse cx="450" cy="405" rx="98" ry="20" fill="url(#amber-oil)" opacity="0.8"/>
      <!-- Wooden wick and flame -->
      <rect x="446" y="375" width="8" height="26" rx="2" fill="#5C3A21"/>
      <path d="M450 310 C465 340 468 365 450 380 C432 365 435 340 450 310 Z" fill="url(#champagne-gold)"/>
      <circle cx="450" cy="355" r="30" fill="#FFE082" opacity="0.25" filter="url(#soft-blur)"/>
      <!-- Vessel Label -->
      <text x="450" y="540" font-family="'Outfit', sans-serif" font-size="13" font-weight="700" letter-spacing="4" fill="#292524" text-anchor="middle">LOVE.</text>
      <text x="450" y="565" font-family="'Outfit', sans-serif" font-size="9" letter-spacing="2" fill="#78716C" text-anchor="middle">MOOD CANDLE</text>
    </g>`,

  'massage-stone': () => `
    <!-- Massage Stone: Stacked Polished Zen Stones -->
    <g transform="translate(0, 40)">
      <!-- Bottom large basalt stone -->
      <ellipse cx="450" cy="610" rx="180" ry="60" fill="url(#matte-obsidian)"/>
      <ellipse cx="440" cy="590" rx="130" ry="35" fill="#FFFFFF" opacity="0.15"/>
      <!-- Middle rose quartz stone -->
      <ellipse cx="450" cy="510" rx="135" ry="48" fill="url(#matte-blush)"/>
      <ellipse cx="435" cy="495" rx="95" ry="26" fill="#FFFFFF" opacity="0.3"/>
      <!-- Top basalt stone -->
      <ellipse cx="450" cy="425" rx="95" ry="36" fill="url(#matte-obsidian)"/>
      <ellipse cx="440" cy="415" rx="65" ry="20" fill="#FFFFFF" opacity="0.2"/>
    </g>`
};

function writeProductImg(slug, i, title) {
  const renderFn = PRODUCT_VECTORS[slug] || PRODUCT_VECTORS['aurora-wand'];
  const svgContent = studioWrapper(renderFn(), i + 1, title);
  fs.mkdirSync(UPLOADS, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS, slug + '.svg'), svgContent);
  return '/uploads/' + slug + '.svg';
}

const hash = hashPassword;

const PRODUCTS = [
  ['vibratori', 'Vibratörler', [
    ['aurora-wand', 'Aura Wand', 'Sessiz motor, 10 mod, su geçirmez silikon wand.', 1299, 89],
    ['nova-point', 'Nova Point', 'Kompakt g-nokta tasarımı, USB-C şarjlı.', 849, 64],
    ['lumen-duo', 'Lumen Duo', 'Çift motorlu, aplikasyon kontrollü.', 1749, 47],
    ['puls-rabbit', 'Puls Rabbit', 'Klasik rabbit formu, 12 ritim.', 1099, 73]
  ]],
  ['ciftler', 'Çiftler İçin', [
    ['we-vibe-stil', 'Duo Ring', 'Çiftler için titreşim halkası, sessiz mod.', 999, 58],
    ['remote-love', 'Remote Love', 'Uzaktan kumandalı, 8 metre çekim.', 1399, 36],
    ['silk-bondage-set', 'Silk Set', 'Başlangıç için 4 parça ipek set.', 649, 81],
    ['heat-couple', 'Heat Couple', 'Isıtma özellikli çift aksesuarı.', 1199, 29]
  ]],
  ['kozmetik', 'Kozmetik & Bakım', [
    ['silk-touch-oil', 'Silk Touch Yağ', 'Vücut masaj yağı, vanilya notalı, 100ml.', 349, 92],
    ['rose-mist', 'Rose Mist', 'Ferahlatıcı vücut spreyi, 50ml.', 259, 67],
    ['velvet-balm', 'Velvet Balm', 'Nemlendirici bakım balmları.', 299, 54],
    ['glow-serum', 'Glow Serum', 'Parlatıcı vücut serumu.', 419, 43]
  ]],
  ['fantasy', 'Fantasy & Kostüm', [
    ['noir-mask', 'Noir Maske', 'El yapımı dantel göz maskesi.', 229, 76],
    ['lace-robe', 'Lace Robe', 'Fransız danteli sabahlık, S-XL.', 749, 61],
    ['feather-tickle', 'Feather Tickle', 'Kuş tüyü gıdı.', 149, 88],
    ['satin-cuffs', 'Satin Cuffs', 'Saten kaplı kelepçe, yumuşak dokulu.', 319, 52]
  ]],
  ['oyunlar', 'Oyunlar & Aksesuar', [
    ['truth-dare-cards', 'Truth or Dare', 'Çiftler için 100 kart, 2 seviye.', 199, 84],
    ['dice-set', 'Love Dice', '2 adet aksiyon zarı, kadife kese.', 129, 95],
    ['mood-candles', 'Mood Candles', 'Düşük ısıda masaj mumu, 2li.', 389, 71],
    ['massage-stone', 'Massage Stone', 'Isıtılabilir masaj taşları seti.', 459, 49]
  ]]
];

function seed(force) {
  const dbFile = require('./db').DB_FILE;
  if (fs.existsSync(dbFile) && !force) {
    const existing = load();
    if (existing.products && existing.products.length) {
      // Regenerate all images to apply the studio art direction consistently
      existing.products.forEach((p, idx) => {
        p.image = writeProductImg(p.slug, idx, p.name);
        p.gallery = [p.image];
      });
      existing.categories.forEach((c) => {
        const cover = existing.products.find((p) => p.category === c.slug && p.bestSeller) || existing.products.find((p) => p.category === c.slug);
        if (cover) c.image = cover.image;
      });
      save();
      return;
    }
  }
  if (fs.existsSync(dbFile) && force) fs.unlinkSync(dbFile);
  const db = load();
  fs.mkdirSync(UPLOADS, { recursive: true });

  const categories = [
    { slug: 'vibratori', name: 'Vibratörler', tagline: 'Sessiz. Güçlü. Senin.', icon: 'spark' },
    { slug: 'ciftler', name: 'Çiftler İçin', tagline: 'Bağlantıyı derinleştirin.', icon: 'ring' },
    { slug: 'kozmetik', name: 'Kozmetik & Bakım', tagline: 'Dokunuşun kimyası.', icon: 'drop' },
    { slug: 'fantasy', name: 'Fantasy & Kostüm', tagline: 'Gecelerine renk kat.', icon: 'mask' },
    { slug: 'oyunlar', name: 'Oyunlar & Aksesuar', tagline: 'Oynayarak keşfet.', icon: 'dice' }
  ];

  db.products = [];
  let i = 0;
  for (const [catSlug, catName, items] of PRODUCTS) {
    for (const [slug, name, desc, price, stock] of items) {
      const image = writeProductImg(slug, i, name);
      db.products.push({
        id: uid('p'),
        slug,
        name,
        category: catSlug,
        categoryName: catName,
        description: desc + ' Vücut dostu malzeme, CE sertifikalı. Gizli paketleme ile gönderilir.',
        longDescription: desc + ' Vücut dostu malzeme, CE sertifikalı. Gizli paketleme ile gönderilir.\n\nÖZELLİKLER\n• Vücut dostu premium malzeme\n• Sessiz teknoloji (40 dB altındaki modellerde)\n• USB ile şarj edilebilir\n• Su geçirmez (IPX7)\n• 2 yıl garanti\n\nKUTU İÇERİĞİ\n• Ürün saklama kesesi\n• USB-C şarj kablosu\n• Türkçe kullanım kılavuzu\n• Gizli paketleme notu',
        price,
        oldPrice: (i % 2 === 1) ? Math.round(price * 1.3 / 10) * 10 : null,
        stock,
        rating: Math.round((42 + Math.random() * 8)) / 10,
        reviewCount: 6 + Math.floor(Math.random() * 35),
        featured: i < 8,
        isNew: i % 4 === 0,
        bestSeller: i % 3 === 0,
        image,
        gallery: [image],
        tags: [catSlug],
        variants: ['standart'],
        createdAt: new Date(Date.now() - i * 86400000).toISOString()
      });
      i++;
    }
  }

  db.categories = categories.map((c) => {
    const cover = db.products.find((p) => p.category === c.slug && p.bestSeller) || db.products.find((p) => p.category === c.slug);
    return { id: uid('ct'), slug: c.slug, name: c.name, image: cover ? cover.image : '', createdAt: new Date().toISOString() };
  });

  if (!db.users.some(u => u.email === 'admin@loveshop.com.tr')) {
    db.users.push({
      id: uid('u'), email: 'admin@loveshop.com.tr', passwordHash: hash('loveshop2026'),
      name: 'Mağaza Yönetimi', role: 'admin', createdAt: new Date().toISOString(), addresses: []
    });
  }

  db.coupons = [
    { id: uid('c'), code: 'LOVE10', type: 'percent', value: 10, minTotal: 0, active: true, used: 14 },
    { id: uid('c'), code: 'GIZLI100', type: 'fixed', value: 100, minTotal: 900, active: true, used: 6 },
    { id: uid('c'), code: 'YENI15', type: 'percent', value: 15, minTotal: 500, active: true, used: 22 }
  ];

  let demoCustomer = db.users.find(u => u.email === 'demo@loveshop.com.tr');
  if (!demoCustomer) {
    demoCustomer = {
      id: uid('u'), email: 'demo@loveshop.com.tr', passwordHash: hash('demo1234'),
      name: 'Demo Müşteri', role: 'customer', createdAt: new Date().toISOString(),
      addresses: [{ label: 'Ev', full: 'Örnek Mah. Aşk Cad. No:7 D:3', city: 'İstanbul', zip: '34700', phone: '0532 000 00 00', discreet: true }]
    };
    db.users.push(demoCustomer);
  }

  db.orders = [
    {
      id: 'LS-1001',
      userId: demoCustomer.id, userEmail: demoCustomer.email, customerName: 'Demo Müşteri',
      items: [
        { productId: db.products[0].id, name: db.products[0].name, price: db.products[0].price, qty: 1, image: db.products[0].image }
      ],
      subtotal: db.products[0].price, shipping: 0, discount: 0, total: db.products[0].price,
      coupon: null, status: 'shipped', payment: 'WhatsApp ile Sipariş', discreet: true,
      address: { label: 'Ev', full: 'Örnek Mah. Aşk Cad. No:7 D:3', city: 'İstanbul', zip: '34700' },
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      note: 'Kapıya bırakılabilir'
    },
    {
      id: 'LS-1002',
      userId: demoCustomer.id, userEmail: demoCustomer.email, customerName: 'Demo Müşteri',
      items: [
        { productId: db.products[9].id, name: db.products[9].name, price: db.products[9].price, qty: 2, image: db.products[9].image }
      ],
      subtotal: db.products[9].price * 2, shipping: 49.9, discount: 0, total: db.products[9].price * 2 + 49.9,
      coupon: null, status: 'processing', payment: 'Mağazadan Teslim & Ödeme', discreet: true,
      address: { label: 'Ev', full: 'Örnek Mah. Aşk Cad. No:7 D:3', city: 'İstanbul', zip: '34700' },
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      note: ''
    }
  ];
  db.meta.seq.order = 2;

  db.reviews = [
    { id: uid('r'), productId: db.products[0].id, userName: 'E*** K.', rating: 5, text: 'Paketleme gerçekten gizliydi, kutudan ürün adı bile belli olmuyordu. Ürün çok sessiz çalışıyor.', approved: true, createdAt: new Date().toISOString() },
    { id: uid('r'), productId: db.products[1].id, userName: 'M*** A.', rating: 4, text: 'Şarj süresi beklediğimden uzun. Tavsiye ederim.', approved: true, createdAt: new Date().toISOString() },
    { id: uid('r'), productId: db.products[5].id, userName: 'S*** Y.', rating: 5, text: 'İndirimle aldım, kalitesi fiyatının çok üstü.', approved: true, createdAt: new Date().toISOString() }
  ];

  db.newsletter = [{ email: 'ornek@mail.com', createdAt: new Date().toISOString() }];

  Object.assign(db.settings, {
    storeName: 'Love.',
    supportEmail: 'info@loveshop.com.tr',
    supportPhone: '+90 543 633 13 25',
    whatsapp: 'https://wa.me/905436331325',
    address: 'İsmet İnönü-1 Cd. 52/2 (Akbank Yanı), Ilgaz İş Hanı Kat:1 Daire:2, 26170 Tepebaşı/Eskişehir',
    mapsQuery: encodeURIComponent('Love Sex Shop Eskişehir Erotik Shop'),
    announcement: 'WHATSAPP SİPARİŞ + MAĞAZADA ÖDEME — GİZLİ PAKETLEME GARANTİSİ'
  });

  save();
  console.log('Seed tamamlandı: ' + db.products.length + ' ürün stüdyo görselleriyle oluşturuldu.');
}

module.exports = seed;

if (require.main === module) {
  seed(process.argv.includes('--force'));
}

module.exports = seed;

if (require.main === module) {
  seed(process.argv.includes('--force'));
}
