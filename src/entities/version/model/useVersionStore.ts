import { getLatestVersion } from "../api/versionApi";
import type { Version } from "../types";
import { create } from "zustand";

interface VersionState {
  latestVersion: Version | null;
  isLoading: boolean;
  loadPromise: Promise<void> | null;
  loadLatestVersion: () => Promise<void>;
  getDataVersion: () => string | null;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  latestVersion: null,
  isLoading: false,
  loadPromise: null,

  /**
   * 게임 정적 데이터 경로에 쓰는 Data Dragon 버전.
   *
   * `versionValue`(예: 16.16) 로 대체하지 않는다 — CDN 은 데이터 버전(16.16.1)으로
   * 디렉토리를 나누므로 패치 버전을 보내면 404 가 난다. 값이 없으면 null 을 돌려
   * 번들된 `public/data` 폴백으로 떨어지는 편이 낫다.
   */
  getDataVersion: () => get().latestVersion?.patchVersionData ?? null,

  loadLatestVersion: async () => {
    const state = get();

    if (state.latestVersion) {
      return;
    }

    if (state.loadPromise) {
      return state.loadPromise;
    }

    const loadPromise = (async () => {
      set({ isLoading: true });
      try {
        const latestVersion = await getLatestVersion();
        set({ latestVersion, isLoading: false, loadPromise: null });
      } catch (error) {
        console.error("Failed to load latest version:", error);
        set({ isLoading: false, loadPromise: null });
      }
    })();

    set({ loadPromise });
    return loadPromise;
  },
}));
