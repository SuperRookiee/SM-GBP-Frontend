import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const normalizePath = (path: string) =>
  path.endsWith("/") ? path.slice(0, -1) : path;

const isInScope = (pathname: string, scope: string) => {
  const normalizedScope = normalizePath(scope);
  if (!normalizedScope) {
    return false;
  }

  if (pathname === normalizedScope) {
    return true;
  }

  return pathname.startsWith(`${normalizedScope}/`);
};

export const useResetStoreOnRouteLeave = (
  pathScope: string,
  reset: () => void,
) => {
  const location = useLocation();
  const wasInScopeRef = useRef(isInScope(location.pathname, pathScope));

  useEffect(() => {
    const inScope = isInScope(location.pathname, pathScope);
    if (wasInScopeRef.current && !inScope) {
      reset();
    }
    wasInScopeRef.current = inScope;
  }, [location.pathname, pathScope, reset]);
};
