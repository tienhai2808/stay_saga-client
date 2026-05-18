import { AUTH_STORAGE_KEY } from "@/lib/constants";

export function clearAuthArtifacts() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);

  for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
    const key = window.localStorage.key(i);
    if (!key) {
      continue;
    }

    if (key.startsWith("stay_saga") || key.includes("auth")) {
      window.localStorage.removeItem(key);
    }
  }

  const cookies = document.cookie.split(";");
  cookies.forEach((cookie) => {
    const [rawName] = cookie.split("=");
    const name = rawName?.trim();

    if (!name || !name.startsWith("stay_saga")) {
      return;
    }

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });
}
