import { logger } from "@/shared/lib/logger";
import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

// axios 타입 확장: 요청 시작 시간 기록용
declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
    _retry?: boolean;
  }
}

// API 기본 URL 설정 (환경 변수에서 가져오기)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰 갱신 동시성 제어
let isRefreshing = false;
let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach((prom) => {
    if (!error) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
}

function clearAuthStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth-storage");
  } catch {
    // ignore
  }
}

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
apiClient.interceptors.response.use(
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
    const config = originalRequest;
    const duration = config?.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : undefined;
    const method = config?.method?.toUpperCase();
    const url = config
      ? `${config.baseURL ?? ""}${config.url ?? ""}`
      : undefined;

    // 401 토큰 갱신 로직
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // 토큰 갱신/로그아웃 요청은 재시도하지 않음
      const requestUrl = originalRequest.url ?? "";
      if (requestUrl.includes("/auth/refresh") || requestUrl.includes("/auth/logout")) {
        clearAuthStorage();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 순환 방지를 위해 axios 직접 사용 (쿠키 자동 전송)
        await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        clearAuthStorage();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      // 서버에서 응답이 온 경우
      const status: number = error.response.status;
      const statusText: string = error.response.statusText || "";
      const logCtx = { method, url, status, duration, error: statusText };

      if (status >= 500) {
        logger.error("API Server Error", logCtx);
      } else {
        logger.warn("API Error Response", logCtx);
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
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
      // 요청 설정 중 오류가 발생한 경우
      logger.error("API Request Setup Error", {
        method,
        url,
        error: error.message,
      });
    }

    return Promise.reject(error);
  },
);

export default apiClient;
