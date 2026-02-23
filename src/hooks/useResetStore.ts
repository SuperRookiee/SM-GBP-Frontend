import { useEffect, useEffectEvent, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useResetStore = (pathScope: string, reset: () => void) => {
    const { pathname } = useLocation();

    // 비교 기준이 흔들리지 않도록 scope 경로를 정규화한다.
    const normalizedScope = useMemo(() => normalizePath(pathScope), [pathScope]);

    const onReset = useEffectEvent(() => {
        reset();
    });

    const wasInScopeRef = useRef<boolean>(false);

    useEffect(() => {
        // 현재 경로가 scope 내부인지 계산한다.
        const inScope = isInScopeNormalized(pathname, normalizedScope);

        // scope 밖으로 빠져나간 순간에만 reset을 실행한다.
        if (wasInScopeRef.current && !inScope) {
            onReset();
        }

        // 다음 경로 변경 비교를 위해 이전 상태를 저장한다.
        wasInScopeRef.current = inScope;
    }, [pathname, normalizedScope, onReset]);
};

const isInScopeNormalized = (pathname: string, normalizedScope: string) => {
    if (!normalizedScope) return false;
    if (pathname === normalizedScope) return true;
    return pathname.startsWith(`${normalizedScope}/`);
};

const normalizePath = (path: string) => {
    const trimmed = path.trim(); // 빈 문자열/공백 입력 방어
    if (!trimmed) return "";

    if (trimmed === "/") return "/";

    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};
