import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { Delete, Get, Patch, Post, Put } from "@/utils/http.ts";
import { server } from "@/tests/mswServer.ts";

/**
 * http 유틸 함수 전반에 대한 테스트
 * - 토큰 자동 첨부
 * - HTTP 메서드 지원 여부
 * - 401 발생 시 토큰 갱신 및 재시도
 * - refresh 실패 시 토큰 정리
 */
describe("http utils", () => {
    it("attaches tokens and returns data", async () => {
        // 사전에 access / refresh 토큰이 저장되어 있는 상황을 가정
        localStorage.setItem("accessToken", "access-token");
        localStorage.setItem("refreshToken", "refresh-token");

        // /api/example 요청을 가로채 토큰이 헤더에 제대로 붙는지 검증
        server.use(
            http.get("/api/example", ({ request }) => {
                expect(request.headers.get("authorization")).toBe("Bearer access-token");
                expect(request.headers.get("x-refresh-token")).toBe("refresh-token");

                // 정상 응답 반환
                return HttpResponse.json({ ok: true });
            })
        );

        // Get 유틸이 실제 응답 데이터만 resolve 하는지 확인
        await expect(Get<{ ok: boolean }>("/example")).resolves.toEqual({ ok: true });
    });

    it("supports common http methods", async () => {
        // 각 HTTP 메서드별로 요청을 가로채 응답을 다르게 구성
        server.use(
            http.post("/api/example", async ({ request }) => {
                const body = await request.json();
                return HttpResponse.json({ method: "post", body });
            }),
            http.put("/api/example", async ({ request }) => {
                const body = await request.json();
                return HttpResponse.json({ method: "put", body });
            }),
            http.patch("/api/example", async ({ request }) => {
                const body = await request.json();
                return HttpResponse.json({ method: "patch", body });
            }),
            http.delete("/api/example", () =>
                HttpResponse.json({ method: "delete" })
            )
        );

        // 각 유틸 함수가 올바른 메서드와 payload로 동작하는지 검증
        await expect(Post("/example", { name: "post" })).resolves.toEqual({
            method: "post",
            body: { name: "post" },
        });

        await expect(Put("/example", { name: "put" })).resolves.toEqual({
            method: "put",
            body: { name: "put" },
        });

        await expect(Patch("/example", { name: "patch" })).resolves.toEqual({
            method: "patch",
            body: { name: "patch" },
        });

        await expect(Delete("/example")).resolves.toEqual({ method: "delete" });
    });

    it("refreshes token on 401 and retries request", async () => {
        // 만료된 accessToken + 유효한 refreshToken 상태
        localStorage.setItem("accessToken", "expired-token");
        localStorage.setItem("refreshToken", "refresh-token");

        let secureCallCount = 0;

        server.use(
            // 보호된 API: 첫 호출은 401, 두 번째는 성공
            http.get("/api/secure", ({ request }) => {
                secureCallCount += 1;

                if (secureCallCount === 1) {
                    return new HttpResponse(null, { status: 401 });
                }

                // 재시도 시 새 accessToken이 헤더에 반영되었는지 검증
                expect(request.headers.get("authorization")).toBe("Bearer new-access");
                return HttpResponse.json({ ok: true });
            }),

            // 토큰 갱신 API
            http.post("/api/auth/refresh", ({ request }) => {
                expect(request.headers.get("x-refresh-token")).toBe("refresh-token");

                // 새 토큰 세트 반환
                return HttpResponse.json({
                    accessToken: "new-access",
                    refreshToken: "new-refresh",
                });
            })
        );

        // 최초 401 → refresh → 재시도 → 성공 플로우 검증
        await expect(Get("/secure")).resolves.toEqual({ ok: true });

        // localStorage가 새 토큰으로 갱신되었는지 확인
        expect(localStorage.getItem("accessToken")).toBe("new-access");
        expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
    });

    it("clears tokens when refresh fails", async () => {
        // accessToken만 있고 refreshToken은 없는 상태
        localStorage.setItem("accessToken", "expired-token");

        // 보호된 API는 무조건 401
        server.use(
            http.get("/api/secure", () => new HttpResponse(null, { status: 401 }))
        );

        // refreshToken이 없으므로 에러 발생해야 함
        await expect(Get("/secure")).rejects.toThrow("No refresh token");

        // 실패 시 토큰이 모두 정리되는지 확인
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });
});