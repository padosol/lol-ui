import { IMAGE_HOST } from "@/shared/config/image";

export function getProfileIconImageUrl(profileIconId: number): string {
  if (!profileIconId || profileIconId === 0) {
    return "";
  }
  return `${IMAGE_HOST}/profile/${profileIconId}.png`;
}
