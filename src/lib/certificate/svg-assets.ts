/**
 * CampusCred — SVG Asset Generators for Certificate Templates
 * 
 * Generates all SVG decorative elements used in the certificate:
 * - Guilloche security pattern
 * - Corner ornaments (4 orientations)
 * - Digital seal
 * - Ornamental dividers
 * - CampusCred watermark
 */

/** CampusCred shield+graduation+checkmark SVG as a data URI */
export function campusCredLogoDataUri(
  width: number = 180,
  color: string = '#D4AF37'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 64 64" fill="none">
    <path d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/>
    <path d="M18 28L32 20L46 28L32 36L18 28Z" fill="${color}"/>
    <path d="M32 36V44" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
    <circle cx="32" cy="45" r="2" fill="${color}"/>
    <path d="M24 35L30 41L42 27" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/** CampusCred shield icon only (smaller, for seal center) */
export function campusCredShieldDataUri(size: number = 30, color: string = '#D4AF37'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none">
    <path d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="2"/>
    <path d="M22 32L29 39L42 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate guilloche security pattern SVG (currency-note style wavy lines)
 * This pattern appears in the border region of the certificate
 */
export function guillochePatternSvg(
  width: number = 3508,
  height: number = 2480,
  opacity: number = 0.04,
  color: string = '#D4AF37'
): string {
  const tileSize = 40;
  const cols = Math.ceil(width / tileSize);
  const rows = Math.ceil(height / tileSize);

  let paths = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      // Create a small wavy diamond pattern
      const cx = x + tileSize / 2;
      const cy = y + tileSize / 2;
      const wave = tileSize * 0.35;
      paths += `<path d="M${cx} ${cy - wave} Q${cx + wave} ${cy} ${cx} ${cy + wave} Q${cx - wave} ${cy} ${cx} ${cy - wave}Z" fill="none" stroke="${color}" stroke-width="0.5" opacity="${opacity}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${paths}</svg>`;
}

/**
 * Generate the guilloche as a base64 data URI
 */
export function guillocheDataUri(
  width: number = 3508,
  height: number = 2480
): string {
  const svg = guillochePatternSvg(width, height);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate a corner ornament SVG (floral/botanical flourish)
 * Classical diploma-style ornamental corner piece
 */
export function cornerOrnamentSvg(
  size: number = 120,
  color: string = '#D4AF37',
  _flip: 'none' | 'h' | 'v' | 'hv' = 'none'
): string {
  const s = size;
  // Elegant floral corner flourish
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 120 120" fill="none">
    <!-- Main L-shape flourish -->
    <path d="M5 5 L5 60 Q5 45 15 35 L25 25 Q15 35 12 50 L5 60" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M5 5 L60 5 Q45 5 35 15 L25 25 Q35 15 50 12 L60 5" stroke="${color}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    
    <!-- Inner scroll curves -->
    <path d="M12 12 Q20 8 30 12 Q22 16 16 22 Q10 30 12 12Z" fill="${color}" opacity="0.15"/>
    <path d="M15 15 Q25 10 38 15 Q28 20 20 28 Q12 38 15 15Z" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>
    
    <!-- Leaf flourish on vertical arm -->
    <path d="M5 40 Q-5 35 5 28 Q10 35 5 40Z" fill="${color}" opacity="0.4"/>
    <path d="M5 55 Q-8 48 5 42 Q12 48 5 55Z" fill="${color}" opacity="0.3"/>
    
    <!-- Leaf flourish on horizontal arm -->
    <path d="M40 5 Q35 -5 28 5 Q35 10 40 5Z" fill="${color}" opacity="0.4"/>
    <path d="M55 5 Q48 -8 42 5 Q48 12 55 5Z" fill="${color}" opacity="0.3"/>
    
    <!-- Central rosette -->
    <circle cx="18" cy="18" r="4" fill="${color}" opacity="0.3"/>
    <circle cx="18" cy="18" r="2" fill="${color}" opacity="0.6"/>
    
    <!-- Small decorative dots -->
    <circle cx="8" cy="8" r="1.5" fill="${color}" opacity="0.5"/>
    <circle cx="5" cy="20" r="1" fill="${color}" opacity="0.4"/>
    <circle cx="20" cy="5" r="1" fill="${color}" opacity="0.4"/>
    
    <!-- Extended flourish tips -->
    <path d="M5 70 Q0 65 5 60 Q8 65 5 70Z" fill="${color}" opacity="0.2"/>
    <path d="M70 5 Q65 0 60 5 Q65 8 70 5Z" fill="${color}" opacity="0.2"/>
  </svg>`;
  return svg;
}

/**
 * Generate corner ornament as data URI with proper flipping
 */
export function cornerOrnamentDataUri(
  position: 'tl' | 'tr' | 'bl' | 'br',
  size: number = 120
): string {
  // Generate the ornament directly for each position with CSS transform
  const baseSvg = cornerOrnamentSvg(size, '#D4AF37');
  
  let transformStyle = '';
  if (position === 'tr') {
    transformStyle = `transform: scaleX(-1);`;
  } else if (position === 'bl') {
    transformStyle = `transform: scaleY(-1);`;
  } else if (position === 'br') {
    transformStyle = `transform: scale(-1, -1);`;
  }

  if (transformStyle) {
    // Insert style attribute into the SVG tag
    const modified = baseSvg.replace(
      '<svg ',
      '<svg style="' + transformStyle + '" '
    );
    return 'data:image/svg+xml;base64,' + Buffer.from(modified).toString('base64');
  }

  return 'data:image/svg+xml;base64,' + Buffer.from(baseSvg).toString('base64');
}

/**
 * Generate the ornamental divider SVG (gold line with center diamond)
 */
export function dividerSvg(
  width: number = 300,
  color: string = '#D4AF37'
): string {
  const halfW = width / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="24" viewBox="0 0 ${width} 24">
    <!-- Left line -->
    <line x1="0" y1="12" x2="${halfW - 12}" y2="12" stroke="${color}" stroke-width="2"/>
    <!-- Center diamond -->
    <rect x="${halfW - 4}" y="8" width="8" height="8" fill="${color}" transform="rotate(45 ${halfW} 12)"/>
    <!-- Right line -->
    <line x1="${halfW + 12}" y1="12" x2="${width}" y2="12" stroke="${color}" stroke-width="2"/>
    <!-- Small dots on each side -->
    <circle cx="${halfW - 20}" cy="12" r="1.5" fill="${color}"/>
    <circle cx="${halfW + 20}" cy="12" r="1.5" fill="${color}"/>
  </svg>`;
}

/**
 * Generate the bottom divider with CC monogram
 */
export function bottomDividerSvg(
  width: number = 300,
  color: string = '#D4AF37'
): string {
  const halfW = width / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="30" viewBox="0 0 ${width} 30">
    <!-- Left line -->
    <line x1="0" y1="15" x2="${halfW - 20}" y2="15" stroke="${color}" stroke-width="1.5"/>
    <!-- Center circle with CC monogram -->
    <circle cx="${halfW}" cy="15" r="14" fill="none" stroke="${color}" stroke-width="1.5"/>
    <text x="${halfW}" y="19" text-anchor="middle" font-family="serif" font-size="14" font-weight="bold" fill="${color}">CC</text>
    <!-- Right line -->
    <line x1="${halfW + 20}" y1="15" x2="${width}" y2="15" stroke="${color}" stroke-width="1.5"/>
    <!-- Decorative dots -->
    <circle cx="${halfW - 28}" cy="15" r="1.5" fill="${color}"/>
    <circle cx="${halfW + 28}" cy="15" r="1.5" fill="${color}"/>
  </svg>`;
}

/**
 * Generate divider as data URI
 */
export function dividerDataUri(width: number = 300): string {
  const svg = dividerSvg(width);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate bottom divider as data URI
 */
export function bottomDividerDataUri(width: number = 300): string {
  const svg = bottomDividerSvg(width);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate the digital seal SVG
 * Circular seal with rings, text, and CampusCred shield icon
 */
export function digitalSealSvg(
  size: number = 80,
  goldColor: string = '#D4AF37',
  navyColor: string = '#0A0F2C'
): string {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 2;
  const midR = outerR - 4;
  const innerR = midR - 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <!-- Background -->
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="white"/>
    
    <!-- Gold radial gradient background -->
    <defs>
      <radialGradient id="sealGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FAFAF7"/>
        <stop offset="80%" stop-color="#FFF8E7"/>
        <stop offset="100%" stop-color="#F2D675" stop-opacity="0.3"/>
      </radialGradient>
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="url(#sealGrad)"/>
    
    <!-- Outer gold ring -->
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${goldColor}" stroke-width="2"/>
    
    <!-- Middle navy ring -->
    <circle cx="${cx}" cy="${cy}" r="${midR}" fill="none" stroke="${navyColor}" stroke-width="1" opacity="0.3"/>
    
    <!-- Circular text path -->
    <path id="sealTextPath" d="M ${cx} ${cy - midR + 6} A ${midR - 6} ${midR - 6} 0 1 1 ${cx - 0.01} ${cy - midR + 6}" fill="none"/>
    
    <!-- Circular text -->
    <text font-family="Montserrat, sans-serif" font-size="${Math.max(5, size * 0.075)}" font-weight="600" fill="${goldColor}" letter-spacing="2">
      <textPath href="#sealTextPath" startOffset="2%">• CAMPUSCRED • VERIFIED • INDIA •</textPath>
    </text>
    
    <!-- Inner shield icon -->
    <g transform="translate(${cx - 12}, ${cy - 12}) scale(0.38)">
      <path d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z" fill="${goldColor}" opacity="0.3" stroke="${goldColor}" stroke-width="2"/>
      <path d="M22 32L29 39L42 24" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>
    
    <!-- VERIFIED text below shield -->
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="${Math.max(6, size * 0.0875)}" font-weight="700" fill="${navyColor}">VERIFIED</text>
    
    <!-- Emboss effect -->
    <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="0.5" stroke-dasharray="0 ${outerR * 2} ${outerR}"/>
  </svg>`;
}

/**
 * Generate digital seal as data URI
 */
export function digitalSealDataUri(size: number = 80): string {
  const svg = digitalSealSvg(size);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Generate diagonal watermark pattern SVG
 * Repeats "CampusCred" diagonally across the full canvas
 */
export function watermarkSvg(
  width: number = 3508,
  height: number = 2480,
  opacity: number = 0.03,
  color: string = '#0A0F2C'
): string {
  const spacing = 200;
  const rotation = -30;
  const text = 'CAMPUSCRED';
  const fontSize = 18;

  let texts = '';
  // Calculate how many rows/columns we need to cover the rotated area
  const diagonal = Math.sqrt(width * width + height * height);
  const cols = Math.ceil(diagonal / spacing) + 2;
  const rows = Math.ceil(diagonal / spacing) + 2;
  const offsetX = (diagonal - width) / 2;
  const offsetY = (diagonal - height) / 2;

  for (let row = -2; row < rows; row++) {
    for (let col = -2; col < cols; col++) {
      const x = col * spacing - offsetX;
      const y = row * spacing - offsetY;
      texts += `<text x="${x}" y="${y}" font-family="Poppins, sans-serif" font-size="${fontSize}" font-weight="600" fill="${color}" opacity="${opacity}" transform="rotate(${rotation} ${x} ${y})" letter-spacing="8">${text}</text>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${texts}</svg>`;
}

/**
 * Generate watermark as data URI
 */
export function watermarkDataUri(
  width: number = 3508,
  height: number = 2480
): string {
  const svg = watermarkSvg(width, height);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Level ribbon SVG (for Elite and Legend certificates)
 */
export function levelRibbonSvg(
  level: 'Elite' | 'Legend',
  color: string = '#7C3AED'
): string {
  const bgColor = level === 'Legend' ? '#D4AF37' : color;
  const textColor = level === 'Legend' ? '#0A0F2C' : '#FFFFFF';
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <!-- Diagonal ribbon in top-right corner -->
    <polygon points="120,0 120,45 75,0" fill="${bgColor}"/>
    <polygon points="120,42 120,48 72,0 78,0" fill="${bgColor}" opacity="0.7"/>
    <text x="98" y="24" text-anchor="middle" font-family="Montserrat, sans-serif" font-size="11" font-weight="700" fill="${textColor}" transform="rotate(45 98 24)" letter-spacing="2">${level.toUpperCase()}</text>
  </svg>`;
}

/**
 * Generate level ribbon as data URI
 */
export function levelRibbonDataUri(level: 'Elite' | 'Legend'): string {
  const svg = levelRibbonSvg(level);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
