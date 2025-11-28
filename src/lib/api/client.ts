import axios from "axios";

// API 기본 URL 설정 (환경 변수에서 가져오기)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터 (인증 토큰 추가 등)
apiClient.interceptors.request.use(
  (config) => {
    // 필요시 인증 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 공통 에러 처리
    if (error.response) {
      // 서버에서 응답이 온 경우
      switch (error.response.status) {
        case 401:
          // 인증 에러 처리
          console.error("인증이 필요합니다.");
          break;
        case 404:
          console.error("요청한 리소스를 찾을 수 없습니다.");
          break;
        case 500:
          console.error("서버 오류가 발생했습니다.");
          break;
        default:
          console.error(
            "API 요청 중 오류가 발생했습니다:",
            error.response.data
          );
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못한 경우
      console.error("서버에 연결할 수 없습니다.");
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error("요청 설정 중 오류가 발생했습니다:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
