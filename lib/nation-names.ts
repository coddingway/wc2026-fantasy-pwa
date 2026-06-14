// Map free-text team names (TheSportsDB) -> our 3-letter codes.
const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");

const NAME_TO_CODE: Record<string, string> = {};
const add = (code: string, ...names: string[]) => names.forEach((n) => (NAME_TO_CODE[norm(n)] = code));

add("MEX", "Mexico");
add("RSA", "South Africa");
add("KOR", "South Korea", "Korea Republic");
add("CZE", "Czech Republic", "Czechia");
add("CAN", "Canada");
add("BIH", "Bosnia-Herzegovina", "Bosnia and Herzegovina", "Bosnia");
add("SUI", "Switzerland");
add("QAT", "Qatar");
add("BRA", "Brazil");
add("MAR", "Morocco");
add("HAI", "Haiti");
add("SCO", "Scotland");
add("USA", "United States", "USA");
add("PAR", "Paraguay");
add("AUS", "Australia");
add("TUR", "Turkey", "Turkiye", "Türkiye");
add("GER", "Germany");
add("CUW", "Curacao", "Curaçao");
add("CIV", "Ivory Coast", "Cote d'Ivoire", "Côte d'Ivoire");
add("ECU", "Ecuador");
add("NED", "Netherlands");
add("JPN", "Japan");
add("SWE", "Sweden");
add("TUN", "Tunisia");
add("BEL", "Belgium");
add("EGY", "Egypt");
add("IRN", "Iran");
add("NZL", "New Zealand");
add("ESP", "Spain");
add("CPV", "Cape Verde", "Cabo Verde");
add("KSA", "Saudi Arabia");
add("URU", "Uruguay");
add("FRA", "France");
add("SEN", "Senegal");
add("NOR", "Norway");
add("IRQ", "Iraq");
add("ARG", "Argentina");
add("ALG", "Algeria");
add("AUT", "Austria");
add("JOR", "Jordan");
add("POR", "Portugal");
add("COD", "DR Congo", "Congo DR", "Democratic Republic of the Congo");
add("UZB", "Uzbekistan");
add("COL", "Colombia");
add("ENG", "England");
add("CRO", "Croatia");
add("GHA", "Ghana");
add("PAN", "Panama");

export const codeFromName = (name: string): string | null => NAME_TO_CODE[norm(name)] ?? null;
