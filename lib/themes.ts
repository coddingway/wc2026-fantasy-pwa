// Team theming — 48 WC2026 nations.
// Each team has one ACCENT hue (drives the whole UI via the emerald CSS vars)
// and up to 3 FLAG colors (used only for the flag gradient strip).
// All accents pass through the same lightness ramp, so every theme has
// identical contrast/brightness — consistency guaranteed.

export interface Team {
  code: string;
  name: string;
  flag: string;
  group: string;
  accent: string;       // base hex — UI accent hue
  flagColors: string[]; // 2-3 colors for the flag gradient strip
}

export const TEAMS: Team[] = [
  // Group A
  { code: "MEX", name: "Mexico",        flag: "🇲🇽", group: "A", accent: "#0B7A40", flagColors: ["#006847", "#FFFFFF", "#CE1126"] },
  { code: "RSA", name: "South Africa",  flag: "🇿🇦", group: "A", accent: "#007A4D", flagColors: ["#007A4D", "#FFB612", "#DE3831"] },
  { code: "KOR", name: "South Korea",   flag: "🇰🇷", group: "A", accent: "#CD2E3A", flagColors: ["#CD2E3A", "#FFFFFF", "#0047A0"] },
  { code: "CZE", name: "Czechia",       flag: "🇨🇿", group: "A", accent: "#D7141A", flagColors: ["#FFFFFF", "#D7141A", "#11457E"] },
  // Group B
  { code: "CAN", name: "Canada",        flag: "🇨🇦", group: "B", accent: "#FF0000", flagColors: ["#FF0000", "#FFFFFF"] },
  { code: "SUI", name: "Switzerland",   flag: "🇨🇭", group: "B", accent: "#DA291C", flagColors: ["#DA291C", "#FFFFFF"] },
  { code: "BIH", name: "Bosnia",        flag: "🇧🇦", group: "B", accent: "#FECB00", flagColors: ["#002395", "#FECB00"] },
  { code: "QAT", name: "Qatar",         flag: "🇶🇦", group: "B", accent: "#8A1538", flagColors: ["#8A1538", "#FFFFFF"] },
  // Group C
  { code: "BRA", name: "Brazil",        flag: "🇧🇷", group: "C", accent: "#009739", flagColors: ["#009739", "#FEDD00", "#012169"] },
  { code: "MAR", name: "Morocco",       flag: "🇲🇦", group: "C", accent: "#C1272D", flagColors: ["#C1272D", "#006233"] },
  { code: "HAI", name: "Haiti",         flag: "🇭🇹", group: "C", accent: "#00209F", flagColors: ["#00209F", "#D21034"] },
  { code: "SCO", name: "Scotland",      flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", accent: "#0065BF", flagColors: ["#0065BF", "#FFFFFF"] },
  // Group D
  { code: "USA", name: "United States", flag: "🇺🇸", group: "D", accent: "#B22234", flagColors: ["#B22234", "#FFFFFF", "#3C3B6E"] },
  { code: "PAR", name: "Paraguay",      flag: "🇵🇾", group: "D", accent: "#D52B1E", flagColors: ["#D52B1E", "#FFFFFF", "#0038A8"] },
  { code: "AUS", name: "Australia",     flag: "🇦🇺", group: "D", accent: "#FFCD00", flagColors: ["#00843D", "#FFCD00"] },
  { code: "TUR", name: "Türkiye",       flag: "🇹🇷", group: "D", accent: "#E30A17", flagColors: ["#E30A17", "#FFFFFF"] },
  // Group E
  { code: "GER", name: "Germany",       flag: "🇩🇪", group: "E", accent: "#DD0000", flagColors: ["#000000", "#DD0000", "#FFCE00"] },
  { code: "CUW", name: "Curaçao",       flag: "🇨🇼", group: "E", accent: "#002B7F", flagColors: ["#002B7F", "#F9E814"] },
  { code: "CIV", name: "Ivory Coast",   flag: "🇨🇮", group: "E", accent: "#FF8200", flagColors: ["#FF8200", "#FFFFFF", "#009A44"] },
  { code: "ECU", name: "Ecuador",       flag: "🇪🇨", group: "E", accent: "#FFD100", flagColors: ["#FFD100", "#0072CE", "#EF3340"] },
  // Group F
  { code: "NED", name: "Netherlands",   flag: "🇳🇱", group: "F", accent: "#FF6F00", flagColors: ["#AE1C28", "#FFFFFF", "#21468B"] },
  { code: "JPN", name: "Japan",         flag: "🇯🇵", group: "F", accent: "#BC002D", flagColors: ["#FFFFFF", "#BC002D"] },
  { code: "SWE", name: "Sweden",        flag: "🇸🇪", group: "F", accent: "#FFCD00", flagColors: ["#006AA7", "#FFCD00"] },
  { code: "TUN", name: "Tunisia",       flag: "🇹🇳", group: "F", accent: "#E70013", flagColors: ["#E70013", "#FFFFFF"] },
  // Group G
  { code: "BEL", name: "Belgium",       flag: "🇧🇪", group: "G", accent: "#FDDA24", flagColors: ["#000000", "#FDDA24", "#EF3340"] },
  { code: "EGY", name: "Egypt",         flag: "🇪🇬", group: "G", accent: "#CE1126", flagColors: ["#CE1126", "#FFFFFF", "#000000"] },
  { code: "IRN", name: "Iran",          flag: "🇮🇷", group: "G", accent: "#239F40", flagColors: ["#239F40", "#FFFFFF", "#DA0000"] },
  { code: "NZL", name: "New Zealand",   flag: "🇳🇿", group: "G", accent: "#00247D", flagColors: ["#00247D", "#CC142B"] },
  // Group H
  { code: "ESP", name: "Spain",         flag: "🇪🇸", group: "H", accent: "#C60B1E", flagColors: ["#C60B1E", "#FFC400"] },
  { code: "CPV", name: "Cape Verde",    flag: "🇨🇻", group: "H", accent: "#003893", flagColors: ["#003893", "#FFFFFF", "#CF2027"] },
  { code: "KSA", name: "Saudi Arabia",  flag: "🇸🇦", group: "H", accent: "#006C35", flagColors: ["#006C35", "#FFFFFF"] },
  { code: "URU", name: "Uruguay",       flag: "🇺🇾", group: "H", accent: "#7BAFD4", flagColors: ["#7BAFD4", "#FFFFFF", "#FCD116"] },
  // Group I
  { code: "FRA", name: "France",        flag: "🇫🇷", group: "I", accent: "#0055A4", flagColors: ["#0055A4", "#FFFFFF", "#EF4135"] },
  { code: "SEN", name: "Senegal",       flag: "🇸🇳", group: "I", accent: "#00853F", flagColors: ["#00853F", "#FDEF42", "#E31B23"] },
  { code: "NOR", name: "Norway",        flag: "🇳🇴", group: "I", accent: "#BA0C2F", flagColors: ["#BA0C2F", "#FFFFFF", "#00205B"] },
  { code: "IRQ", name: "Iraq",          flag: "🇮🇶", group: "I", accent: "#CE1126", flagColors: ["#CE1126", "#FFFFFF", "#000000"] },
  // Group J
  { code: "ARG", name: "Argentina",     flag: "🇦🇷", group: "J", accent: "#6CACE4", flagColors: ["#75AADB", "#FFFFFF", "#75AADB"] },
  { code: "ALG", name: "Algeria",       flag: "🇩🇿", group: "J", accent: "#006233", flagColors: ["#006233", "#FFFFFF", "#D21034"] },
  { code: "AUT", name: "Austria",       flag: "🇦🇹", group: "J", accent: "#ED2939", flagColors: ["#ED2939", "#FFFFFF"] },
  { code: "JOR", name: "Jordan",        flag: "🇯🇴", group: "J", accent: "#007A3D", flagColors: ["#000000", "#FFFFFF", "#007A3D"] },
  // Group K
  { code: "POR", name: "Portugal",      flag: "🇵🇹", group: "K", accent: "#DA291C", flagColors: ["#046A38", "#DA291C"] },
  { code: "COD", name: "DR Congo",      flag: "🇨🇩", group: "K", accent: "#007FFF", flagColors: ["#007FFF", "#F7D618", "#CE1021"] },
  { code: "UZB", name: "Uzbekistan",    flag: "🇺🇿", group: "K", accent: "#0099B5", flagColors: ["#0099B5", "#FFFFFF", "#1EB53A"] },
  { code: "COL", name: "Colombia",      flag: "🇨🇴", group: "K", accent: "#FCD116", flagColors: ["#FCD116", "#003893", "#CE1126"] },
  // Group L
  { code: "ENG", name: "England",       flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", accent: "#CE1124", flagColors: ["#FFFFFF", "#CE1124"] },
  { code: "CRO", name: "Croatia",       flag: "🇭🇷", group: "L", accent: "#FF0000", flagColors: ["#FF0000", "#FFFFFF", "#171796"] },
  { code: "GHA", name: "Ghana",         flag: "🇬🇭", group: "L", accent: "#FCD116", flagColors: ["#CE1126", "#FCD116", "#006B3F"] },
  { code: "PAN", name: "Panama",        flag: "🇵🇦", group: "L", accent: "#005293", flagColors: ["#005293", "#FFFFFF", "#D21034"] },
];

export const getTeam = (code: string | null) => TEAMS.find((t) => t.code === code) ?? null;

// ---- shade math: same lightness ramp for every team = consistent UI ----

function hexToHsl(hex: string): [number, number, number] {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

// Normalized lightness per step — identical ramp for every nation.
const RAMP: Record<number, number> = {
  300: 72, 400: 62, 500: 52, 600: 44, 700: 36, 800: 28, 900: 20, 950: 13,
};

export function buildAccentScale(hex: string): Record<number, string> {
  const [h, s] = hexToHsl(hex);
  const sat = Math.max(s, 35); // floor saturation so pale flags still read as a color
  const out: Record<number, string> = {};
  for (const step of Object.keys(RAMP).map(Number)) {
    out[step] = `hsl(${h.toFixed(1)} ${sat.toFixed(0)}% ${RAMP[step]}%)`;
  }
  return out;
}

// Apply theme to the document — overrides the emerald/teal CSS vars the UI uses.
export function applyTeamTheme(code: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const team = getTeam(code);
  if (!team) {
    // reset to default emerald
    for (const step of [300, 400, 500, 600, 700, 800, 900, 950]) {
      root.style.removeProperty(`--accent-${step}`);
    }
    root.style.removeProperty("--flag-gradient");
    return;
  }
  const scale = buildAccentScale(team.accent);
  for (const [step, color] of Object.entries(scale)) {
    root.style.setProperty(`--accent-${step}`, color);
  }
  const stops = team.flagColors.join(", ");
  root.style.setProperty("--flag-gradient", `linear-gradient(90deg, ${stops})`);
}
