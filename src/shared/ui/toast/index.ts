export { Toaster } from "./Toaster";

/**
 * 호출부는 sonner 를 직접 import 하지 않고 이 seam 을 통해 쓴다.
 * 토스트 라이브러리를 교체할 때 바꿀 지점이 여기 하나로 모인다.
 */
export { toast } from "sonner";
