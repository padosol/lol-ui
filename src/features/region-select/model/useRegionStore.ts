import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const AVAILABLE_REGIONS = [
  { value: "kr", label: "한국", subLabel: "KR" },
  { value: "jp", label: "일본", subLabel: "JP" },
  { value: "na", label: "북미", subLabel: "NA" },
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
