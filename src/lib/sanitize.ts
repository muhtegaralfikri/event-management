/**
 * Utilitas sanitasi input untuk keamanan.
 *
 * - sanitizeText:     Strip HTML tags dari string.
 * - sanitizeCsvField: Escape karakter formula injection untuk CSV.
 * - sanitizeUrl:      Validasi URL hanya menerima https:// protocol.
 * - isHoneypotFilled: Deteksi bot melalui hidden honeypot field.
 */

// ── HTML / XSS Sanitizer ─────────────────────────────────────────────

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/gi;
const HTML_ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};
const ESCAPABLE_CHARS_REGEX = /[&<>"']/g;

/**
 * Hapus semua HTML tags dari string input lalu escape karakter berbahaya.
 * Ini mencegah Stored XSS melalui field teks biasa.
 */
export const sanitizeText = (input: string): string => {
  const stripped = input.replace(HTML_TAG_REGEX, "");
  return stripped.replace(
    ESCAPABLE_CHARS_REGEX,
    (char) => HTML_ENTITY_MAP[char] ?? char,
  );
};

/**
 * Sanitasi ringan — hanya strip HTML tags tanpa escaping entity.
 * Cocok untuk field yang akan ditampilkan melalui React JSX
 * (yang sudah otomatis escape entity).
 */
export const stripHtmlTags = (input: string): string =>
  input.replace(HTML_TAG_REGEX, "").trim();

// ── CSV Injection Sanitizer ──────────────────────────────────────────

const CSV_INJECTION_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Escape field CSV yang dimulai dengan karakter formula injection.
 * Menambahkan single quote di awal string agar Excel/Sheets
 * tidak mengeksekusi formula berbahaya.
 */
export const sanitizeCsvField = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return trimmed;
  }

  const firstChar = trimmed[0];

  if (firstChar && CSV_INJECTION_PREFIXES.includes(firstChar)) {
    return `'${trimmed}`;
  }

  return trimmed;
};

// ── URL Sanitizer ────────────────────────────────────────────────────

const ALLOWED_URL_PROTOCOLS = ["https:"];
const BLOCKED_URL_PATTERNS = [
  /^javascript:/i,
  /^data:/i,
  /^file:/i,
  /^vbscript:/i,
  /^blob:/i,
];

/**
 * Validasi URL — hanya menerima protocol `https://`.
 * Menolak `javascript:`, `data:`, `file:`, dsb.
 *
 * @returns URL yang sudah divalidasi, atau `null` jika tidak valid.
 */
export const sanitizeUrl = (input: string): string | null => {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  // Cek pattern berbahaya sebelum parsing URL
  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (pattern.test(trimmed)) {
      return null;
    }
  }

  try {
    const url = new URL(trimmed);

    if (!ALLOWED_URL_PROTOCOLS.includes(url.protocol)) {
      return null;
    }

    // Tolak URL tanpa hostname yang valid
    if (!url.hostname || url.hostname.length < 3) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
};

// ── Honeypot Detector ────────────────────────────────────────────────

/**
 * Cek apakah honeypot field terisi.
 * Field honeypot sengaja disembunyikan di UI — hanya bot otomatis
 * yang akan mengisinya. Jika terisi → request ini dari bot.
 */
export const isHoneypotFilled = (formData: FormData): boolean => {
  const honeypotValue = formData.get("website");

  return typeof honeypotValue === "string" && honeypotValue.trim().length > 0;
};
