const languageIcons = {
    'Andorra': 'flagpack:ad',
    'United Arab Emirates': 'flagpack:ae',
    'Afghanistan': 'flagpack:af',
    'Antigua and Barbuda': 'flagpack:ag',
    'Anguilla': 'flagpack:ai',
    'Albania': 'flagpack:al',
    'Armenia': 'flagpack:am',
    'Angola': 'flagpack:ao',
    'Antarctica': 'flagpack:aq',
    'Argentina': 'flagpack:ar',
    'American Samoa': 'flagpack:as',
    'Austria': 'flagpack:at',
    'Australia': 'flagpack:au',
    'Aruba': 'flagpack:aw',
    'Åland Islands': 'flagpack:ax',
    'Azerbaijan': 'flagpack:az',
    'Bosnia and Herzegovina': 'flagpack:ba',
    'Barbados': 'flagpack:bb',
    'Bangladesh': 'flagpack:bd',
    'Belgium': 'flagpack:be',
    'Burkina Faso': 'flagpack:bf',
    'Bulgaria': 'flagpack:bg',
    'Bahrain': 'flagpack:bh',
    'Burundi': 'flagpack:bi',
    'Benin': 'flagpack:bj',
    'Saint Barthélemy': 'flagpack:bl',
    'Bermuda': 'flagpack:bm',
    'Brunei': 'flagpack:bn',
    'Bolivia': 'flagpack:bo',
    'Bonaire': 'flagpack:bq-bo',
    'Saba': 'flagpack:bq-sa',
    'Sint Eustatius': 'flagpack:bq-se',
    'Brazil': 'flagpack:br',
    'Bahamas': 'flagpack:bs',
    'Bhutan': 'flagpack:bt',
    'Bouvet Island': 'flagpack:bv',
    'Botswana': 'flagpack:bw',
    'Belarus': 'flagpack:by',
    'Belize': 'flagpack:bz',
    'Canada': 'flagpack:ca',
    'Cocos (Keeling) Islands': 'flagpack:cc',
    'DR Congo': 'flagpack:cd',
    'Central African Republic': 'flagpack:cf',
    'Congo': 'flagpack:cg',
    'Switzerland': 'flagpack:ch',
    'Ivory Coast': 'flagpack:ci',
    'Cook Islands': 'flagpack:ck',
    'Chile': 'flagpack:cl',
    'Cameroon': 'flagpack:cm',
    'China': 'flagpack:cn',
    'Colombia': 'flagpack:co',
    'Costa Rica': 'flagpack:cr',
    'Cuba': 'flagpack:cu',
    'Cape Verde': 'flagpack:cv',
    'Curaçao': 'flagpack:cw',
    'Christmas Island': 'flagpack:cx',
    'Cyprus': 'flagpack:cy',
    'Czechia': 'flagpack:cz',
    'Germany': 'flagpack:de',
    'Djibouti': 'flagpack:dj',
    'Denmark': 'flagpack:dk',
    'Dominica': 'flagpack:dm',
    'Dominican Republic': 'flagpack:do',
    'Algeria': 'flagpack:dz',
    'Ecuador': 'flagpack:ec',
    'Estonia': 'flagpack:ee',
    'Egypt': 'flagpack:eg',
    'Western Sahara': 'flagpack:eh',
    'Eritrea': 'flagpack:er',
    'Spain': 'flagpack:es',
    'Ethiopia': 'flagpack:et',
    'Finland': 'flagpack:fi',
    'Fiji': 'flagpack:fj',
    'Falkland Islands': 'flagpack:fk',
    'Micronesia': 'flagpack:fm',
    'Faroe Islands': 'flagpack:fo',
    'France': 'flagpack:fr',
    'Gabon': 'flagpack:ga',
    'United Kingdom': 'flagpack:gb-ukm',
    'Northern Ireland': 'flagpack:gb-nir',
    'Scotland': 'flagpack:gb-sct',
    'Wales': 'flagpack:gb-wls',
    'Grenada': 'flagpack:gd',
    'Georgia': 'flagpack:ge',
    'French Guiana': 'flagpack:gf',
    'Guernsey': 'flagpack:gg',
    'Ghana': 'flagpack:gh',
    'Gibraltar': 'flagpack:gi',
    'Greenland': 'flagpack:gl',
    'Gambia': 'flagpack:gm',
    'Guinea': 'flagpack:gn',
    'Guadeloupe': 'flagpack:gp',
    'Equatorial Guinea': 'flagpack:gq',
    'Greece': 'flagpack:gr',
    'South Georgia and the South Sandwich Islands': 'flagpack:gs',
    'Guatemala': 'flagpack:gt',
    'Guam': 'flagpack:gu',
    'Guinea-Bissau': 'flagpack:gw',
    'Guyana': 'flagpack:gy',
    'Hong Kong': 'flagpack:hk',
    'Heard Island and McDonald Islands': 'flagpack:hm',
    'Honduras': 'flagpack:hn',
    'Croatia': 'flagpack:hr',
    'Haiti': 'flagpack:ht',
    'Hungary': 'flagpack:hu',
    'Indonesia': 'flagpack:id',
    'Ireland': 'flagpack:ie',
    'Israel': 'flagpack:il',
    'Isle of Man': 'flagpack:im',
    'India': 'flagpack:in',
    'British Indian Ocean Territory': 'flagpack:io',
    'Iraq': 'flagpack:iq',
    'Iran': 'flagpack:ir',
    'Iceland': 'flagpack:is',
    'Italy': 'flagpack:it',
    'Jersey': 'flagpack:je',
    'Jamaica': 'flagpack:jm',
    'Jordan': 'flagpack:jo',
    'Japan': 'flagpack:jp',
    'Kenya': 'flagpack:ke',
    'Kyrgyzstan': 'flagpack:kg',
    'Cambodia': 'flagpack:kh',
    'Kiribati': 'flagpack:ki',
    'Comoros': 'flagpack:km',
    'Saint Kitts and Nevis': 'flagpack:kn',
    'North Korea': 'flagpack:kp',
    'South Korea': 'flagpack:kr',
    'Kuwait': 'flagpack:kw',
    'Cayman Islands': 'flagpack:ky',
    'Kazakhstan': 'flagpack:kz',
    'Laos': 'flagpack:la',
    'Lebanon': 'flagpack:lb',
    'Saint Lucia': 'flagpack:lc',
    'Liechtenstein': 'flagpack:li',
    'Sri Lanka': 'flagpack:lk',
    'Liberia': 'flagpack:lr',
    'Lesotho': 'flagpack:ls',
    'Lithuania': 'flagpack:lt',
    'Luxembourg': 'flagpack:lu',
    'Latvia': 'flagpack:lv',
    'Libya': 'flagpack:ly',
    'Morocco': 'flagpack:ma',
    'Monaco': 'flagpack:mc',
    'Moldova': 'flagpack:md',
    'Montenegro': 'flagpack:me',
    'Saint Martin': 'flagpack:mf',
    'Madagascar': 'flagpack:mg',
    'Marshall Islands': 'flagpack:mh',
    'North Macedonia': 'flagpack:mk',
    'Mali': 'flagpack:ml',
    'Myanmar': 'flagpack:mm',
    'Mongolia': 'flagpack:mn',
    'Macau': 'flagpack:mo',
    'Northern Mariana Islands': 'flagpack:mp',
    'Martinique': 'flagpack:mq',
    'Mauritania': 'flagpack:mr',
    'Montserrat': 'flagpack:ms',
    'Malta': 'flagpack:mt',
    'Mauritius': 'flagpack:mu',
    'Maldives': 'flagpack:mv',
    'Malawi': 'flagpack:mw',
    'Mexico': 'flagpack:mx',
    'Malaysia': 'flagpack:my',
    'Mozambique': 'flagpack:mz',
    'Namibia': 'flagpack:na',
    'New Caledonia': 'flagpack:nc',
    'Niger': 'flagpack:ne',
    'Norfolk Island': 'flagpack:nf',
    'Nigeria': 'flagpack:ng',
    'Nicaragua': 'flagpack:ni',
    'Netherlands': 'flagpack:nl',
    'Norway': 'flagpack:no',
    'Nepal': 'flagpack:np',
    'Nauru': 'flagpack:nr',
    'Niue': 'flagpack:nu',
    'New Zealand': 'flagpack:nz',
    'Oman': 'flagpack:om',
    'Panama': 'flagpack:pa',
    'Peru': 'flagpack:pe',
    'French Polynesia': 'flagpack:pf',
    'Papua New Guinea': 'flagpack:pg',
    'Philippines': 'flagpack:ph',
    'Pakistan': 'flagpack:pk',
    'Poland': 'flagpack:pl',
    'Saint Pierre and Miquelon': 'flagpack:pm',
    'Pitcairn Islands': 'flagpack:pn',
    'Puerto Rico': 'flagpack:pr',
    'Palestine': 'flagpack:ps',
    'Portugal': 'flagpack:pt',
    'Palau': 'flagpack:pw',
    'Paraguay': 'flagpack:py',
    'Qatar': 'flagpack:qa',
    'Réunion': 'flagpack:re',
    'Romania': 'flagpack:ro',
    'Serbia': 'flagpack:rs',
    'Russia': 'flagpack:ru',
    'Rwanda': 'flagpack:rw',
    'Saudi Arabia': 'flagpack:sa',
    'Solomon Islands': 'flagpack:sb',
    'Seychelles': 'flagpack:sc',
    'Sudan': 'flagpack:sd',
    'Sweden': 'flagpack:se',
    'Singapore': 'flagpack:sg',
    'Saint Helena': 'flagpack:sh',
    'Slovenia': 'flagpack:si',
    'Svalbard and Jan Mayen': 'flagpack:sj',
    'Slovakia': 'flagpack:sk',
    'Sierra Leone': 'flagpack:sl',
    'San Marino': 'flagpack:sm',
    'Senegal': 'flagpack:sn',
    'Somalia': 'flagpack:so',
    'Suriname': 'flagpack:sr',
    'South Sudan': 'flagpack:ss',
    'São Tomé and Príncipe': 'flagpack:st',
    'El Salvador': 'flagpack:sv',
    'Sint Maarten': 'flagpack:sx',
    'Syria': 'flagpack:sy',
    'Eswatini': 'flagpack:sz',
    'Turks and Caicos Islands': 'flagpack:tc',
    'Chad': 'flagpack:td',
    'French Southern Territories': 'flagpack:tf',
    'Togo': 'flagpack:tg',
    'Thailand': 'flagpack:th',
    'Tajikistan': 'flagpack:tj',
    'Tokelau': 'flagpack:tk',
    'Timor-Leste': 'flagpack:tl',
    'Turkmenistan': 'flagpack:tm',
    'Tunisia': 'flagpack:tn',
    'Tonga': 'flagpack:to',
    'Turkey': 'flagpack:tr',
    'Trinidad and Tobago': 'flagpack:tt',
    'Tuvalu': 'flagpack:tv',
    'Taiwan': 'flagpack:tw',
    'Tanzania': 'flagpack:tz',
    'Ukraine': 'flagpack:ua',
    'Uganda': 'flagpack:ug',
    'United States Minor Outlying Islands': 'flagpack:um',
    'United States': 'flagpack:us',
    'Uruguay': 'flagpack:uy',
    'Uzbekistan': 'flagpack:uz',
    'Vatican City': 'flagpack:va',
    'Saint Vincent and the Grenadines': 'flagpack:vc',
    'Venezuela': 'flagpack:ve',
    'British Virgin Islands': 'flagpack:vg',
    'United States Virgin Islands': 'flagpack:vi',
    'Vietnam': 'flagpack:vn',
    'Vanuatu': 'flagpack:vu',
    'Wallis and Futuna': 'flagpack:wf',
    'Samoa': 'flagpack:ws',
    'Yemen': 'flagpack:ye',
    'Mayotte': 'flagpack:yt',
    'South Africa': 'flagpack:za',
    'Zambia': 'flagpack:zm',
    'Zimbabwe': 'flagpack:zw',
};

const defaultLanguageIcon = "material-symbols:language-sharp";

const languageIconOptions = [
  { label: 'Default', value: defaultLanguageIcon, icon: defaultLanguageIcon },
  ...Object.entries(languageIcons).map(([name, code]) => ({
    label: name,
    value: code,
    icon: code,
  })),
];

const LANGUAGE_CODE_TO_COUNTRY: Record<string, string> = {
  en: "gb-ukm", de: "de", fr: "fr", es: "es", pt: "pt", it: "it", nl: "nl",
  ru: "ru", ja: "jp", zh: "cn", ko: "kr", ar: "sa", hi: "in", tr: "tr",
  pl: "pl", sv: "se", da: "dk", fi: "fi", no: "no", nb: "no", nn: "no",
  el: "gr", he: "il", iw: "il", th: "th", vi: "vn", id: "id", ms: "my",
  uk: "ua", cs: "cz", sk: "sk", hu: "hu", ro: "ro", bg: "bg", hr: "hr",
  sr: "rs", sl: "si", et: "ee", lv: "lv", lt: "lt", is: "is", ga: "ie",
  mt: "mt", sq: "al", mk: "mk", bs: "ba", ca: "es", eu: "es", gl: "es",
  af: "za", zu: "za", xh: "za", sw: "tz", am: "et", bn: "bd", fa: "ir",
  ur: "pk", ta: "lk", te: "in", mr: "in", gu: "in", pa: "in", kn: "in",
  ml: "in", si: "lk", my: "mm", km: "kh", lo: "la", ka: "ge", hy: "am",
  az: "az", kk: "kz", uz: "uz", mn: "mn", ne: "np", tl: "ph", fil: "ph",
  ha: "ng", yo: "ng", ig: "ng", so: "so", rw: "rw", mg: "mg",
  ky: "kg", tg: "tj", tk: "tm", ps: "af", ku: "iq",
  gd: "gb-sct", cy: "gb-wls",
};

const LANGUAGE_NAME_TO_COUNTRY: Record<string, string> = {
  english: "gb-ukm", german: "de", french: "fr", spanish: "es", portuguese: "pt",
  italian: "it", dutch: "nl", russian: "ru", japanese: "jp", chinese: "cn",
  mandarin: "cn", cantonese: "hk", korean: "kr", arabic: "sa", hindi: "in",
  turkish: "tr", polish: "pl", swedish: "se", danish: "dk", finnish: "fi",
  norwegian: "no", greek: "gr", hebrew: "il", thai: "th", vietnamese: "vn",
  indonesian: "id", malay: "my", ukrainian: "ua", czech: "cz", slovak: "sk",
  hungarian: "hu", romanian: "ro", bulgarian: "bg", croatian: "hr",
  serbian: "rs", slovenian: "si", estonian: "ee", latvian: "lv",
  lithuanian: "lt", icelandic: "is", irish: "ie", maltese: "mt",
  albanian: "al", macedonian: "mk", bosnian: "ba", catalan: "es",
  basque: "es", galician: "es", afrikaans: "za", swahili: "tz",
  amharic: "et", bengali: "bd", persian: "ir", farsi: "ir", urdu: "pk",
  tamil: "lk", telugu: "in", marathi: "in", gujarati: "in", punjabi: "in",
  kannada: "in", malayalam: "in", sinhala: "lk", burmese: "mm",
  khmer: "kh", lao: "la", georgian: "ge", armenian: "am",
  azerbaijani: "az", kazakh: "kz", uzbek: "uz", mongolian: "mn",
  nepali: "np", tagalog: "ph", filipino: "ph", welsh: "gb-wls",
  scottish: "gb-sct",
};

const FLAGPACK_CODE_SET = new Set(
  Object.values(languageIcons).map((icon) => icon.replace("flagpack:", "")),
);

const COUNTRY_ENTRIES = Object.entries(languageIcons).map(([name, icon]) => ({
  name,
  normalizedName: normalize(name),
  icon,
}));

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

function findCountryNameInText(text: string): string | undefined {
  const normalizedText = normalize(text);
  const matches = COUNTRY_ENTRIES.filter((c) =>
    new RegExp(`\\b${escapeRegExp(c.normalizedName)}\\b`).test(
      normalizedText,
    ),
  );
  if (matches.length === 0) return undefined;

  matches.sort((a, b) => b.normalizedName.length - a.normalizedName.length);
  return matches[0].icon;
}

function extractParenthetical(text: string): string | undefined {
  return text.match(/\(([^)]+)\)/)?.[1];
}

function extractRegionFromCode(code: string): string | undefined {
  const parts = code.split(/[-_]/).filter(Boolean);
  if (parts.length < 2) return undefined;
  const last = parts[parts.length - 1];
  return /^[A-Za-z]{2}$/.test(last) ? last.toLowerCase() : undefined;
}

function guessLanguageIcon(code: string, display: string): string {
  const cleanCode = (code ?? "").trim();
  const cleanDisplay = (display ?? "").trim();

  const region = extractRegionFromCode(cleanCode);
  if (region && FLAGPACK_CODE_SET.has(region)) {
    return `flagpack:${region}`;
  }

  const parenthetical = extractParenthetical(cleanDisplay);
  if (parenthetical) {
    const icon = findCountryNameInText(parenthetical);
    if (icon) return icon;
  }

  if (cleanDisplay) {
    const icon = findCountryNameInText(cleanDisplay);
    if (icon) return icon;
  }

  const primary = normalize(cleanCode.split(/[-_]/)[0] ?? "");
  if (primary && LANGUAGE_CODE_TO_COUNTRY[primary]) {
    const country = LANGUAGE_CODE_TO_COUNTRY[primary];
    if (FLAGPACK_CODE_SET.has(country)) return `flagpack:${country}`;
  }

  const normalizedDisplay = normalize(cleanDisplay);
  for (const word of normalizedDisplay.split(/\s+/).filter(Boolean)) {
    if (LANGUAGE_NAME_TO_COUNTRY[word]) {
      const country = LANGUAGE_NAME_TO_COUNTRY[word];
      if (FLAGPACK_CODE_SET.has(country)) return `flagpack:${country}`;
    }
  }
  if (LANGUAGE_NAME_TO_COUNTRY[normalizedDisplay]) {
    const country = LANGUAGE_NAME_TO_COUNTRY[normalizedDisplay];
    if (FLAGPACK_CODE_SET.has(country)) return `flagpack:${country}`;
  }

  if (cleanDisplay) {
    let best: { icon: string; score: number } | undefined;
    for (const entry of COUNTRY_ENTRIES) {
      const score = similarity(normalizedDisplay, entry.normalizedName);
      if (!best || score > best.score) best = { icon: entry.icon, score };
    }
    if (best && best.score >= 0.72) return best.icon;
  }

  return defaultLanguageIcon;
}



export { languageIcons, languageIconOptions, defaultLanguageIcon, guessLanguageIcon };