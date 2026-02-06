export const canonicalizeQuery = (input: string) => {
    const raw = input.trim();

    // query만 들어오든, full URL이 들어오든 처리
    const q = raw.startsWith("?")
        ? raw.slice(1)
        : raw.includes("?")
            ? raw.split("?")[1] ?? ""
            : raw;

    if (!q) return "";

    const params = new URLSearchParams(q);

    // (key, value) 모두 모아서 정렬 -> 파람 순서만 다른 건 동일 처리
    const entries = Array.from(params.entries())
        .map(([k, v]) => [k.trim(), v.trim()] as const)
        .filter(([k]) => k.length > 0)
        .sort(([ak, av], [bk, bv]) => (ak === bk ? av.localeCompare(bv) : ak.localeCompare(bk)));

    return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}