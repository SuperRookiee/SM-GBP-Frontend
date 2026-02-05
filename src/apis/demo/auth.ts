import type { User } from "@/types/User.ts";
import users from "@/tests/fixtures/users.json";

const SESSION_PREFIX = "demo-session";
const DEMO_PASSWORD = "password";

const fixtureUsers = users as User[];

// 랜덤 세션 식별자 생성 (crypto 지원 시 UUID 사용)
const createRandomId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// 유저 정보를 포함하는 데모 세션 ID 생성
export const buildSessionId = (userId: string) => `${SESSION_PREFIX}:${userId}:${createRandomId()}`;

// 세션 ID에서 유저를 역추적 (유효하지 않으면 null)
const parseSessionUser = (sessionId: string) => {
    if (!sessionId.startsWith(`${SESSION_PREFIX}:`)) return null;
    const [, userId] = sessionId.split(":");
    return fixtureUsers.find((user) => user.id === userId) ?? null;
};

// 데모 로그인: username(id 또는 name) + 고정 비밀번호 매칭
export const demoLogin = async (username: string, password: string) => {
    const user = fixtureUsers.find((candidate) => candidate.id === username || candidate.name === username);

    if (!user || password !== DEMO_PASSWORD) {
        throw new Error("Invalid credentials");
    }

    return { user };
};

// 데모 로그아웃: 서버 동작 흉내만 낸다.
export const demoLogout = async () => {
    return;
};

// 세션 유효성 확인 후 사용자 반환 (없으면 throw)
export const demoMe = async (sessionId: string) => {
    const user = parseSessionUser(sessionId);

    if (!user) {
        throw new Error("Session not found");
    }

    return { user };
};

// 세션 갱신: 새로운 세션 ID 발급
export const demoRefresh = async (sessionId: string) => {
    const user = parseSessionUser(sessionId);

    if (!user) {
        throw new Error("Session expired");
    }

    return { sessionId: buildSessionId(user.id), user };
};
