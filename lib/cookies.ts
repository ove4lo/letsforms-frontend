export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length !== 2) return undefined;

  let encoded = parts.pop()?.split(";").shift();
  if (!encoded) return undefined;

  // Пытаемся декодировать столько раз, сколько нужно
  let decoded = encoded;
  while (decoded.includes("%")) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break; // больше не декодируется
      decoded = next;
    } catch {
      break;
    }
  }

  return decoded;
}