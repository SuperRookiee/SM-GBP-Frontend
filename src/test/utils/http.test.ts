import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { Delete, Get, Patch, Post, Put } from "@/utils/http.ts";
import { server } from "@/test/mswServer.ts";

describe("http utils", () => {
    it("attaches tokens and returns data", async () => {
        localStorage.setItem("accessToken", "access-token");
        localStorage.setItem("refreshToken", "refresh-token");

        server.use(
            http.get("/api/example", ({ request }) => {
                expect(request.headers.get("authorization")).toBe("Bearer access-token");
                expect(request.headers.get("x-refresh-token")).toBe("refresh-token");
                return HttpResponse.json({ ok: true });
            })
        );

        await expect(Get<{ ok: boolean }>("/example")).resolves.toEqual({ ok: true });
    });

    it("supports common http methods", async () => {
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
            http.delete("/api/example", () => HttpResponse.json({ method: "delete" }))
        );

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
        localStorage.setItem("accessToken", "expired-token");
        localStorage.setItem("refreshToken", "refresh-token");

        let secureCallCount = 0;

        server.use(
            http.get("/api/secure", ({ request }) => {
                secureCallCount += 1;
                if (secureCallCount === 1) {
                    return new HttpResponse(null, { status: 401 });
                }

                expect(request.headers.get("authorization")).toBe("Bearer new-access");
                return HttpResponse.json({ ok: true });
            }),
            http.post("/api/auth/refresh", ({ request }) => {
                expect(request.headers.get("x-refresh-token")).toBe("refresh-token");
                return HttpResponse.json({ accessToken: "new-access", refreshToken: "new-refresh" });
            })
        );

        await expect(Get("/secure")).resolves.toEqual({ ok: true });
        expect(localStorage.getItem("accessToken")).toBe("new-access");
        expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
    });

    it("clears tokens when refresh fails", async () => {
        localStorage.setItem("accessToken", "expired-token");

        server.use(http.get("/api/secure", () => new HttpResponse(null, { status: 401 })));

        await expect(Get("/secure")).rejects.toThrow("No refresh token");
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });
});
