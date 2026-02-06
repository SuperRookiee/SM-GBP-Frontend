import { useEffect, useEffectEvent, useState } from "react";

const MOBILE_BREAKPOINT = 1024;

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    const update = useEffectEvent(() => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    });

    useEffect(() => {
        const mql = matchMedia(`(max-width:${MOBILE_BREAKPOINT - 1}px)`);
        mql.addEventListener("change", update);
        update();
        return () => mql.removeEventListener("change", update);
    }, [update]);

    return isMobile;
};