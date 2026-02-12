/**
 * API 처리 결과
 * - SUCCESS: 정상 처리
 * - FAIL: 실패 처리
 */
export const ApiResultEnum = {
    SUCCESS: "SUCCESS",
    FAIL: "FAIL",
} as const;

export type ApiResult = (typeof ApiResultEnum)[keyof typeof ApiResultEnum];

/**
 * 성공 결과 코드
 * - S200(OK): 정상 처리되었습니다
 */
export const SuccessResultCodeEnum = {
    OK: "S200",
} as const;

export type SuccessResultCode = (typeof SuccessResultCodeEnum)[keyof typeof SuccessResultCodeEnum];

/**
 * 오류 결과 코드 (ResultCode)
 *
 * 4xx 클라이언트 오류
 * - E400 BAD_REQUEST: 잘못된 요청입니다
 * - E400 INVALID_PARAMETER: 입력값이 올바르지 않습니다
 * - E401 UNAUTHORIZED: 인증이 필요합니다
 * - E403 FORBIDDEN: 접근 권한이 없습니다
 * - E404 NOT_FOUND: 요청한 리소스를 찾을 수 없습니다
 * - E405 METHOD_NOT_ALLOWED: 허용되지 않은 HTTP 메서드입니다
 * - E409 CONFLICT: 이미 존재하는 리소스입니다
 *
 * 5xx 서버 오류
 * - E500 INTERNAL_ERROR: 서버 내부 오류가 발생했습니다
 * - E503 SERVICE_UNAVAILABLE: 서비스를 사용할 수 없습니다
 */
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

/**
 * 에러 유형 URI (Problem Details의 type)
 * - BAD_REQUEST: /errors/bad-request
 * - VALIDATION: /errors/validation
 * - UNAUTHORIZED: /errors/unauthorized
 * - FORBIDDEN: /errors/forbidden
 * - NOT_FOUND: /errors/not-found
 * - METHOD_NOT_ALLOWED: /errors/method-not-allowed
 * - CONFLICT: /errors/conflict
 * - BIZ: /errors/biz
 * - INTERNAL: /errors/internal
 * - SERVICE_UNAVAILABLE: /errors/service-unavailable
 */
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
