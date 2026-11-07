// Utilities for generating DiceBear avatar URLs via the public API.
// ----------------------------------------------------------------

export const AvatarStyles = [
  "bottts-neutral",
  "thumbs",
  "pixel-art",
  "glass",
  "fun-emoji",
  "identicon",
] as const;

export type AvatarStyle = (typeof AvatarStyles)[number];

const ADJECTIVES = [
  "Neon",
  "Cyber",
  "Pixel",
  "Super",
  "Hyper",
  "Cosmic",
  "Lucky",
  "Shadow",
  "Golden",
  "Swift",
  "Turbo",
  "Brave",
];

const NOUNS = [
  "Fox",
  "Dragon",
  "Tiger",
  "Panda",
  "Eagle",
  "Falcon",
  "Otter",
  "Wolf",
  "Knight",
  "Ninja",
  "Gamer",
  "Viper",
];

export function generateRandomName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${adj}${noun}${num}`;
}

export function generateRandomSeed(): string {
  return `seed_${Math.random().toString(36).substring(2, 10)}`;
}

export function getAvatarUrl(
  style: AvatarStyle = "bottts-neutral",
  seed: string,
  options: Record<string, string | number> = {},
  format: "svg" | "png" = "svg"
): string {
  const base = `https://api.dicebear.com/9.x/${style}/${format}`;
  const params = new URLSearchParams({ seed });

  Object.entries(options).forEach(([key, value]) => {
    params.append(key, String(value));
  });

  return `${base}?${params.toString()}`;
}
