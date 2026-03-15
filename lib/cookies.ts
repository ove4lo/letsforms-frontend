export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  
  if (!match || !match[2]) {
    console.warn(`Cookie "${name}" not found via RegExp. Full cookie string length:`, document.cookie.length);
    if (document.cookie.includes(name)) {
      console.warn(`Cookie name "${name}" found in string, but regex failed. String snippet:`, document.cookie.substring(0, 200));
    }
    return undefined;
  }

  const encodedValue = match[2];
  
  try {
    const decoded = decodeURIComponent(encodedValue);
    return decoded;
  } catch (e) {
    return encodedValue;
  }
}

// Функция для очистки всех кук
export function clearAuthCookies() {
  if (typeof document === "undefined") return;
  const cookies = ['tg_user', 'access_token', 'refresh_token'];
  cookies.forEach(name => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  });
}