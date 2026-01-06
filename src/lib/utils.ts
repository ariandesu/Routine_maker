import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import pako from 'pako';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function compressData(data: object): string {
  try {
    const json = JSON.stringify(data);
    const compressed = pako.deflate(json, { to: 'string' });
    // btoa is safe here because pako's string output is compatible
    const base64 = btoa(compressed);
    return base64
      .replace(/\+/g, '-') // URL-safe
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error("Compression failed:", e);
    return "";
  }
}

export function decompressData(str: string): any {
  if (!str) return {};

  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    // atob is safe here as we're reversing the btoa process
    const compressed = atob(base64);
    const restored = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(restored);
  } catch (e) {
    console.error("Decompression failed:", e);
    // Return empty object on error to prevent app crash
    return {};
  }
}
