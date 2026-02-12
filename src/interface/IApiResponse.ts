import type { ApiResult, ErrorType } from "@/enums/apiResult.enum.ts";

/**
 * 필드별 유효성 검증 에러
 * - field: 에러 발생 필드명
 * - reason: 에러 사유
 */
export interface IFieldError {
    field: string;
    reason: string;
}

/**
 * Problem Details 기반 에러 상세
 * - type: 에러 유형 URI (예: /errors/validation)
 * - detail: 에러 상세 설명
 * - instance: 에러 발생 요청 URI
 * - fieldErrors: 필드 검증 에러 목록 (없으면 null)
 */
export interface IErrorDetail {
    type: ErrorType | string;
    detail: string;
    instance: string;
    fieldErrors: IFieldError[] | null;
}

/**
 * 공통 응답 래퍼 (ApiResponse<T>)
 * - result: 처리 결과 (SUCCESS | FAIL)
 * - code: 결과 코드 (예: S200, E400)
 * - message: 결과 메시지
 * - data: 실제 응답 데이터 (실패 시 null)
 * - error: 에러 상세 정보 (성공 시 null)
 */
export interface IApiResponse<T> {
    result: ApiResult;
    code: string;
    message: string;
    data: T | null;
    error: IErrorDetail | null;
}
