import {
  siAmericanexpress,
  siMastercard,
  siMercadopago,
  siNubank,
  siPagseguro,
  siPicpay,
  siVisa,
} from 'simple-icons';

export interface BrandInfo {
  /** hex color sem o # */
  color: string;
  /** SVG path do ícone (simple-icons), se disponível */
  svgPath?: string;
  /** Cor do ícone SVG: 'white' ou 'black' para contraste */
  iconColor?: 'white' | 'black';
}

// ─── Mapeamento de bancos/marcas conhecidos ──────────────────────────────────
// match: substrings (lowercase) que identificam o banco no nome do cartão
const BRAND_MAP: Array<{ match: string[]; info: BrandInfo }> = [
  // ── com ícone SVG ───────────────────────────────────────────────────────────
  {
    match: ['nubank', 'nu '],
    info: { color: siNubank.hex, svgPath: siNubank.path, iconColor: 'white' },
  },
  {
    match: ['mastercard', 'master card'],
    info: {
      color: siMastercard.hex,
      svgPath: siMastercard.path,
      iconColor: 'white',
    },
  },
  {
    match: ['visa'],
    info: { color: siVisa.hex, svgPath: siVisa.path, iconColor: 'white' },
  },
  {
    match: ['amex', 'american express'],
    info: {
      color: siAmericanexpress.hex,
      svgPath: siAmericanexpress.path,
      iconColor: 'white',
    },
  },
  {
    match: ['mercado pago', 'mercadopago'],
    info: {
      color: siMercadopago.hex,
      svgPath: siMercadopago.path,
      iconColor: 'white',
    },
  },
  {
    match: ['picpay'],
    info: { color: siPicpay.hex, svgPath: siPicpay.path, iconColor: 'white' },
  },
  {
    match: ['pagseguro', 'pag seguro'],
    info: {
      color: siPagseguro.hex,
      svgPath: siPagseguro.path,
      iconColor: 'black',
    },
  },
  // ── apenas cor ─────────────────────────────────────────────────────────────
  { match: ['inter'], info: { color: 'FF7A00', iconColor: 'white' } },
  { match: ['itau', 'itaú'], info: { color: 'EC7000', iconColor: 'white' } },
  {
    match: ['bradesco'],
    info: { color: 'CC092F', iconColor: 'white' },
  },
  {
    match: ['santander'],
    info: { color: 'EC0000', iconColor: 'white' },
  },
  { match: ['c6'], info: { color: '242424', iconColor: 'white' } },
  { match: ['btg'], info: { color: '004C97', iconColor: 'white' } },
  { match: ['xp '], info: { color: '111111', iconColor: 'white' } },
  {
    match: ['caixa'],
    info: { color: '005EA2', iconColor: 'white' },
  },
  {
    match: ['banco do brasil', 'bb '],
    info: { color: 'FECE00', iconColor: 'black' },
  },
  {
    match: ['neon'],
    info: { color: '462580', iconColor: 'white' },
  },
  {
    match: ['next'],
    info: { color: '00D1B2', iconColor: 'white' },
  },
  {
    match: ['pagbank', 'pag bank'],
    info: { color: 'FFC400', iconColor: 'black' },
  },
  {
    match: ['iti'],
    info: { color: 'FF6900', iconColor: 'white' },
  },
  {
    match: ['avenue'],
    info: { color: '0A2342', iconColor: 'white' },
  },
  {
    match: ['original'],
    info: { color: '00A859', iconColor: 'white' },
  },
  {
    match: ['will bank', 'willbank'],
    info: { color: 'FFCD00', iconColor: 'black' },
  },
  {
    match: ['diners', 'discover'],
    info: { color: 'FF6600', iconColor: 'white' },
  },
  {
    match: ['elo'],
    info: { color: 'FFCB05', iconColor: 'black' },
  },
  {
    match: ['hipercard', 'hiper'],
    info: { color: 'B52532', iconColor: 'white' },
  },
];

// ─── Cor por hash do nome (fallback) ─────────────────────────────────────────
function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // 32-bit int
  }
  // HSL com saturação e luminosidade fixas para cores vibrantes mas legíveis
  const hue = Math.abs(hash) % 360;
  return hslToHex(hue, 65, 45);
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

// ─── Função principal ─────────────────────────────────────────────────────────
export function getBrandInfo(cardName: string): BrandInfo {
  const lower = cardName.toLowerCase();

  for (const entry of BRAND_MAP) {
    if (entry.match.some((m) => lower.includes(m))) {
      return entry.info;
    }
  }

  const color = hashColor(cardName);
  return { color, iconColor: 'white' };
}
