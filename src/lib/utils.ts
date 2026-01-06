import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// More effective LZ-based compression
export function compressData(data: object): string {
  const json = JSON.stringify(data);
  if (!json) return "";

  const dict = new Map<string, number>();
  const out: number[] = [];
  let p = "";
  let dictSize = 256;

  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    const pc = p + c;
    if (dict.has(pc)) {
      p = pc;
    } else {
      out.push(p.length > 1 ? dict.get(p)! : p.charCodeAt(0));
      dict.set(pc, dictSize++);
      p = c;
    }
  }
  if (p !== "") {
    out.push(p.length > 1 ? dict.get(p)! : p.charCodeAt(0));
  }
  
  // Convert to a binary string
  const binaryString = out.map(c => String.fromCharCode(c)).join('');
  
  // Base64 encode and make it URL-safe
  return btoa(binaryString)
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove trailing '='
}


// Decompression for the improved LZ-based algorithm
export function decompressData(str: string): any {
  if (!str) return {};

  // URL-safe Base64 decode
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const data = atob(base64).split('').map(c => c.charCodeAt(0));
  if (data.length === 0) return {};

  const dict: string[] = [];
  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }

  let w = String.fromCharCode(data[0]);
  let result = w;
  let entry = "";
  let dictSize = 256;

  for (let i = 1; i < data.length; i++) {
    const k = data[i];
    if (dict[k]) {
      entry = dict[k];
    } else {
      if (k === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return {}; // Invalid compressed data
      }
    }

    result += entry;
    dict[dictSize++] = w + entry.charAt(0);
    w = entry;
  }
  
  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("Decompression failed:", e);
    return {};
  }
}
