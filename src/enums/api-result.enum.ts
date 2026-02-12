export const ApiResultEnum = {
    SUCCESS: "SUCCESS",
    FAIL: "FAIL",
} as const;

export type ApiResult = (typeof ApiResultEnum)[keyof typeof ApiResultEnum];

export const SuccessResultCodeEnum = {
    OK: "S200",
} as const;

export type SuccessResultCode = (typeof SuccessResultCodeEnum)[keyof typeof SuccessResultCodeEnum];

export const ErrorResultCodeEnum = {
    BAD_REQUEST: "E400",
    INVALID_PARAMETER: "E400",
    UNAUTHORIZED: "E401",
    FORBIDDEN: "E403",
    NOT_FOUND: "E404",
    METHOD_NOT_ALLOWED: "E405",
    CONFLICT: "E409",
    INTERNAL_ERROR: "E500",
    SERVICE_UNAVAILABLE: "E503",
} as const;

export type ErrorResultCode = (typeof ErrorResultCodeEnum)[keyof typeof ErrorResultCodeEnum];

export const ErrorTypeEnum = {
    BAD_REQUEST: "/errors/bad-request",
    VALIDATION: "/errors/validation",
    UNAUTHORIZED: "/errors/unauthorized",
    FORBIDDEN: "/errors/forbidden",
    NOT_FOUND: "/errors/not-found",
    METHOD_NOT_ALLOWED: "/errors/method-not-allowed",
    CONFLICT: "/errors/conflict",
    BIZ: "/errors/biz",
    INTERNAL: "/errors/internal",
    SERVICE_UNAVAILABLE: "/errors/service-unavailable",
} as const;

export type ErrorType = (typeof ErrorTypeEnum)[keyof typeof ErrorTypeEnum];
