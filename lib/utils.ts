type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | Record<string, unknown>;

/**
 * Tiny classname joiner. Deliberately dependency-free — the project has no
 * conflicting-class problem that would justify pulling in clsx/tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  const walk = (value: ClassValue) => {
    if (!value) return;
    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value));
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (typeof value === 'object') {
      for (const [key, active] of Object.entries(value)) {
        if (active) out.push(key);
      }
    }
  };
  inputs.forEach(walk);
  return out.join(' ');
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
