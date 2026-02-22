export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length !== 2) return undefined;

  const encoded = parts.pop()?.split(";").shift();
  if (!encoded) return undefined;

  // Только одна попытка декодирования
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}