import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 표시 이름은 messages 의 domain.region.<value> 에서 가져온다.
export const AVAILABLE_REGIONS = [
  { value: "kr", subLabel: "KR" },
  { value: "jp", subLabel: "JP" },
  { value: "na", subLabel: "NA" },
] as const

export type RegionValue = typeof AVAILABLE_REGIONS[number]['value']

interface RegionState {
  region: RegionValue
  setRegion: (region: RegionValue) => void
}

export const useRegionStore = create<RegionState>()(
  persist(
    (set) => ({
      region: 'kr',
      setRegion: (region) => set({ region }),
    }),
    { name: 'region-storage' }
  )
)
