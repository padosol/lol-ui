import { logger } from "@/shared/lib/logger";
import axios, { InternalAxiosRequestConfig } from "axios";
import { isRepositoryPath } from "./repositoryRoutes";

// 서버 전용 API 기본 URL 설정
// API_URL_INTERNAL: NEXT_PUBLIC_ 접두사 없음 → 서버에서만 접근 가능 (런타임 환경변수)
// Docker 내부 네트워크 URL (예: http://lol-server:8100/api) 사용
const SERVER_API_BASE_URL =
  process.env.API_URL_INTERNAL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8100/api";

// lol-repository 내부 URL (예: http://lol-repository:8080/api). 있으면 Riot 데이터 경로만 그쪽으로 보낸다.
// API_URL_INTERNAL 이 Ingress 를 거치지 않는 주소일 때 필요하다 — Ingress 처럼 경로로 갈라 주는
// 주소(로컬 nginx 등)라면 비워 둔다.
const REPOSITORY_API_BASE_URL = process.env.REPOSITORY_API_URL_INTERNAL;

export const serverApiClient = axios.create({
  baseURL: SERVER_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
serverApiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (REPOSITORY_API_BASE_URL && isRepositoryPath(config.url ?? "")) {
      config.baseURL = REPOSITORY_API_BASE_URL;
    }
    config.metadata = { startTime: Date.now() };
    logger.info("API Request", {
      method: config.method?.toUpperCase(),
      url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 응답 인터셉터 (에러 처리)
serverApiClient.interceptors.response.use(
  (response) => {
    const duration = response.config.metadata?.startTime
      ? Date.now() - response.config.metadata.startTime
      : undefined;
    logger.info("API Response", {
      method: response.config.method?.toUpperCase(),
      url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
      status: response.status,
      duration,
    });
    return response;
  },
  (error) => {
    const config = error.config as InternalAxiosRequestConfig | undefined;
    const duration = config?.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined;
    const method = config?.method?.toUpperCase();
    const url = config
      ? `${config.baseURL ?? ""}${config.url ?? ""}`
      : undefined;

    if (error.response) {
      const status: number = error.response.status;
      const statusText: string = error.response.statusText || "";
      const logCtx = { method, url, status, duration, error: statusText };

      if (status >= 500) {
        logger.error("API Server Error", logCtx);
      } else {
        logger.warn("API Error Response", logCtx);
      }
    } else if (error.request) {
      const isTimeout = error.code === "ECONNABORTED";
      const errorMsg = isTimeout
        ? `요청 시간이 초과되었습니다 (${error.message})`
        : `서버에 연결할 수 없습니다 (${error.message})`;
      logger.error("API No Response", {
        method,
        url,
        duration,
        error: errorMsg,
      });
    } else {
      logger.error("API Request Setup Error", {
        method,
        url,
        error: error.message,
      });
    }

    return Promise.reject(error);
  },
);
