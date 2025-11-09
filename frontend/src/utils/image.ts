// src/utils/image.ts
export const API_BASE = import.meta.env.VITE_API_BASE; // "http://localhost:7057"

export function buildAvatarCandidates(name?: string | null) {
    if (!name) return [];
    if (name.startsWith('http')) return [name];

    const file = name.replace(/^\/+/, '');      // прибираємо початкові слеші
    const withSize = file.startsWith('100_') ? file : `100_${file}`;
    return [
        `${API_BASE}/Images/${withSize}`,
        `${API_BASE}/Images/${file}`,
    ];
}
