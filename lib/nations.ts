// squadId (players.json) -> nation code + flag. Single source of truth.
export const SQUAD_NATIONS: Record<number, { code: string; flag: string }> = {
  1: { code: "ALG", flag: "🇩🇿" },  2: { code: "ARG", flag: "🇦🇷" },
  3: { code: "AUS", flag: "🇦🇺" },  4: { code: "AUT", flag: "🇦🇹" },
  5: { code: "BEL", flag: "🇧🇪" },  6: { code: "BIH", flag: "🇧🇦" },
  7: { code: "BRA", flag: "🇧🇷" },  8: { code: "CPV", flag: "🇨🇻" },
  9: { code: "CAN", flag: "🇨🇦" },  10: { code: "COL", flag: "🇨🇴" },
  11: { code: "COD", flag: "🇨🇩" }, 12: { code: "CIV", flag: "🇨🇮" },
  13: { code: "CRO", flag: "🇭🇷" }, 14: { code: "CUW", flag: "🇨🇼" },
  15: { code: "CZE", flag: "🇨🇿" }, 16: { code: "ECU", flag: "🇪🇨" },
  17: { code: "EGY", flag: "🇪🇬" }, 18: { code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  19: { code: "FRA", flag: "🇫🇷" }, 20: { code: "GER", flag: "🇩🇪" },
  21: { code: "GHA", flag: "🇬🇭" }, 22: { code: "HAI", flag: "🇭🇹" },
  23: { code: "IRN", flag: "🇮🇷" }, 24: { code: "IRQ", flag: "🇮🇶" },
  25: { code: "JPN", flag: "🇯🇵" }, 26: { code: "JOR", flag: "🇯🇴" },
  27: { code: "KOR", flag: "🇰🇷" }, 28: { code: "MEX", flag: "🇲🇽" },
  29: { code: "MAR", flag: "🇲🇦" }, 30: { code: "NED", flag: "🇳🇱" },
  31: { code: "NZL", flag: "🇳🇿" }, 32: { code: "NOR", flag: "🇳🇴" },
  33: { code: "PAN", flag: "🇵🇦" }, 34: { code: "PAR", flag: "🇵🇾" },
  35: { code: "POR", flag: "🇵🇹" }, 36: { code: "QAT", flag: "🇶🇦" },
  37: { code: "KSA", flag: "🇸🇦" }, 38: { code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  39: { code: "SEN", flag: "🇸🇳" }, 40: { code: "RSA", flag: "🇿🇦" },
  41: { code: "ESP", flag: "🇪🇸" }, 42: { code: "SWE", flag: "🇸🇪" },
  43: { code: "SUI", flag: "🇨🇭" }, 44: { code: "TUN", flag: "🇹🇳" },
  45: { code: "TUR", flag: "🇹🇷" }, 46: { code: "URU", flag: "🇺🇾" },
  47: { code: "USA", flag: "🇺🇸" }, 48: { code: "UZB", flag: "🇺🇿" },
};

export const nationOf = (squadId: number) =>
  SQUAD_NATIONS[squadId] ?? { code: "UNK", flag: "🏳️" };

// Squad composition rules (group stage)
export const POSITION_QUOTA = { GK: 2, DEF: 5, MID: 5, FWD: 3 } as const;
export const STARTING_QUOTA = { GK: 1, DEF: 4, MID: 4, FWD: 2 } as const; // default 4-4-2
export const MAX_PER_NATION = 3;
export const BUDGET = 100;
