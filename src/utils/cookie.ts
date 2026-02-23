export const getCookie = (name: string) => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : "";
};

export const setCookie = (name: string, value: string, maxAge: number) => {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

export const removeCookie = (name: string) => {
    document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};
