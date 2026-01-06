import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple LZ-based compression
export function compressData(data: object): string {
  const json = JSON.stringify(data);
  let dict: { [key: string]: number } = {};
  let text = json.split("");
  let result: number[] = [];
  let phrase = text[0];
  let code = 256;
  for (let i = 1; i < text.length; i++) {
    let cur = text[i];
    if (dict[phrase + cur] != null) {
      phrase += cur;
    } else {
      result.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      dict[phrase + cur] = code;
      code++;
      phrase = cur;
    }
  }
  result.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  return encodeURIComponent(btoa(String.fromCharCode.apply(null, result)));
}

// Decompression for the LZ-based algorithm
export function decompressData(encoded: string): any {
    const str = atob(decodeURIComponent(encoded));
    const data = str.split("").map(c => c.charCodeAt(0));
    let dict: { [key: number]: string } = {};
    let currChar = String.fromCharCode(data[0]);
    let oldPhrase = currChar;
    let result = [currChar];
    let code = 256;
    let phrase;
    for (let i = 1; i < data.length; i++) {
        let currCode = data[i];
        if (currCode < 256) {
            phrase = String.fromCharCode(data[i]);
        } else {
            phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        result.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    const json = result.join("");
    return JSON.parse(json);
}
