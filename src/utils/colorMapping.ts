// colorUtils.ts

export interface ColorMapping {
  name: string;
  hex: string;
}

export const COLOR_MAP: Record<string, string> = {
  // Basic colors
  "BLACK": "#444444",
  "WHITE": "#FFFFFF",
  "RED": "#DC2628",
  "BLUE": "#2563EB",
  "GREEN": "#16A34A",
  "YELLOW": "#EAB308",
  "ORANGE": "#EA580C",
  "PURPLE": "#9333EA",
  "PINK": "#EC4899",
  "BROWN": "#A16207",
  
  // Specific variations
  "NAVY": "#1E3A8A",
  "ROYAL": "#1D4ED0",
  "D.GREY": "#374151",
  "H.GREY": "#6B7280",
  "H.PINK": "#F472B6",
  "L.PINK": "#FBCFE8",
  
  "KHAKI": "#B5B48C",
  "BUR": "#660018", // Burgundy
  "G.CAMO": "#4A5D23",
  "D. GREEN": "#006400",
  "SKY": "#87CEEB",
  "AQUA": "#66FFFF",
  "CREAM": "#F5F5DC",
  "OLIVE": "#808000",
  
  // Additional named colors
  "LAVENDER": "#E6E6FA",
  "L.GRAY": "#D3D3D3",
  "CHARCOAL": "#36454F",
  "COFFEE": "#6F4E37",
  "BURGUNDY": "#660018",
  "HOT PINK": "#FF69B4",
  "MUSTARD GOLD": "#FFDB58",
  "MANGO": "#FDBE02",
  "WINE": "#722F37",
  "D. GREY": "#374151",
  "BLK(RED)": "#4B1A1A",
  "MNT(RED)": "#C34A4A",
  "L. GREY": "#D3D3D3",
  "DARK RED": "#8B0000",
  "DARK GREEN": "#006400",
  "TANGERINE": "#F28500",
  "DARK GREY": "#A9A9A9",
  "LIGHT GREY": "#D3D3D3",
  "D.GRE": "#006400",
  "K.GRE": "#B6B69A",
  "GOLD": "#FFFF33",
  "N.ORA": "#FF5C00",
  "N.YEL": "#FFFF06",
  "N.GRE": "#00EE66",
  "MINT": "#98FB98",
  
  // Tie-dye combos
    "WHT/BLK": "#444445",
    "WHT/NAV": "#1E3A8B",
    "WHT/D.GR": "#374152",
    "WHT/RED": "#DC2627",
    "WHT/H.PINK": "#F472B7",
    "WHT/L.PINK": "#FBCFE9",
    "WHT/ROY": "#1D4ED9",
    "WHT/AQUA": "#00FFFF",
    "WHT/SKY": "#87CEEC",
    "WHT/BRO": "#A16208",
    "WHT/KHI": "#A3A381",
    "WHT/PUR": "#9333EB",
    "WHT/GOLD": "#FFD701",
    "WHT/D.GRE": "#006401",
    "WHT/K.GRE": "#A3A381",
    "WHT/N.GRE": "#00FF01",
    "WHT/N.ORA": "#FF8C01",
    "WHT/N.YEL": "#FFFF00",
    "WHT/BUR": "#800021",
    "WHT/LAV": "#E6E6FB",
    "WHT/OLI": "#808001",
    "WHT/MINT": "#98FB99",

    "CAMO/BLK": "#4B5320",
  "KHI/BRO": "#C3B091",
  "GOLD/BLK": "#E6B800", // gold/black -> bright gold
  "GOLD/NAVY": "#FFCC00", // gold/navy -> slightly darker gold
  "GOLD/ROY": "#FFB900", // gold/royal -> warm gold
  "RED/WHT/ROY": "FF1A1A", // red/white/royal -> pure red
  "RED/WHT/BLK": "#CC0000", // red/white/black -> darker red
  "BLK/WHT/RED": "#990000", 

  // Fallback
  "DEFAULT": "#6B7280"
};

export function getColorHex(colorName: string): string {
  const upperName = colorName.trim().toUpperCase();
  return COLOR_MAP[upperName] || COLOR_MAP["DEFAULT"];
}

export function getColorMapping(colorName: string): ColorMapping {
  return {
    name: colorName,
    hex: getColorHex(colorName)
  };
}

// Models that use textures instead of solid colors
export const TEXTURE_MODELS = ['hat', 'panel_laser', 'panel-dye'];

export function hasTexture(modelKey: string): boolean {
  return TEXTURE_MODELS.includes(modelKey);
}

export function getTextureUrl(modelKey: string, colorName: string): string | null {
  // Only used for special models like panel-dye — safe to keep as-is
  const { TEXTURE_OPTIONS } = require('../components/constants/designConstatns');
  
  const modelTextures = TEXTURE_OPTIONS[modelKey];
  if (!modelTextures) return null;

  const COLOR_TO_TEXTURE_NAME: Record<string, Record<string, string>> = {
    'hat': {
      'SKY': 'Blue',
      'PURPLE': 'Purple', 
      'BLACK': 'Black',
      'HOT PINK': 'Heather Pink',
      'MUSTARD GOLD': 'Mango',
      'NAVY': 'Navy',
      'WINE': 'Wine',
      'DARK GREEN': 'Dark Green',
      'KHAKI': 'Khaki',
      'TANGERINE': 'Mango',
      'RED': 'Red',
      'ROYAL': 'Royal Blue',
      'WHITE': 'White'
    },
  };

  const colorMapping = COLOR_TO_TEXTURE_NAME[modelKey];
  if (!colorMapping) return null;

  const textureName = colorMapping[colorName.toUpperCase()];
  if (!textureName) return null;

  const textureOption = modelTextures.find((option: any) => option.name === textureName);
  return textureOption?.url || null;
}