export type ApiError = { code: string; message: string; correlation_id: string };
export type HealthStatus = { status: 'ok' | 'degraded'; service: string; version: string };
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
