export const RoleEnum = {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest',
} as const;

export type Role = typeof RoleEnum[keyof typeof RoleEnum];
