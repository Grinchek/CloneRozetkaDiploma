/**
 * Transliteration map: Ukrainian (and common Cyrillic) -> Latin.
 * Used to generate urlSlug from Name when user clicks "From name".
 * Backend expects: ^[a-z0-9]+(?:[-_][a-z0-9]+)*$
 */
const UA_LATIN: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ie", ж: "zh", з: "z",
    и: "y", і: "i", ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
    р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ь: "", ю: "iu", я: "ia",
    ы: "y", э: "e", ё: "e", ъ: "",
};

function transliterateChar(char: string): string {
    const lower = char.toLowerCase();
    if (UA_LATIN[lower] !== undefined) return UA_LATIN[lower];
    if (/[a-z0-9]/.test(lower)) return lower;
    if (/\s/.test(char) || char === "_") return "-";
    if (char === "-") return "-";
    return "";
}

/**
 * Generates urlSlug from name.
 * - trim, lower-case
 * - spaces/underscores -> "-"
 * - Ukrainian/Cyrillic -> Latin (transliteration)
 * - strip everything except [a-z0-9-]
 * - collapse multiple "-" into one, trim "-" from edges
 * Backend pattern: ^[a-z0-9]+(?:[-_][a-z0-9]+)*$
 * We output only [a-z0-9-] and allow leading/trailing dash; backend also allows _.
 */
export function slugify(name: string): string {
    const s = String(name).trim().toLowerCase();
    if (!s) return "";

    let out = "";
    for (let i = 0; i < s.length; i++) {
        const code = s.codePointAt(i)!;
        const char = s[i];
        if (code >= 0x0400 && code <= 0x04ff) {
            out += transliterateChar(char);
        } else {
            out += transliterateChar(char);
        }
    }

    out = out
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return out;
}

/** Backend pattern: ^[a-z0-9]+(?:[-_][a-z0-9]+)*$ */
export const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

export function isSlugValid(slug: string): boolean {
    return slug.length > 0 && slug.length <= 255 && SLUG_PATTERN.test(slug);
}
