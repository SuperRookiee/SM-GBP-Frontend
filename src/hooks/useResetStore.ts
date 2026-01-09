import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useResetStore = (pathScope: string, reset: () => void) => {
    const { pathname } = useLocation();

    const normalizedScope = useMemo(() => normalizePath(pathScope), [pathScope]);

    const onReset = useEffectEvent(() => {
        reset();
    });

    const wasInScopeRef = useRef<boolean>(false);

    useEffect(() => {
        const inScope = isInScopeNormalized(pathname, normalizedScope);

        if (wasInScopeRef.current && !inScope) {
            onReset();
        }

        wasInScopeRef.current = inScope;
    }, [pathname, normalizedScope, onReset]);
};

const isInScopeNormalized = (pathname: string, normalizedScope: string) => {
    if (!normalizedScope) return false;
    if (pathname === normalizedScope) return true;
    return pathname.startsWith(`${normalizedScope}/`);
};

const normalizePath = (path: string) => {
    const trimmed = path.trim(); // 빈 문자열/공백 방어
    if (!trimmed) return "";

    if (trimmed === "/") return "/";

    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};