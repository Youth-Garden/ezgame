export interface CookieOptions {
  path?: string;
  maxAge?: number;
  domain?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Universal Cookie Helper for reading, writing, and deleting client-side cookies.
 */
export const cookieUtils = {
  /**
   * Get cookie value by name
   */
  get(name: string): string | null {
    if (typeof document === "undefined") return null;

    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(";");

    for (const cookieItem of cookies) {
      const trimmed = cookieItem.trim();
      if (trimmed.startsWith(`${encodedName}=`)) {
        return decodeURIComponent(trimmed.substring(encodedName.length + 1));
      }
    }
    return null;
  },

  /**
   * Set cookie with options
   */
  set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === "undefined") return;

    const {
      path = "/",
      maxAge = 31536000, // 1 year default
      domain,
      secure = false,
      sameSite = "Lax",
    } = options;

    let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`;

    if (domain) {
      cookieStr += `; domain=${domain}`;
    }
    if (secure) {
      cookieStr += "; Secure";
    }

    document.cookie = cookieStr;
  },

  /**
   * Delete cookie by setting expired max-age
   */
  delete(name: string, path: string = "/"): void {
    if (typeof document === "undefined") return;
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; SameSite=Lax`;
  },
};
