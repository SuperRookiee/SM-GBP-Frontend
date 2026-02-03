import { devtools } from "zustand/middleware";

type DevtoolsOptions = Parameters<typeof devtools>[1];

export const devtool: typeof devtools = (initializer, options) => {
    const merged = {
        ...(options ?? {}),
        enabled: import.meta.env.DEV,
    } satisfies DevtoolsOptions;

    return devtools(initializer, merged);
};