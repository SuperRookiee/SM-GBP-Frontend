import type { User } from "@/types/User.ts";
import users from "@/tests/fixtures/users.json";

const SESSION_PREFIX = "demo-session";
const DEMO_PASSWORD = "password";

const fixtureUsers = users as User[];

const createRandomId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const buildSessionId = (userId: string) => `${SESSION_PREFIX}:${userId}:${createRandomId()}`;

const parseSessionUser = (sessionId: string) => {
    if (!sessionId.startsWith(`${SESSION_PREFIX}:`)) return null;
    const [, userId] = sessionId.split(":");
    return fixtureUsers.find((user) => user.id === userId) ?? null;
};

export const demoLogin = async (username: string, password: string) => {
    const user = fixtureUsers.find((candidate) => candidate.id === username || candidate.name === username);

    if (!user || password !== DEMO_PASSWORD) {
        throw new Error("Invalid credentials");
    }

    return { user };
};

export const demoLogout = async () => {
    return;
};

export const demoMe = async (sessionId: string) => {
    const user = parseSessionUser(sessionId);

    if (!user) {
        throw new Error("Session not found");
    }

    return { user };
};

export const demoRefresh = async (sessionId: string) => {
    const user = parseSessionUser(sessionId);

    if (!user) {
        throw new Error("Session expired");
    }

    return { sessionId: buildSessionId(user.id), user };
};
